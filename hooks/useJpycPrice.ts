import { useEffect, useState } from 'react';
import { type CoinGeckoPriceData } from '../types';
import { fetchJpycPrice } from '../lib/coingecko';

interface PriceState {
  isLoading: boolean;
  error?: string;
  data?: CoinGeckoPriceData;
}

let cachedPrice: PriceState | null = null;
let inflightRequest: Promise<PriceState> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60_000; // 1分間キャッシュ

async function fetchPriceData(): Promise<PriceState> {
  const now = Date.now();

  // キャッシュが有効な場合は返す
  if (cachedPrice && now - cacheTimestamp < CACHE_DURATION) {
    console.log('💰 [Price] Using cached price data');
    return cachedPrice;
  }

  // 既にリクエスト中の場合は待つ
  if (inflightRequest) {
    console.log('💰 [Price] Waiting for inflight request');
    return inflightRequest;
  }

  inflightRequest = (async () => {
    try {
      console.log('💰 [Price] Fetching fresh price data');
      const response = await fetchJpycPrice();
      const state: PriceState = {
        isLoading: false,
        data: response.jpycoin,
      };
      cachedPrice = state;
      cacheTimestamp = Date.now();
      return state;
    } catch (error) {
      console.error('❌ [Price] Failed to fetch price data:', error);
      const state: PriceState = {
        isLoading: false,
        error: error instanceof Error ? error.message : '価格データの取得に失敗しました',
      };
      cachedPrice = state;
      cacheTimestamp = Date.now();
      return state;
    } finally {
      inflightRequest = null;
    }
  })();

  return inflightRequest;
}

export function useJpycPrice() {
  const [state, setState] = useState<PriceState>(
    cachedPrice ?? { isLoading: true }
  );

  useEffect(() => {
    let active = true;

    // キャッシュがあり、有効期限内の場合は再取得しない
    if (!state.isLoading && state.data && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return () => {
        active = false;
      };
    }

    fetchPriceData().then((data) => {
      if (!active) return;
      setState(data);
    });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
