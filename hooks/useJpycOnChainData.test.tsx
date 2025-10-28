import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useJpycOnChainDataWithSWR as useJpycOnChainData } from './useJpycOnChainDataWithSWR';

describe('useJpycOnChainData with SWR', () => {
  beforeEach(() => {
    // localStorage をクリア
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('キャッシュからの即座表示 (SWR)', () => {
    test('キャッシュが存在する場合、即座にキャッシュデータを返すこと', async () => {
      // キャッシュデータを事前に設定
      const cachedData = {
        isLoading: false,
        totalSupplyRaw: BigInt('1000000000000000000'),
        totalSupplyFormatted: '1,000,000.00',
        totalSupplyBillions: '1.00',
        decimals: 18,
        holders: [],
        holdersCount: 5000,
        holdersChange: 100,
      };

      // CacheManager を通じてキャッシュを設定
      const cacheManager = new (await import('../lib/CacheManager')).CacheManager();
      cacheManager.set('jpyc-onchain-data', cachedData);

      const { result } = renderHook(() => useJpycOnChainData());

      // 初回レンダリングでキャッシュデータが返される
      expect(result.current.isLoading).toBe(false);
      expect(result.current.totalSupplyFormatted).toBe('1,000,000.00');
    });

    test('isStale フラグがキャッシュデータ表示中に true になること', async () => {
      const cachedData = {
        isLoading: false,
        totalSupplyRaw: BigInt('1000000000000000000'),
        totalSupplyFormatted: '1,000,000.00',
        totalSupplyBillions: '1.00',
        decimals: 18,
        holders: [],
        holdersCount: 5000,
      };

      const cacheManager = new (await import('../lib/CacheManager')).CacheManager();
      cacheManager.set('jpyc-onchain-data', cachedData);

      const { result } = renderHook(() => useJpycOnChainData());

      // キャッシュデータ表示中は isStale が true
      expect(result.current.isStale).toBe(true);
    });
  });

  describe('バックグラウンド更新 (Revalidate)', () => {
    test('キャッシュデータ表示後、バックグラウンドで最新データを取得すること', async () => {
      const cachedData = {
        isLoading: false,
        totalSupplyRaw: BigInt('1000000000000000000'),
        totalSupplyFormatted: '1,000,000.00',
        totalSupplyBillions: '1.00',
        decimals: 18,
        holders: [],
        holdersCount: 5000,
      };

      const cacheManager = new (await import('../lib/CacheManager')).CacheManager();
      cacheManager.set('jpyc-onchain-data', cachedData);

      const { result } = renderHook(() => useJpycOnChainData());

      // 初回はキャッシュデータ
      expect(result.current.totalSupplyFormatted).toBe('1,000,000.00');
      expect(result.current.isStale).toBe(true);

      // バックグラウンド更新完了を待つ
      await waitFor(
        () => {
          expect(result.current.isStale).toBe(false);
        },
        { timeout: 10000 }
      );

      // 最新データに更新されている
      expect(result.current.isLoading).toBe(false);
    });

    test('バックグラウンド更新エラー時もキャッシュデータを維持すること', async () => {
      const cachedData = {
        isLoading: false,
        totalSupplyRaw: BigInt('1000000000000000000'),
        totalSupplyFormatted: '1,000,000.00',
        totalSupplyBillions: '1.00',
        decimals: 18,
        holders: [],
        holdersCount: 5000,
      };

      const cacheManager = new (await import('../lib/CacheManager')).CacheManager();
      cacheManager.set('jpyc-onchain-data', cachedData);

      // RPC 呼び出しをモックしてエラーを発生させる
      const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useJpycOnChainData());

      // キャッシュデータは保持される
      expect(result.current.totalSupplyFormatted).toBe('1,000,000.00');

      // エラーが発生してもキャッシュデータは維持
      await waitFor(
        () => {
          expect(result.current.totalSupplyFormatted).toBe('1,000,000.00');
        },
        { timeout: 5000 }
      );

      fetchSpy.mockRestore();
    });
  });

  describe('手動更新 (refresh)', () => {
    test('refresh メソッドで手動更新できること', async () => {
      const { result } = renderHook(() => useJpycOnChainData());

      // refresh メソッドが存在する
      expect(result.current.refresh).toBeDefined();
      expect(typeof result.current.refresh).toBe('function');

      // refresh を呼び出す
      if (result.current.refresh) {
        result.current.refresh();
      }

      // ローディング状態になる
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });
    });
  });

  describe('キャッシュミス時の動作', () => {
    test('キャッシュが存在しない場合、ローディング状態から開始すること', () => {
      const { result } = renderHook(() => useJpycOnChainData());

      // キャッシュがない場合はローディング
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isStale).toBe(false);
    });

    test('キャッシュが期限切れの場合、新規取得すること', async () => {
      // 期限切れのキャッシュを設定
      const expiredData = {
        isLoading: false,
        totalSupplyRaw: BigInt('1000000000000000000'),
        totalSupplyFormatted: '1,000,000.00',
        totalSupplyBillions: '1.00',
        decimals: 18,
        holders: [],
        holdersCount: 5000,
      };

      const cacheManager = new (await import('../lib/CacheManager')).CacheManager();
      cacheManager.set('jpyc-onchain-data', expiredData, 1); // 1ms TTL

      // 期限切れまで待つ
      await new Promise((resolve) => setTimeout(resolve, 10));

      const { result } = renderHook(() => useJpycOnChainData());

      // 期限切れの場合はローディング状態
      expect(result.current.isLoading).toBe(true);
    });
  });
});
