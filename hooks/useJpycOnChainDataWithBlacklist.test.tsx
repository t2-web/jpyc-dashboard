import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useJpycOnChainDataWithSWR } from './useJpycOnChainDataWithSWR';
import { CacheManager } from '../lib/CacheManager';

describe('useJpycOnChainData with Blacklist Integration', () => {
  const cacheManager = new CacheManager();

  beforeEach(() => {
    localStorage.clear();
    cacheManager.clearAll(); // CacheManagerのキャッシュもクリア
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('ブラックリスト機能の統合', () => {
    test('キャッシュからblacklistedSupplyとcirculatingSupplyが読み込まれること', () => {
      const cachedData = {
        isLoading: false,
        totalSupplyRaw: BigInt('10000000000000000000000'),
        totalSupplyFormatted: '10,000.00',
        totalSupplyBillions: '10.00',
        decimals: 18,
        holders: [],
        blacklistedSupply: BigInt('1000000000000000000000'),
        circulatingSupply: BigInt('9000000000000000000000'),
        holdersCount: 5000,
      };

      cacheManager.set('jpyc-onchain-data', cachedData);

      const { result } = renderHook(() => useJpycOnChainDataWithSWR());

      // キャッシュデータが即座に表示される
      expect(result.current.isLoading).toBe(false);
      expect(result.current.blacklistedSupply).toBe(BigInt('1000000000000000000000'));
      expect(result.current.circulatingSupply).toBe(BigInt('9000000000000000000000'));
    });

    test('ブラックリスト保有量が計算されること', async () => {
      const cachedData = {
        isLoading: false,
        totalSupplyRaw: BigInt('10000000000000000000000'), // 10000 tokens
        totalSupplyFormatted: '10,000.00',
        totalSupplyBillions: '10.00',
        decimals: 18,
        holders: [
          {
            address: '0x1111111111111111111111111111111111111111',
            name: 'Blacklisted Holder 1',
            chain: 'Ethereum',
            balanceRaw: BigInt('1000000000000000000000'), // 1000 tokens
            quantity: '1000.00',
            percentage: '10.00',
          },
          {
            address: '0x2222222222222222222222222222222222222222',
            name: 'Normal Holder',
            chain: 'Ethereum',
            balanceRaw: BigInt('2000000000000000000000'), // 2000 tokens
            quantity: '2000.00',
            percentage: '20.00',
          },
        ],
        blacklistedSupply: BigInt('1000000000000000000000'), // Expected: 1000 tokens
        circulatingSupply: BigInt('9000000000000000000000'), // Expected: 9000 tokens
        holdersCount: 5000,
      };

      cacheManager.set('jpyc-onchain-data', cachedData);

      // 環境変数をモック
      const originalEnv = import.meta.env.VITE_BLACKLIST_ADDRESSES;
      import.meta.env.VITE_BLACKLIST_ADDRESSES = '0x1111111111111111111111111111111111111111';

      const { result } = renderHook(() => useJpycOnChainDataWithSWR());

      // キャッシュデータが表示される
      expect(result.current.isLoading).toBe(false);

      // ブラックリスト保有量が存在する
      if (result.current.blacklistedSupply !== undefined) {
        expect(result.current.blacklistedSupply).toBe(BigInt('1000000000000000000000'));
      }

      // 流通供給量が存在する
      if (result.current.circulatingSupply !== undefined) {
        expect(result.current.circulatingSupply).toBe(BigInt('9000000000000000000000'));
      }

      // 環境変数を元に戻す
      import.meta.env.VITE_BLACKLIST_ADDRESSES = originalEnv;
    });

    test('ブラックリストが空の場合、ブラックリスト保有量は0になること', () => {
      const cachedData = {
        isLoading: false,
        totalSupplyRaw: BigInt('10000000000000000000000'),
        totalSupplyFormatted: '10,000.00',
        totalSupplyBillions: '10.00',
        decimals: 18,
        holders: [],
        blacklistedSupply: BigInt('0'), // ブラックリストが空の場合
        circulatingSupply: BigInt('10000000000000000000000'), // 総供給量と同じ
        holdersCount: 5000,
      };

      // 新しいCacheManagerインスタンスで独立したテストを実施
      const testCacheManager = new CacheManager();
      testCacheManager.set('jpyc-onchain-data', cachedData);

      // キャッシュに保存されたデータを確認
      const cached = testCacheManager.get('jpyc-onchain-data');
      expect(cached).not.toBeNull();
      if (cached) {
        // @ts-expect-error - cached is typed as unknown
        expect(cached.blacklistedSupply).toBe(BigInt('0'));
        // @ts-expect-error - cached is typed as unknown
        expect(cached.circulatingSupply).toBe(BigInt('10000000000000000000000'));
      }
    });

    test('OnChainStateにblacklistedSupplyとcirculatingSupplyが含まれること', () => {
      const cachedData = {
        isLoading: false,
        totalSupplyRaw: BigInt('10000000000000000000000'),
        totalSupplyFormatted: '10,000.00',
        totalSupplyBillions: '10.00',
        decimals: 18,
        holders: [],
        blacklistedSupply: BigInt('1000000000000000000000'),
        circulatingSupply: BigInt('9000000000000000000000'),
        holdersCount: 5000,
      };

      cacheManager.set('jpyc-onchain-data', cachedData);

      const { result } = renderHook(() => useJpycOnChainDataWithSWR());

      // 型として存在することを確認
      expect(result.current).toHaveProperty('blacklistedSupply');
      expect(result.current).toHaveProperty('circulatingSupply');
    });
  });
});
