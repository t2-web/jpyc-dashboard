/**
 * CacheManager - TTL付きローカルストレージキャッシュマネージャー
 *
 * localStorage にデータを保存し、TTL (Time To Live) に基づいてキャッシュの有効性を管理します。
 * localStorage が利用できない場合はメモリキャッシュにフォールバックします。
 * BigInt と Date を含むデータのシリアライゼーションをサポートします。
 */

import { serialize, deserialize } from './serializer';

interface CacheEntry<T = unknown> {
  data: T;
  expiry: number; // Unix timestamp (ms)
  lastAccessed: number; // Unix timestamp (ms) for LRU
  version: string;
}

export class CacheManager {
  private static readonly CACHE_VERSION = 'v1.0.0';
  private static readonly DEFAULT_TTL = 30 * 60 * 1000; // 30分
  private memoryCache: Map<string, CacheEntry>;
  private useLocalStorage: boolean;

  constructor() {
    this.memoryCache = new Map();
    this.useLocalStorage = this.isLocalStorageAvailable();
  }

  /**
   * データをキャッシュに保存する
   * @param key キャッシュキー
   * @param data 保存するデータ
   * @param ttl Time To Live (ミリ秒)。デフォルトは30分
   */
  set<T>(key: string, data: T, ttl: number = CacheManager.DEFAULT_TTL): void {
    const now = Date.now();
    const expiry = now + ttl;
    const entry: CacheEntry<T> = {
      data,
      expiry,
      lastAccessed: now,
      version: CacheManager.CACHE_VERSION,
    };

    // メモリキャッシュに保存
    this.memoryCache.set(key, entry);

    // localStorage に保存を試みる（シリアライザーを使用）
    if (this.useLocalStorage) {
      try {
        const serialized = serialize(entry);
        localStorage.setItem(key, serialized);
      } catch (error: any) {
        // QuotaExceededError の場合は最古のエントリを削除して再試行
        if (error?.name === 'QuotaExceededError') {
          const removedKey = this.removeOldest();
          if (removedKey) {
            console.warn(`localStorage quota exceeded. Removed oldest entry: "${removedKey}"`);
            // 再試行
            try {
              const serialized = serialize(entry);
              localStorage.setItem(key, serialized);
            } catch (retryError) {
              console.warn(`Failed to save to localStorage after cleanup for key "${key}":`, retryError);
              this.useLocalStorage = false;
            }
          } else {
            console.warn(`Failed to save to localStorage for key "${key}":`, error);
            this.useLocalStorage = false;
          }
        } else {
          console.warn(`Failed to save to localStorage for key "${key}":`, error);
          this.useLocalStorage = false;
        }
      }
    }
  }

  /**
   * キャッシュからデータを取得する
   * @param key キャッシュキー
   * @returns キャッシュデータ、またはキャッシュが無効/存在しない場合は null
   */
  get<T>(key: string): T | null {
    // メモリキャッシュを優先
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isEntryValid(memoryEntry)) {
      // アクセス時刻を更新 (LRU)
      memoryEntry.lastAccessed = Date.now();
      // localStorage にも更新を保存
      if (this.useLocalStorage) {
        try {
          const serialized = serialize(memoryEntry);
          localStorage.setItem(key, serialized);
        } catch (error) {
          console.warn(`Failed to update lastAccessed in localStorage for key "${key}":`, error);
        }
      }
      return memoryEntry.data as T;
    }

    // localStorage からの読み込みを試みる（デシリアライザーを使用）
    if (this.useLocalStorage) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const entry: CacheEntry<T> = deserialize(stored);

          if (this.isEntryValid(entry)) {
            // アクセス時刻を更新 (LRU)
            entry.lastAccessed = Date.now();
            // メモリキャッシュにも保存
            this.memoryCache.set(key, entry);
            // localStorage にも更新を保存
            try {
              const serialized = serialize(entry);
              localStorage.setItem(key, serialized);
            } catch (error) {
              console.warn(`Failed to update lastAccessed in localStorage for key "${key}":`, error);
            }
            return entry.data;
          } else {
            // 期限切れの場合は削除
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.warn(`Failed to read from localStorage for key "${key}":`, error);
      }
    }

    return null;
  }

  /**
   * キャッシュが有効かどうかをチェックする
   * @param key キャッシュキー
   * @returns キャッシュが有効な場合 true、無効または存在しない場合 false
   */
  isValid(key: string): boolean {
    // メモリキャッシュをチェック
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isEntryValid(memoryEntry)) {
      return true;
    }

    // localStorage をチェック（デシリアライザーを使用）
    if (this.useLocalStorage) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const entry: CacheEntry = deserialize(stored);
          return this.isEntryValid(entry);
        }
      } catch (error) {
        console.warn(`Failed to check validity in localStorage for key "${key}":`, error);
      }
    }

    return false;
  }

  /**
   * 単一のキャッシュエントリを削除する
   * @param key キャッシュキー
   */
  clear(key: string): void {
    this.memoryCache.delete(key);

    if (this.useLocalStorage) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to clear localStorage for key "${key}":`, error);
      }
    }
  }

  /**
   * すべてのキャッシュエントリを削除する
   */
  clearAll(): void {
    this.memoryCache.clear();

    if (this.useLocalStorage) {
      try {
        // localStorage内のすべてのCacheManagerエントリを削除
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = deserialize<CacheEntry>(item);
              // version プロパティを持つものをCacheManagerのエントリとみなす
              if (parsed.version === CacheManager.CACHE_VERSION) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // デシリアライズ失敗時は無視
          }
        });
      } catch (error) {
        console.warn('Failed to clear all from localStorage:', error);
      }
    }
  }

  /**
   * 最古のキャッシュエントリを削除する (LRU)
   * @returns 削除されたキー、削除するエントリがない場合は null
   */
  removeOldest(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    // メモリキャッシュから最古のエントリを検索
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    // localStorage からも検索
    if (this.useLocalStorage) {
      try {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const entry = deserialize<CacheEntry>(item);
              if (entry.version === CacheManager.CACHE_VERSION && entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
              }
            }
          } catch {
            // パースエラーは無視
          }
        }
      } catch (error) {
        console.warn('Failed to search oldest entry in localStorage:', error);
      }
    }

    // 最古のエントリを削除
    if (oldestKey) {
      this.clear(oldestKey);
    }

    return oldestKey;
  }

  /**
   * キャッシュのサイズを取得する
   * @returns キャッシュエントリの数
   */
  size(): number {
    return this.memoryCache.size;
  }

  /**
   * CacheEntry が有効期限内かどうかをチェックする
   * @param entry キャッシュエントリ
   * @returns 有効期限内の場合 true、期限切れの場合 false
   */
  private isEntryValid(entry: CacheEntry): boolean {
    return entry.expiry > Date.now();
  }

  /**
   * localStorage が利用可能かどうかをチェックする
   * @returns localStorage が利用可能な場合 true
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__cache_manager_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}
