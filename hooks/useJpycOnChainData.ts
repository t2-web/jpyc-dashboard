import { useEffect, useState } from 'react';
import { CONTRACT_ADDRESSES, HOLDER_ACCOUNTS } from '../constants';
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
};

type OnChainState = {
  isLoading: boolean;
  error?: string;
  totalSupplyRaw?: bigint;
  totalSupplyFormatted?: string;
  totalSupplyBillions?: string;
  decimals?: number;
  holders: HolderSnapshot[];
  chainDistribution?: ChainDistribution[];
};

let cachedState: OnChainState | null = null;
let inflightPromise: Promise<OnChainState> | null = null;

/**
 * ブラックリストアドレスの保有量を取得（RPC経由）
 */
async function fetchBlacklistBalance(chain: SupportedChain, tokenAddress: string, blacklistAddress: string): Promise<bigint> {
  console.log(`🔍 [Blacklist Balance] Fetching balance for ${blacklistAddress} on ${chain} via RPC`);

  try {
    const balanceHex = await callErc20Balance(chain as ChainKey, tokenAddress, blacklistAddress);
    const balance = hexToBigInt(balanceHex);
    console.log(`✅ [Blacklist Balance] ${chain} ${blacklistAddress}: ${balance.toString()}`);
    return balance;
  } catch (error) {
    console.error(`❌ [Blacklist Balance] RPC failed for ${chain} ${blacklistAddress}:`, error);
    return 0n;
  }
}

/**
 * チェーンごとのブラックリスト合計保有量を取得（RPC経由）
 */
async function fetchTotalBlacklistBalance(chain: SupportedChain, tokenAddress: string): Promise<bigint> {
  console.log(`🔍 [Total Blacklist] Fetching total blacklist balance for ${chain} via RPC`);

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
    totalBlacklisted += balance;
  }

  console.log(`✅ [Total Blacklist] ${chain} total blacklisted: ${totalBlacklisted.toString()}`);
  return totalBlacklisted;
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

      // decimalsを取得（全チェーンで同じと仮定）
      const decimals = await callErc20Decimals('Ethereum', ethereumContract.address);

      // 各チェーンの総供給量を取得（RPCのみ使用）
      console.log('📊 [Chain Supply] Starting supply fetch for all chains...');
      const chainSupplies = await Promise.all(
        CONTRACT_ADDRESSES.filter((c) => c.chain === 'Ethereum' || c.chain === 'Polygon' || c.chain === 'Avalanche').map(
          async (contract) => {
            console.log(`🔍 [Chain Supply] Fetching ${contract.chain} supply from ${contract.address}`);

            try {
              // RPC経由でTotal Supplyを取得
              const supplyHex = await callErc20TotalSupply(contract.chain as ChainKey, contract.address);
              const rawSupply = hexToBigInt(supplyHex);
              console.log(`✅ [Chain Supply] ${contract.chain} (RPC): ${rawSupply.toString()} (${formatTokenAmount(rawSupply, decimals, 2)} JPYC)`);

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
            } catch (error) {
              console.error(`❌ [Chain Supply] RPC failed for ${contract.chain}:`, error);
              return { chain: contract.chain as SupportedChain, supply: 0n };
            }
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

      // 全チェーンの総供給量を合計
      const totalSupplyRaw = Array.from(chainSupplyMap.values()).reduce((sum, supply) => sum + supply, 0n);

      console.log('📊 [Total Supply] All Chains Combined:', {
        raw: totalSupplyRaw.toString(),
        formatted: formatTokenAmount(totalSupplyRaw, decimals, 2),
        chains: Array.from(chainSupplyMap.entries()).map(([chain, supply]) => ({
          chain,
          supply: supply.toString(),
          formatted: formatTokenAmount(supply, decimals, 2),
        })),
      });

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

      // chainDistributionを作成（既に取得済みのchainSupplyMapを使用）
      const chainDistribution: ChainDistribution[] = Array.from(chainSupplyMap.entries()).map(([chain, supply]) => {
        const supplyPercentage = totalSupplyRaw > 0n ? Number((supply * 10000n) / totalSupplyRaw) / 100 : 0;

        return {
          chain,
          supply,
          supplyFormatted: formatTokenAmount(supply, decimals, 2),
          supplyPercentage,
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
