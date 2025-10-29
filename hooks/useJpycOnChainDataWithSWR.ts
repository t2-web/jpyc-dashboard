import { useEffect, useState, useCallback } from 'react';
import { CacheManager } from '../lib/CacheManager';
import { CONTRACT_ADDRESSES, HOLDER_ACCOUNTS, MORALIS_CHAIN_IDS, SCAN_API_CONFIG } from '../constants';
import {
  callErc20Balance,
  callErc20Decimals,
  callErc20TotalSupply,
  ChainKey,
  formatBillions,
  formatPercentage,
  formatTokenAmount,
  hexToBigInt,
} from '../lib/onchain';
import { type HolderAccount, type SupportedChain } from '../types';
import { loadBlacklistAddresses } from '../lib/blacklist';
import { filterBlacklistedHolders } from '../lib/holderFilter';
import { calculateBlacklistedSupply, calculateCirculatingSupply } from '../lib/supplyCalculation';

type HolderSnapshot = HolderAccount & {
  balanceRaw: bigint;
  quantity: string;
  percentage: string;
};

type OnChainState = {
  isLoading: boolean;
  isStale?: boolean;
  error?: string;
  totalSupplyRaw?: bigint;
  totalSupplyFormatted?: string;
  totalSupplyBillions?: string;
  decimals?: number;
  holders: HolderSnapshot[];
  holdersCount?: number;
  holdersChange?: number;
  blacklistedSupply?: bigint;
  circulatingSupply?: bigint;
  refresh?: () => void;
};

const CACHE_KEY = 'jpyc-onchain-data';
const CACHE_TTL = 30 * 60 * 1000; // 30分

const cacheManager = new CacheManager();

const MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API_KEY;

interface MoralisHolderResponse {
  total?: number | string;
  total_24h?: number | string;
  total_change_24h?: number | string;
  summary?: Record<string, number | string>;
  pagination?: { total?: number | string };
  page_total?: number | string;
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

async function fetchScanHolderCount(chain: SupportedChain, address: string): Promise<number | undefined> {
  const config = SCAN_API_CONFIG[chain];
  if (!config) return undefined;
  const apiKey = import.meta.env[config.envKey as keyof ImportMetaEnv];
  if (!apiKey) return undefined;

  const url = new URL(config.baseUrl);
  url.searchParams.set('module', 'token');
  url.searchParams.set('action', 'tokenholdercount');
  url.searchParams.set('contractaddress', address);
  url.searchParams.set('apikey', String(apiKey));

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const data: { status?: string; message?: string; result?: string } = await response.json();
    if (data.status === '1' && data.result) {
      const parsed = Number(data.result);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    } else if (data.message) {
      console.warn(`Scan API (${chain}) responded with message: ${data.message}`);
    }
  } catch (error) {
    console.warn(`Scan API fetch failed (${chain})`, error);
  }

  return undefined;
}

