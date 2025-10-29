import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheManager } from './CacheManager';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  const TEST_KEY = 'test-key';
  const TEST_DATA = { value: 'test-data', number: 123 };
  const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  beforeEach(() => {
    // localStorage をクリア
    localStorage.clear();
    cacheManager = new CacheManager();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('TTL 付きキャッシュの基本機能', () => {
    test('データを保存し、取得できること', () => {
      cacheManager.set(TEST_KEY, TEST_DATA);
      const retrieved = cacheManager.get(TEST_KEY);

      expect(retrieved).toEqual(TEST_DATA);
    });

    test('存在しないキーに対して null を返すこと', () => {
      const retrieved = cacheManager.get('non-existent-key');

      expect(retrieved).toBeNull();
    });

    test('TTL が有効期限内であればデータを取得できること', () => {
      const ttl = 5000; // 5 seconds
      cacheManager.set(TEST_KEY, TEST_DATA, ttl);

      const retrieved = cacheManager.get(TEST_KEY);

      expect(retrieved).toEqual(TEST_DATA);
    });

    test('TTL が期限切れの場合 null を返すこと', () => {
      const ttl = 100; // 100ms
      cacheManager.set(TEST_KEY, TEST_DATA, ttl);

      // 200ms 待機
      vi.useFakeTimers();
      vi.advanceTimersByTime(200);

      const retrieved = cacheManager.get(TEST_KEY);

      expect(retrieved).toBeNull();
      vi.useRealTimers();
    });

    test('デフォルト TTL が 30 分であること', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      cacheManager.set(TEST_KEY, TEST_DATA);

      const cacheEntry = JSON.parse(localStorage.getItem(TEST_KEY) || '{}');
      const expectedExpiry = now + DEFAULT_TTL;

      expect(cacheEntry.expiry).toBe(expectedExpiry);
    });
  });

  describe('localStorage との統合', () => {
    test('データが localStorage に保存されること', () => {
      cacheManager.set(TEST_KEY, TEST_DATA);

      const stored = localStorage.getItem(TEST_KEY);

      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toHaveProperty('data');
      expect(JSON.parse(stored!)).toHaveProperty('expiry');
    });

    test('localStorage からデータを読み込めること', () => {
      cacheManager.set(TEST_KEY, TEST_DATA);

      // 新しい CacheManager インスタンスでも同じデータを取得できる
      const newCacheManager = new CacheManager();
      const retrieved = newCacheManager.get(TEST_KEY);

      expect(retrieved).toEqual(TEST_DATA);
    });

    test('localStorage が利用できない場合メモリキャッシュにフォールバックすること', () => {
      // localStorage.setItem をモック（エラーをスロー）
      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      cacheManager.set(TEST_KEY, TEST_DATA);

      // メモリキャッシュから取得できる
      const retrieved = cacheManager.get(TEST_KEY);

      expect(retrieved).toEqual(TEST_DATA);
      expect(setItemSpy).toHaveBeenCalled();
    });
  });

  describe('キャッシュ有効性チェック', () => {
    test('isValid メソッドが有効なキャッシュに対して true を返すこと', () => {
      cacheManager.set(TEST_KEY, TEST_DATA);

      const isValid = cacheManager.isValid(TEST_KEY);

      expect(isValid).toBe(true);
    });

    test('isValid メソッドが期限切れキャッシュに対して false を返すこと', () => {
      const ttl = 100; // 100ms
      cacheManager.set(TEST_KEY, TEST_DATA, ttl);

      vi.useFakeTimers();
      vi.advanceTimersByTime(200);

      const isValid = cacheManager.isValid(TEST_KEY);

      expect(isValid).toBe(false);
      vi.useRealTimers();
    });

    test('isValid メソッドが存在しないキーに対して false を返すこと', () => {
      const isValid = cacheManager.isValid('non-existent-key');

      expect(isValid).toBe(false);
    });
  });

  describe('BigInt データのシリアライゼーション', () => {
    test('BigInt を含むデータをキャッシュできること', () => {
      const data = {
        totalSupply: BigInt('1000000000000000000'),
        holders: 5000,
      };

      cacheManager.set(TEST_KEY, data);
      const retrieved = cacheManager.get(TEST_KEY);

      expect(retrieved).toEqual(data);
      expect(retrieved.totalSupply).toBe(BigInt('1000000000000000000'));
    });

    test('複雑なオブジェクトの BigInt をキャッシュできること', () => {
      const data = {
        ethereum: {
          totalSupply: BigInt('1000000000000000000'),
          holders: 5000,
        },
        polygon: {
          totalSupply: BigInt('2000000000000000000'),
          holders: 3000,
        },
      };

      cacheManager.set(TEST_KEY, data);
      const retrieved = cacheManager.get(TEST_KEY);

      expect(retrieved.ethereum.totalSupply).toBe(BigInt('1000000000000000000'));
      expect(retrieved.polygon.totalSupply).toBe(BigInt('2000000000000000000'));
    });

    test('新しいインスタンスで BigInt データを復元できること', () => {
      const data = {
        totalSupply: BigInt('1000000000000000000'),
        balance: BigInt('500000000000000000'),
      };

      cacheManager.set(TEST_KEY, data);

      // 新しいインスタンスで復元
      const newCacheManager = new CacheManager();
      const retrieved = newCacheManager.get(TEST_KEY);

      expect(retrieved.totalSupply).toBe(BigInt('1000000000000000000'));
      expect(retrieved.balance).toBe(BigInt('500000000000000000'));
    });
  });

  describe('LRU キャッシュ容量管理', () => {
    test('最古のキャッシュエントリを特定できること', () => {
      // 時系列でデータを追加
      vi.useFakeTimers();
      const baseTime = Date.now();

      vi.setSystemTime(baseTime);
      cacheManager.set('key1', { data: 'value1' });

      vi.setSystemTime(baseTime + 1000);
      cacheManager.set('key2', { data: 'value2' });

      vi.setSystemTime(baseTime + 2000);
      cacheManager.set('key3', { data: 'value3' });

      // 最古のエントリを削除
      const removed = cacheManager.removeOldest();

      expect(removed).toBe('key1');
      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toEqual({ data: 'value2' });
      expect(cacheManager.get('key3')).toEqual({ data: 'value3' });

      vi.useRealTimers();
    });

    test('アクセス時刻が更新されること (LRU)', () => {
      vi.useFakeTimers();
      const baseTime = Date.now();

      vi.setSystemTime(baseTime);
      cacheManager.set('key1', { data: 'value1' });

      vi.setSystemTime(baseTime + 1000);
      cacheManager.set('key2', { data: 'value2' });

      vi.setSystemTime(baseTime + 2000);
      cacheManager.set('key3', { data: 'value3' });

      // key1 にアクセスして最終アクセス時刻を更新
      vi.setSystemTime(baseTime + 3000);
      cacheManager.get('key1');

      // 最古のエントリは key2 になる
      const removed = cacheManager.removeOldest();

      expect(removed).toBe('key2');
      expect(cacheManager.get('key1')).toEqual({ data: 'value1' });
      expect(cacheManager.get('key2')).toBeNull();
      expect(cacheManager.get('key3')).toEqual({ data: 'value3' });

      vi.useRealTimers();
    });

    test('localStorage 容量超過時に最古のエントリを自動削除すること', () => {
      // localStorage.setItem が QuotaExceededError をスローするようにモック
      let callCount = 0;
      const maxEntries = 3;
      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
        callCount++;
        if (callCount > maxEntries) {
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        }
        // 実際に保存
        localStorage[key] = value;
      });

      vi.useFakeTimers();
      const baseTime = Date.now();

      // 最初の3つは成功
      vi.setSystemTime(baseTime);
      cacheManager.set('key1', { data: 'value1' });

      vi.setSystemTime(baseTime + 1000);
      cacheManager.set('key2', { data: 'value2' });

      vi.setSystemTime(baseTime + 2000);
      cacheManager.set('key3', { data: 'value3' });

      // 4つ目を追加する際にエラーが発生し、最古のkey1が削除される
      setItemSpy.mockRestore();
      vi.setSystemTime(baseTime + 3000);
      cacheManager.set('key4', { data: 'value4' });

      // key4 はメモリキャッシュに保存される
      expect(cacheManager.get('key4')).toEqual({ data: 'value4' });

      vi.useRealTimers();
    });

    test('キャッシュサイズを取得できること', () => {
      cacheManager.set('key1', { data: 'value1' });
      cacheManager.set('key2', { data: 'value2' });
      cacheManager.set('key3', { data: 'value3' });

      const size = cacheManager.size();

      expect(size).toBe(3);
    });

    test('空のキャッシュで removeOldest が null を返すこと', () => {
      const removed = cacheManager.removeOldest();

      expect(removed).toBeNull();
    });
  });

  describe('キャッシュクリア機能', () => {
    test('clear メソッドが単一キーのキャッシュを削除すること', () => {
      cacheManager.set(TEST_KEY, TEST_DATA);

      cacheManager.clear(TEST_KEY);

      const retrieved = cacheManager.get(TEST_KEY);
      expect(retrieved).toBeNull();
    });

    test('clearAll メソッドがすべてのキャッシュを削除すること', () => {
      const testData1 = { data: 'value1' };
      const testData2 = { data: 'value2' };
      const testData3 = { data: 'value3' };

      cacheManager.set('key1', testData1);
      cacheManager.set('key2', testData2);
      cacheManager.set('key3', testData3);

      // 保存されたことを確認
      expect(cacheManager.get('key1')).toEqual(testData1);
      expect(cacheManager.get('key2')).toEqual(testData2);
      expect(cacheManager.get('key3')).toEqual(testData3);

      // すべてクリア
      cacheManager.clearAll();

      // すべて削除されたことを確認
      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBeNull();
      expect(cacheManager.get('key3')).toBeNull();
    });
  });
});
