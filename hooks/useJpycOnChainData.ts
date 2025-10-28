import { useEffect, useState } from 'react';
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

type HolderSnapshot = HolderAccount & {
  balanceRaw: bigint;
  quantity: string;
  percentage: string;
};

type ChainDistribution = {
  chain: SupportedChain;
  supply: bigint;
  supplyFormatted: string;
  supplyPercentage: number;
  holdersCount?: number;
  holdersPercentage?: number;
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
  chainDistribution?: ChainDistribution[];
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

async function fetchScanTokenSupply(chain: SupportedChain, address: string): Promise<bigint | undefined> {
  console.log(`🔍 [Scan API Supply] Attempting to fetch token supply for ${chain}`);
  const config = SCAN_API_CONFIG[chain];
  if (!config) {
    console.warn(`⚠️ [Scan API Supply] No config found for ${chain}`);
    return undefined;
  }
  const apiKey = import.meta.env[config.envKey as keyof ImportMetaEnv];
  if (!apiKey) {
    console.warn(`⚠️ [Scan API Supply] No API key found for ${chain} (${config.envKey})`);
    return undefined;
  }
  console.log(`✅ [Scan API Supply] Config and API key found for ${chain}, fetching...`);

  const url = new URL(config.baseUrl);
  // chainIdがある場合（Polygon等のv2 API）は追加
  if (config.chainId) {
    url.searchParams.set('chainid', config.chainId);
  }
  url.searchParams.set('module', 'stats');
  url.searchParams.set('action', 'tokensupply');
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
    console.log(`🔍 [Scan API Supply] ${chain} Response:`, data);
    if (data.status === '1' && data.result) {
      const supply = BigInt(data.result);
      console.log(`✅ [Scan API Supply] ${chain} Token Supply:`, supply.toString());
      return supply;
    } else if (data.message) {
      console.warn(`Scan API Supply (${chain}) responded with message: ${data.message}`);
    }
  } catch (error) {
    console.warn(`Scan API Supply fetch failed (${chain})`, error);
  }

  return undefined;
}