async function fetchHolderSummary(): Promise<{ count?: number; change?: number }> {
  const uniqueContracts = new Map<SupportedChain, typeof CONTRACT_ADDRESSES[number]>();
  for (const contract of CONTRACT_ADDRESSES) {
    const chainKey = contract.chain as SupportedChain;
    if (!uniqueContracts.has(chainKey)) {
      uniqueContracts.set(chainKey, contract);
    }
  }

  const requests = Array.from(uniqueContracts.entries()).map(async ([chainKey, contract]) => {
    if (chainKey === 'Polygon') {
      const polygonCount = await fetchScanHolderCount(chainKey, contract.address);
      return { count: polygonCount, change: undefined };
    }

    const chainId = MORALIS_CHAIN_IDS[chainKey];
    if (!chainId || !MORALIS_API_KEY) {
      return { count: undefined, change: undefined };
    }

    const params = new URLSearchParams({
      chain: chainId,
      limit: '1',
      include: 'total_change_24h',
    });
    const url = `https://deep-index.moralis.io/api/v2.2/erc20/${contract.address}/holders?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'X-API-Key': MORALIS_API_KEY,
        },
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
      });

      if (!response.ok) {
        let errorMessage = `${response.status} ${response.statusText}`;
        try {
          const errorBody = await response.json();
          if (errorBody && typeof errorBody.message === 'string') {
            errorMessage += ` - ${errorBody.message}`;
          }
        } catch {
          // ignore
        }
        throw new Error(errorMessage);
      }

      const data: MoralisHolderResponse = await response.json();
      const total =
        parseNumber(data.total) ??
        parseNumber(data.page_total) ??
        parseNumber(data.pagination?.total) ??
        parseNumber(data.summary?.total) ??
        parseNumber(data.summary?.total_holders);

      let change =
        parseNumber(data.total_change_24h) ??
        parseNumber(data.summary?.total_change_24h) ??
        parseNumber(data.summary?.total_holders_change_24h);

      if (change === undefined) {
        const previousTotal =
          parseNumber(data.total_24h) ??
          parseNumber(data.summary?.total_24h) ??
          parseNumber(data.summary?.total_holders_24h);
        if (previousTotal !== undefined && total !== undefined) {
          change = total - previousTotal;
        }
      }

      return {
        count: total,
        change,
      };
    } catch (error) {
      console.error(`Moralis holders fetch failed (${chainKey})`, error);
      return { count: undefined, change: undefined };
    }
  });

  const results = await Promise.all(requests);
  let countTotal = 0;
  let changeTotal = 0;
  let hasCount = false;
  let hasChange = false;

  for (const res of results) {
    if (res.count !== undefined) {
      hasCount = true;
      countTotal += res.count;
    }
    if (res.change !== undefined) {
      hasChange = true;
      changeTotal += res.change;
    }
  }

  return {
    count: hasCount ? Math.round(countTotal) : undefined,
    change: hasChange && MORALIS_API_KEY ? Math.round(changeTotal) : undefined,
  };
}

async function fetchOnChainState(): Promise<OnChainState> {
  try {
    const ethereumContract = CONTRACT_ADDRESSES.find((c) => c.chain === 'Ethereum');
    if (!ethereumContract) {
      throw new Error('Ethereum の公式コントラクト情報が見つかりません');
    }

    const [totalSupplyHex, decimals, moralisSummary] = await Promise.all([
      callErc20TotalSupply('Ethereum', ethereumContract.address),
      callErc20Decimals('Ethereum', ethereumContract.address),
      fetchHolderSummary(),
    ]);
    const totalSupplyRaw = hexToBigInt(totalSupplyHex);
    const totalSupplyFormatted = formatTokenAmount(totalSupplyRaw, decimals, 2);
    const totalSupplyBillions = formatBillions(totalSupplyRaw, decimals);

    const holders = await Promise.all(
      HOLDER_ACCOUNTS.map(async (holder) => {
        const chainContract = CONTRACT_ADDRESSES.find((c) => c.chain === holder.chain);
        if (!chainContract) {
          return { ...holder, balanceRaw: 0n, quantity: '0', percentage: '0.00' };
        }

        try {
          const balanceHex = await callErc20Balance(holder.chain as ChainKey, chainContract.address, holder.address);
          const balanceRaw = hexToBigInt(balanceHex);
          return {
            ...holder,
            balanceRaw,
            quantity: formatTokenAmount(balanceRaw, decimals, 2),
            percentage: formatPercentage(balanceRaw, totalSupplyRaw),
          };
        } catch (err) {
          console.warn('Balance fetch failed', holder.address, err);
          return { ...holder, balanceRaw: 0n, quantity: '0', percentage: '0.00' };
        }
      })
    );

    // ブラックリストアドレスを読み込み
    const blacklistAddresses = loadBlacklistAddresses(import.meta.env);

    // ブラックリスト保有量を計算
    const blacklistedSupply = calculateBlacklistedSupply(holders, blacklistAddresses);

    // 流通供給量を計算
    const circulatingSupply = calculateCirculatingSupply(totalSupplyRaw, blacklistedSupply);

    // ブラックリストアドレスを除外してフィルタリング
    const filteredByBlacklist = filterBlacklistedHolders(holders, blacklistAddresses);

    const filtered = filteredByBlacklist
      .filter((holder) => holder.balanceRaw > 0n)
      .sort((a, b) => (b.balanceRaw > a.balanceRaw ? 1 : -1))
      .map((holder, index) => ({ ...holder, rank: index + 1 }));

    const state: OnChainState = {
      isLoading: false,
      isStale: false,
      totalSupplyRaw,
      totalSupplyFormatted,
      totalSupplyBillions,
      decimals,
      holders: filtered,
      holdersCount: moralisSummary.count,
      holdersChange: moralisSummary.change,
      blacklistedSupply,
      circulatingSupply,
    };

    // キャッシュに保存
    cacheManager.set(CACHE_KEY, state, CACHE_TTL);

    return state;
  } catch (error) {
    console.error('JPYC on-chain fetch error', error);
    const state: OnChainState = {
      isLoading: false,
      isStale: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      holders: [],
    };
    return state;
  }
}

export const PRICE_PLACEHOLDER = 'Comming Soon';

export function useJpycOnChainDataWithSWR() {
  const [state, setState] = useState<OnChainState>({ isLoading: true, holders: [] });
  const [isFetching, setIsFetching] = useState(false);

  const fetchData = useCallback(async (showStale: boolean = false) => {
    setIsFetching(true);

    try {
      const freshData = await fetchOnChainState();
      setState(freshData);
    } catch (error) {
      console.error('Failed to fetch fresh data:', error);
      // エラー時もキャッシュデータは維持
    } finally {
      setIsFetching(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    let active = true;

    // キャッシュからデータを取得
    const cached = cacheManager.get<OnChainState>(CACHE_KEY);

    if (cached) {
      // キャッシュヒット: Stale データとして即座に表示
      if (active) {
        setState({
          ...cached,
          isStale: true,
          isLoading: false,
          refresh,
        });
      }

      // バックグラウンドで最新データを取得 (Revalidate)
      fetchData(true).then(() => {
        if (active) {
          const freshData = cacheManager.get<OnChainState>(CACHE_KEY);
          if (freshData) {
            setState({
              ...freshData,
              isStale: false,
              refresh,
            });
          }
        }
      });
    } else {
      // キャッシュミス: 通常のローディング→データ表示
      fetchData(false).then(() => {
        if (active) {
          const freshData = cacheManager.get<OnChainState>(CACHE_KEY);
          if (freshData) {
            setState({
              ...freshData,
              refresh,
            });
          }
        }
      });
    }

    return () => {
      active = false;
    };
  }, [fetchData, refresh]);

  return {
    ...state,
    holdersCount: state.holdersCount ?? state.holders.length,
    holdersChange: state.holdersChange,
    refresh,
  };
}
