import { useEffect, useState } from 'react';
import { CONTRACT_ADDRESSES, HOLDER_ACCOUNTS, MORALIS_CHAIN_IDS } from '../constants';
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

type HolderSnapshot = HolderAccount & {
  balanceRaw: bigint;
  quantity: string;
  percentage: string;
};

type OnChainState = {
  isLoading: boolean;
  error?: string;
  totalSupplyRaw?: bigint;
  totalSupplyFormatted?: string;
  totalSupplyBillions?: string;
  decimals?: number;
  holders: HolderSnapshot[];
  holdersCount?: number;
  holdersChange?: number;
};

let cachedState: OnChainState | null = null;
let inflightPromise: Promise<OnChainState> | null = null;

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
  if (cachedState) {
    return cachedState;
  }
  if (inflightPromise) {
    return inflightPromise;
  }

  inflightPromise = (async () => {
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

      const filtered = holders
        .filter((holder) => holder.balanceRaw > 0n)
        .sort((a, b) => (b.balanceRaw > a.balanceRaw ? 1 : -1))
        .map((holder, index) => ({ ...holder, rank: index + 1 }));

      const state: OnChainState = {
        isLoading: false,
        totalSupplyRaw,
        totalSupplyFormatted,
        totalSupplyBillions,
        decimals,
        holders: filtered,
        holdersCount: moralisSummary.count,
        holdersChange: moralisSummary.change,
      };
      cachedState = state;
      return state;
    } catch (error) {
      console.error('JPYC on-chain fetch error', error);
      const state: OnChainState = {
        isLoading: false,
        error: error instanceof Error ? error.message : '不明なエラーが発生しました',
        holders: [],
      };
      cachedState = state;
      return state;
    } finally {
      inflightPromise = null;
    }
  })();

  return inflightPromise;
}

export const PRICE_PLACEHOLDER = 'Comming Soon';

export function useJpycOnChainData() {
  const [state, setState] = useState<OnChainState>(cachedState ?? { isLoading: true, holders: [] });

  useEffect(() => {
    let active = true;

    if (!state.isLoading && !state.error && state.totalSupplyRaw) {
      return () => {
        active = false;
      };
    }

    fetchOnChainState().then((data) => {
      if (!active) return;
      setState(data);
    });

    return () => {
      active = false;
    };
  }, []);

  return {
    ...state,
    holdersCount: state.holdersCount ?? state.holders.length,
    holdersChange: state.holdersChange,
  };
}
