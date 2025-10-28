import { type CoinGeckoResponse } from '../types';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

/**
 * CoinGecko APIからJPYCの価格データを取得
 */
export async function fetchJpycPrice(): Promise<CoinGeckoResponse> {
  const url = `${COINGECKO_API_BASE}/simple/price?ids=jpycoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data: CoinGeckoResponse = await response.json();
    console.log('💰 [CoinGecko] Price Data:', data);

    return data;
  } catch (error) {
    console.error('❌ [CoinGecko] Failed to fetch price data:', error);
    throw error;
  }
}

/**
 * 価格をフォーマット (例: 0.00663564 → "$0.0066")
 */
export function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  }
  // 小数点以下の桁数を動的に決定
  const significantDigits = Math.ceil(-Math.log10(price)) + 2;
  return `$${price.toFixed(Math.min(significantDigits, 8))}`;
}

/**
 * ボリュームをフォーマット (例: 17528.96 → "$17.5K")
 */
export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(1)}K`;
  }
  return `$${volume.toFixed(2)}`;
}

/**
 * 変化率をフォーマット (例: 0.301 → "+0.30%")
 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * 時価総額をフォーマット (例: 7962754.48 → "$7.96M")
 */
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
  }
  if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  }
  if (marketCap >= 1_000) {
    return `$${(marketCap / 1_000).toFixed(2)}K`;
  }
  return `$${marketCap.toFixed(2)}`;
}
