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
import { type HolderAccount } from '../types';

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
};

let cachedState: OnChainState | null = null;
let inflightPromise: Promise<OnChainState> | null = null;

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

      const [totalSupplyHex, decimals] = await Promise.all([
        callErc20TotalSupply('Ethereum', ethereumContract.address),
        callErc20Decimals('Ethereum', ethereumContract.address),
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
            console.error('Balance fetch failed', holder.address, err);
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
    holdersCount: state.holders.length,
  };
}