async function fetchScanHolderCount(chain: SupportedChain, address: string): Promise<number | undefined> {
  console.log(`🔍 [Scan API] Attempting to fetch holder count for ${chain}`);
  const config = SCAN_API_CONFIG[chain];
  if (!config) {
    console.warn(`⚠️ [Scan API] No config found for ${chain}`);
    return undefined;
  }
  const apiKey = import.meta.env[config.envKey as keyof ImportMetaEnv];
  if (!apiKey) {
    console.warn(`⚠️ [Scan API] No API key found for ${chain} (${config.envKey})`);
    return undefined;
  }
  console.log(`✅ [Scan API] Config and API key found for ${chain}, fetching...`);

  const url = new URL(config.baseUrl);
  // chainIdがある場合（Polygon等のv2 API）は追加
  if (config.chainId) {
    url.searchParams.set('chainid', config.chainId);
  }
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
    console.log(`🔍 [Scan API] ${chain} Response:`, data);
    if (data.status === '1' && data.result) {
      const parsed = Number(data.result);
      if (Number.isFinite(parsed)) {
        console.log(`✅ [Scan API] ${chain} Holder Count:`, parsed);
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

/**
 * ブラックリストアドレスの保有量を取得
 */
async function fetchBlacklistBalance(chain: SupportedChain, tokenAddress: string, blacklistAddress: string): Promise<bigint | undefined> {
  console.log(`🔍 [Blacklist Balance] Fetching balance for ${blacklistAddress} on ${chain}`);
  const config = SCAN_API_CONFIG[chain];
  if (!config) {
    console.warn(`⚠️ [Blacklist Balance] No config found for ${chain}`);
    return undefined;
  }
  const apiKey = import.meta.env[config.envKey as keyof ImportMetaEnv];
  if (!apiKey) {
    console.warn(`⚠️ [Blacklist Balance] No API key found for ${chain} (${config.envKey})`);
    return undefined;
  }

  const url = new URL(config.baseUrl);
  // chainIdがある場合（Polygon等のv2 API）は追加
  if (config.chainId) {
    url.searchParams.set('chainid', config.chainId);
  }
  url.searchParams.set('module', 'account');
  url.searchParams.set('action', 'tokenbalance');
  url.searchParams.set('contractaddress', tokenAddress);
  url.searchParams.set('address', blacklistAddress);
  url.searchParams.set('tag', 'latest');
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
    console.log(`🔍 [Blacklist Balance] ${chain} Response:`, data);
    if (data.status === '1' && data.result) {
      const balance = BigInt(data.result);
      console.log(`✅ [Blacklist Balance] ${chain} ${blacklistAddress}: ${balance.toString()}`);
      return balance;
    } else if (data.message) {
      console.warn(`Blacklist Balance API (${chain}) responded with message: ${data.message}`);
    }
  } catch (error) {
    console.warn(`Blacklist Balance fetch failed (${chain})`, error);
  }

  return undefined;
}

/**
 * チェーンごとのブラックリスト合計保有量を取得
 */
async function fetchTotalBlacklistBalance(chain: SupportedChain, tokenAddress: string): Promise<bigint> {
  console.log(`🔍 [Total Blacklist] Fetching total blacklist balance for ${chain}`);

  // 環境変数からブラックリストアドレスを取得
  const blacklistEnv = import.meta.env.VITE_BLACKLIST_ADDRESSES;
  if (!blacklistEnv || blacklistEnv.trim() === '') {
    console.log(`ℹ️ [Total Blacklist] No blacklist addresses configured for ${chain}`);
    return 0n;
  }

  const blacklistAddresses = blacklistEnv.split(',').map(addr => addr.trim()).filter(addr => addr !== '');
  console.log(`📋 [Total Blacklist] ${chain} blacklist addresses:`, blacklistAddresses);

  let totalBlacklisted = 0n;
  for (const address of blacklistAddresses) {
    const balance = await fetchBlacklistBalance(chain, tokenAddress, address);
    if (balance !== undefined) {
      totalBlacklisted += balance;
    }
  }

  console.log(`✅ [Total Blacklist] ${chain} total blacklisted: ${totalBlacklisted.toString()}`);
  return totalBlacklisted;
}

async function fetchHolderSummary(): Promise<{
  count?: number;
  change?: number;
  byChain: Map<SupportedChain, { count?: number; change?: number }>;
}> {
  console.log('📊 [Holder Summary] Starting holder count fetch...');
  const uniqueContracts = new Map<SupportedChain, typeof CONTRACT_ADDRESSES[number]>();
  for (const contract of CONTRACT_ADDRESSES) {
    const chainKey = contract.chain as SupportedChain;
    if (!uniqueContracts.has(chainKey)) {
      uniqueContracts.set(chainKey, contract);
    }
  }
  console.log('📊 [Holder Summary] Unique chains:', Array.from(uniqueContracts.keys()));

  const requests = Array.from(uniqueContracts.entries()).map(async ([chainKey, contract]) => {
    console.log(`📊 [Holder Summary] Processing ${chainKey}...`);

    // すべてのチェーンでScan APIを試してから、失敗時にMoralis APIにフォールバック
    const scanCount = await fetchScanHolderCount(chainKey, contract.address);
    if (scanCount !== undefined) {
      console.log(`✅ [Holder Summary] ${chainKey} holder count from Scan API: ${scanCount}`);
      return { chain: chainKey, count: scanCount, change: undefined };
    }

    console.log(`⚠️ [Holder Summary] Scan API failed for ${chainKey}, trying Moralis API...`);

    const chainId = MORALIS_CHAIN_IDS[chainKey];
    console.log(`🔍 [Holder Summary] Using Moralis API for ${chainKey} (chainId: ${chainId})`);
    if (!chainId) {
      console.warn(`⚠️ [Moralis API] No chain ID found for ${chainKey}`);
      return { chain: chainKey, count: undefined, change: undefined };
    }
    if (!MORALIS_API_KEY) {
      console.warn(`⚠️ [Moralis API] No API key found (VITE_MORALIS_API_KEY)`);
      return { chain: chainKey, count: undefined, change: undefined };
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
      console.log(`🔍 [Moralis API] ${chainKey} Response:`, data);

      const total =
        parseNumber((data as any).totalHolders) ??
        parseNumber(data.total) ??
        parseNumber(data.page_total) ??
        parseNumber(data.pagination?.total) ??
        parseNumber(data.summary?.total) ??
        parseNumber(data.summary?.total_holders);

      let change =
        parseNumber((data as any).totalHoldersChange24h) ??
        parseNumber((data as any).totalHoldersChange) ??
        parseNumber(data.total_change_24h) ??
        parseNumber(data.summary?.total_change_24h) ??
        parseNumber(data.summary?.total_holders_change_24h);

      if (change === undefined) {
        const previousTotal =
          parseNumber((data as any).totalHolders24h) ??
          parseNumber(data.total_24h) ??
          parseNumber(data.summary?.total_24h) ??
          parseNumber(data.summary?.total_holders_24h);
        if (previousTotal !== undefined && total !== undefined) {
          change = total - previousTotal;
        }
      }

      console.log(`✅ [Moralis API] ${chainKey} Parsed:`, { count: total, change });

      return {
        chain: chainKey,
        count: total,
        change,
      };
    } catch (error) {
      console.error(`Moralis holders fetch failed (${chainKey})`, error);
      return { chain: chainKey, count: undefined, change: undefined };
    }
  });

  const results = await Promise.all(requests);
  console.log('📊 [Holder Summary] All Chain Results:', results);

  let countTotal = 0;
  let changeTotal = 0;
  let hasCount = false;
  let hasChange = false;

  const byChain = new Map<SupportedChain, { count?: number; change?: number }>();

  for (const res of results) {
    byChain.set(res.chain, { count: res.count, change: res.change });

    if (res.count !== undefined) {
      hasCount = true;
      countTotal += res.count;
    }
    if (res.change !== undefined) {
      hasChange = true;
      changeTotal += res.change;
    }
  }

  const summary = {
    count: hasCount ? Math.round(countTotal) : undefined,
    change: hasChange && MORALIS_API_KEY ? Math.round(changeTotal) : undefined,
    byChain,
  };

  console.log('✅ [Holder Summary] Final:', summary);

  return summary;
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
      const totalSupplyRawBeforeBlacklist = hexToBigInt(totalSupplyHex);

      // Ethereumチェーンのブラックリスト保有量を取得
      console.log('🔍 [Ethereum Supply] Fetching blacklist balances for Ethereum...');
      const ethereumBlacklistBalance = await fetchTotalBlacklistBalance('Ethereum', ethereumContract.address);
      const totalSupplyRaw = totalSupplyRawBeforeBlacklist - ethereumBlacklistBalance;

      console.log('📊 [Ethereum Supply] Adjustment:', {
        rawSupply: totalSupplyRawBeforeBlacklist.toString(),
        blacklisted: ethereumBlacklistBalance.toString(),
        adjusted: totalSupplyRaw.toString(),
        rawFormatted: formatTokenAmount(totalSupplyRawBeforeBlacklist, decimals, 2),
        blacklistedFormatted: formatTokenAmount(ethereumBlacklistBalance, decimals, 2),
        adjustedFormatted: formatTokenAmount(totalSupplyRaw, decimals, 2),
      });

      const totalSupplyFormatted = formatTokenAmount(totalSupplyRaw, decimals, 2);
      const totalSupplyBillions = formatBillions(totalSupplyRaw, decimals);

      // 実際の値をログ出力
      console.log('📊 [OnChain Data] Total Supply (After Blacklist):', {
        raw: totalSupplyRaw.toString(),
        formatted: totalSupplyFormatted,
        billions: totalSupplyBillions,
        decimals,
      });
      console.log('👥 [OnChain Data] Holders:', {
        count: moralisSummary.count,
        change: moralisSummary.change,
      });

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

      // 各チェーンの総供給量を取得
      console.log('📊 [Chain Supply] Starting supply fetch for all chains...');
      const chainSupplies = await Promise.all(
        CONTRACT_ADDRESSES.filter((c) => c.chain === 'Ethereum' || c.chain === 'Polygon' || c.chain === 'Avalanche').map(
          async (contract) => {
            console.log(`🔍 [Chain Supply] Fetching ${contract.chain} supply from ${contract.address}`);
            let rawSupply = 0n;

            try {
              // まずRPC経由で取得を試みる
              const supplyHex = await callErc20TotalSupply(contract.chain as ChainKey, contract.address);
              rawSupply = hexToBigInt(supplyHex);
              console.log(`✅ [Chain Supply] ${contract.chain} (RPC): ${rawSupply.toString()} (${formatTokenAmount(rawSupply, decimals, 2)} JPYC)`);
            } catch (error) {
              console.warn(`⚠️ [Chain Supply] RPC failed for ${contract.chain}, trying Scan API...`, error);
              // RPC失敗時はScan APIにフォールバック
              try {
                const scanSupply = await fetchScanTokenSupply(contract.chain as SupportedChain, contract.address);
                if (scanSupply !== undefined) {
                  rawSupply = scanSupply;
                  console.log(`✅ [Chain Supply] ${contract.chain} (Scan API): ${rawSupply.toString()} (${formatTokenAmount(rawSupply, decimals, 2)} JPYC)`);
                }
              } catch (scanError) {
                console.error(`❌ [Chain Supply] Scan API also failed for ${contract.chain}:`, scanError);
              }
              if (rawSupply === 0n) {
                console.error(`❌ [Chain Supply] All methods failed for ${contract.chain}`);
                return { chain: contract.chain as SupportedChain, supply: 0n };
              }
            }

            // ブラックリストアドレスの保有量を取得して差し引く
            console.log(`🔍 [Chain Supply] Fetching blacklist balances for ${contract.chain}...`);
            const blacklistBalance = await fetchTotalBlacklistBalance(contract.chain as SupportedChain, contract.address);
            const adjustedSupply = rawSupply - blacklistBalance;
            console.log(`📊 [Chain Supply] ${contract.chain} Adjustment:`, {
              rawSupply: rawSupply.toString(),
              blacklisted: blacklistBalance.toString(),
              adjusted: adjustedSupply.toString(),
              rawFormatted: formatTokenAmount(rawSupply, decimals, 2),
              blacklistedFormatted: formatTokenAmount(blacklistBalance, decimals, 2),
              adjustedFormatted: formatTokenAmount(adjustedSupply, decimals, 2),
            });

            return { chain: contract.chain as SupportedChain, supply: adjustedSupply };
          }
        )
      );

      // チェーンごとに集計（重複排除）
      const chainSupplyMap = new Map<SupportedChain, bigint>();
      for (const { chain, supply } of chainSupplies) {
        if (!chainSupplyMap.has(chain) || chainSupplyMap.get(chain)! < supply) {
          chainSupplyMap.set(chain, supply);
        }
      }

      // chainDistributionを作成
      const chainDistribution: ChainDistribution[] = Array.from(chainSupplyMap.entries()).map(([chain, supply]) => {
        const supplyPercentage = totalSupplyRaw > 0n ? Number((supply * 10000n) / totalSupplyRaw) / 100 : 0;
        const holdersData = moralisSummary.byChain.get(chain);
        const holdersCount = holdersData?.count;
        const holdersPercentage =
          holdersCount !== undefined && moralisSummary.count
            ? (holdersCount / moralisSummary.count) * 100
            : undefined;

        return {
          chain,
          supply,
          supplyFormatted: formatTokenAmount(supply, decimals, 2),
          supplyPercentage,
          holdersCount,
          holdersPercentage,
        };
      });

      console.log('📊 [OnChain Data] Chain Distribution:', chainDistribution);

      const state: OnChainState = {
        isLoading: false,
        totalSupplyRaw,
        totalSupplyFormatted,
        totalSupplyBillions,
        decimals,
        holders: filtered,
        holdersCount: moralisSummary.count,
        holdersChange: moralisSummary.change,
        chainDistribution,
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
