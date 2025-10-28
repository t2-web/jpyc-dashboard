import { describe, test, expect, beforeEach } from 'vitest';
import {
  FallbackResult,
  FallbackStatus,
  executeWithFallback,
  executeParallelWithFallback,
} from './fallbackStrategy';

describe('Fallback Strategy', () => {
  describe('executeWithFallback', () => {
    test('成功した場合、結果を返すこと', async () => {
      const primaryFn = async () => ({ data: 'primary' });
      const fallbackFn = async () => ({ data: 'fallback' });

      const result = await executeWithFallback(primaryFn, fallbackFn);

      expect(result.status).toBe(FallbackStatus.SUCCESS);
      expect(result.data).toEqual({ data: 'primary' });
      expect(result.usedFallback).toBe(false);
      expect(result.error).toBeUndefined();
    });

    test('プライマリ失敗時、フォールバックを使用すること', async () => {
      const primaryFn = async () => {
        throw new Error('Primary failed');
      };
      const fallbackFn = async () => ({ data: 'fallback' });

      const result = await executeWithFallback(primaryFn, fallbackFn);

      expect(result.status).toBe(FallbackStatus.FALLBACK_USED);
      expect(result.data).toEqual({ data: 'fallback' });
      expect(result.usedFallback).toBe(true);
      expect(result.primaryError).toBeDefined();
      expect(result.primaryError?.message).toBe('Primary failed');
    });

    test('プライマリとフォールバック両方失敗時、エラーステータスを返すこと', async () => {
      const primaryFn = async () => {
        throw new Error('Primary failed');
      };
      const fallbackFn = async () => {
        throw new Error('Fallback failed');
      };

      const result = await executeWithFallback(primaryFn, fallbackFn);

      expect(result.status).toBe(FallbackStatus.FAILED);
      expect(result.data).toBeUndefined();
      expect(result.usedFallback).toBe(true);
      expect(result.primaryError).toBeDefined();
      expect(result.fallbackError).toBeDefined();
      expect(result.primaryError?.message).toBe('Primary failed');
      expect(result.fallbackError?.message).toBe('Fallback failed');
    });

    test('フォールバック関数が提供されない場合、プライマリのみ実行すること', async () => {
      const primaryFn = async () => ({ data: 'primary' });

      const result = await executeWithFallback(primaryFn);

      expect(result.status).toBe(FallbackStatus.SUCCESS);
      expect(result.data).toEqual({ data: 'primary' });
      expect(result.usedFallback).toBe(false);
    });

    test('フォールバック関数が提供されず、プライマリが失敗した場合、エラーステータスを返すこと', async () => {
      const primaryFn = async () => {
        throw new Error('Primary failed');
      };

      const result = await executeWithFallback(primaryFn);

      expect(result.status).toBe(FallbackStatus.FAILED);
      expect(result.data).toBeUndefined();
      expect(result.usedFallback).toBe(false);
      expect(result.primaryError).toBeDefined();
    });
  });

  describe('executeParallelWithFallback', () => {
    test('全て成功した場合、全ての結果を返すこと', async () => {
      const operations = [
        {
          name: 'op1',
          primaryFn: async () => ({ data: 'op1-primary' }),
          fallbackFn: async () => ({ data: 'op1-fallback' }),
        },
        {
          name: 'op2',
          primaryFn: async () => ({ data: 'op2-primary' }),
          fallbackFn: async () => ({ data: 'op2-fallback' }),
        },
      ];

      const result = await executeParallelWithFallback(operations);

      expect(result.results).toHaveLength(2);
      expect(result.results[0].status).toBe(FallbackStatus.SUCCESS);
      expect(result.results[0].data).toEqual({ data: 'op1-primary' });
      expect(result.results[1].status).toBe(FallbackStatus.SUCCESS);
      expect(result.results[1].data).toEqual({ data: 'op2-primary' });
      expect(result.hasPartialSuccess).toBe(false);
      expect(result.hasAnySuccess).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.fallbackCount).toBe(0);
      expect(result.failureCount).toBe(0);
    });

    test('一部失敗した場合、部分的な結果を返すこと', async () => {
      const operations = [
        {
          name: 'op1',
          primaryFn: async () => ({ data: 'op1-primary' }),
          fallbackFn: async () => ({ data: 'op1-fallback' }),
        },
        {
          name: 'op2',
          primaryFn: async () => {
            throw new Error('op2 failed');
          },
          fallbackFn: async () => ({ data: 'op2-fallback' }),
        },
        {
          name: 'op3',
          primaryFn: async () => {
            throw new Error('op3 primary failed');
          },
          fallbackFn: async () => {
            throw new Error('op3 fallback failed');
          },
        },
      ];

      const result = await executeParallelWithFallback(operations);

      expect(result.results).toHaveLength(3);
      expect(result.results[0].status).toBe(FallbackStatus.SUCCESS);
      expect(result.results[1].status).toBe(FallbackStatus.FALLBACK_USED);
      expect(result.results[1].data).toEqual({ data: 'op2-fallback' });
      expect(result.results[2].status).toBe(FallbackStatus.FAILED);
      expect(result.hasPartialSuccess).toBe(true);
      expect(result.hasAnySuccess).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.fallbackCount).toBe(1);
      expect(result.failureCount).toBe(1);
    });

    test('全て失敗した場合、空の結果を返すこと', async () => {
      const operations = [
        {
          name: 'op1',
          primaryFn: async () => {
            throw new Error('op1 primary failed');
          },
          fallbackFn: async () => {
            throw new Error('op1 fallback failed');
          },
        },
        {
          name: 'op2',
          primaryFn: async () => {
            throw new Error('op2 primary failed');
          },
          fallbackFn: async () => {
            throw new Error('op2 fallback failed');
          },
        },
      ];

      const result = await executeParallelWithFallback(operations);

      expect(result.results).toHaveLength(2);
      expect(result.results[0].status).toBe(FallbackStatus.FAILED);
      expect(result.results[1].status).toBe(FallbackStatus.FAILED);
      expect(result.hasPartialSuccess).toBe(false);
      expect(result.hasAnySuccess).toBe(false);
      expect(result.successCount).toBe(0);
      expect(result.fallbackCount).toBe(0);
      expect(result.failureCount).toBe(2);
    });

    test('空の配列の場合、空の結果を返すこと', async () => {
      const result = await executeParallelWithFallback([]);

      expect(result.results).toHaveLength(0);
      expect(result.hasPartialSuccess).toBe(false);
      expect(result.hasAnySuccess).toBe(false);
      expect(result.successCount).toBe(0);
      expect(result.fallbackCount).toBe(0);
      expect(result.failureCount).toBe(0);
    });

    test('成功したデータのみを抽出できること', async () => {
      const operations = [
        {
          name: 'op1',
          primaryFn: async () => ({ value: 1 }),
        },
        {
          name: 'op2',
          primaryFn: async () => {
            throw new Error('Failed');
          },
        },
        {
          name: 'op3',
          primaryFn: async () => ({ value: 3 }),
        },
      ];

      const result = await executeParallelWithFallback(operations);
      const successData = result.results.filter((r) => r.data !== undefined).map((r) => r.data);

      expect(successData).toHaveLength(2);
      expect(successData).toEqual([{ value: 1 }, { value: 3 }]);
    });
  });

  describe('Integration scenarios', () => {
    test('チェーン別データ取得のシミュレーション', async () => {
      // 3チェーンのデータ取得をシミュレート
      const operations = [
        {
          name: 'Ethereum',
          primaryFn: async () => ({ chain: 'Ethereum', totalSupply: 1000000n }),
          fallbackFn: async () => {
            // キャッシュからのフォールバック
            return { chain: 'Ethereum', totalSupply: 950000n, cached: true };
          },
        },
        {
          name: 'Polygon',
          primaryFn: async () => {
            throw new Error('Polygon RPC timeout');
          },
          fallbackFn: async () => {
            // キャッシュからのフォールバック
            return { chain: 'Polygon', totalSupply: 500000n, cached: true };
          },
        },
        {
          name: 'Avalanche',
          primaryFn: async () => {
            throw new Error('Avalanche RPC error');
          },
          fallbackFn: async () => {
            throw new Error('No cache available');
          },
        },
      ];

      const result = await executeParallelWithFallback(operations);

      expect(result.hasPartialSuccess).toBe(true);
      expect(result.successCount).toBe(1); // Ethereum成功
      expect(result.fallbackCount).toBe(1); // Polygonキャッシュ使用
      expect(result.failureCount).toBe(1); // Avalanche完全失敗

      // 成功とフォールバックのデータを取得
      const availableData = result.results
        .filter((r) => r.status !== FallbackStatus.FAILED)
        .map((r) => r.data);

      expect(availableData).toHaveLength(2);
    });

    test('全チェーン失敗時のグレースフルデグラデーション', async () => {
      const operations = [
        {
          name: 'Chain1',
          primaryFn: async () => {
            throw new Error('Chain1 failed');
          },
        },
        {
          name: 'Chain2',
          primaryFn: async () => {
            throw new Error('Chain2 failed');
          },
        },
      ];

      const result = await executeParallelWithFallback(operations);

      expect(result.hasAnySuccess).toBe(false);
      expect(result.failureCount).toBe(2);

      // UIにエラーメッセージを表示する
      const errorMessages = result.results.map((r) => ({
        name: r.name,
        error: r.primaryError?.message || 'Unknown error',
      }));

      expect(errorMessages).toHaveLength(2);
      expect(errorMessages[0].error).toBe('Chain1 failed');
      expect(errorMessages[1].error).toBe('Chain2 failed');
    });
  });
});
