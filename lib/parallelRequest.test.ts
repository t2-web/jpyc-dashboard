import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  executeParallelWithTimeout,
  ParallelRequestConfig,
  TimeoutError,
} from './parallelRequest';

describe('Parallel Request', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('executeParallelWithTimeout', () => {
    test('全ての並列リクエストが成功した場合、全ての結果を返すこと', async () => {
      const requests = [
        {
          name: 'request1',
          fn: async () => ({ data: 'result1' }),
        },
        {
          name: 'request2',
          fn: async () => ({ data: 'result2' }),
        },
      ];

      const promise = executeParallelWithTimeout(requests, { timeout: 10000 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.results).toHaveLength(2);
      expect(result.results[0].status).toBe('success');
      expect(result.results[0].data).toEqual({ data: 'result1' });
      expect(result.results[1].status).toBe('success');
      expect(result.results[1].data).toEqual({ data: 'result2' });
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(result.timeoutCount).toBe(0);
    });

    test('一部のリクエストがタイムアウトした場合、他のリクエストは継続すること', async () => {
      const requests = [
        {
          name: 'fast-request',
          fn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { data: 'fast' };
          },
        },
        {
          name: 'slow-request',
          fn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 15000));
            return { data: 'slow' };
          },
        },
      ];

      const promise = executeParallelWithTimeout(requests, { timeout: 10000 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.results).toHaveLength(2);
      expect(result.results[0].status).toBe('success');
      expect(result.results[0].data).toEqual({ data: 'fast' });
      expect(result.results[1].status).toBe('timeout');
      expect(result.results[1].error).toBeInstanceOf(TimeoutError);
      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(0);
      expect(result.timeoutCount).toBe(1);
    });

    test('一部のリクエストがエラーで失敗した場合、他のリクエストは継続すること', async () => {
      const requests = [
        {
          name: 'success-request',
          fn: async () => ({ data: 'success' }),
        },
        {
          name: 'error-request',
          fn: async () => {
            throw new Error('Request failed');
          },
        },
      ];

      const promise = executeParallelWithTimeout(requests, { timeout: 10000 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.results).toHaveLength(2);
      expect(result.results[0].status).toBe('success');
      expect(result.results[1].status).toBe('error');
      expect(result.results[1].error?.message).toBe('Request failed');
      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(1);
      expect(result.timeoutCount).toBe(0);
    });

    test('全てのリクエストがタイムアウトした場合、適切な結果を返すこと', async () => {
      const requests = [
        {
          name: 'slow1',
          fn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 15000));
            return { data: 'slow1' };
          },
        },
        {
          name: 'slow2',
          fn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 15000));
            return { data: 'slow2' };
          },
        },
      ];

      const promise = executeParallelWithTimeout(requests, { timeout: 10000 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
      expect(result.timeoutCount).toBe(2);
      expect(result.results.every((r) => r.status === 'timeout')).toBe(true);
    });

    test('カスタムタイムアウトを設定できること', async () => {
      const requests = [
        {
          name: 'request',
          fn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 6000));
            return { data: 'result' };
          },
        },
      ];

      const promise = executeParallelWithTimeout(requests, { timeout: 5000 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.results[0].status).toBe('timeout');
      expect(result.timeoutCount).toBe(1);
    });

    test('個別のリクエストごとにタイムアウトを設定できること', async () => {
      const requests = [
        {
          name: 'short-timeout',
          fn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            return { data: 'result1' };
          },
          timeout: 2000,
        },
        {
          name: 'long-timeout',
          fn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            return { data: 'result2' };
          },
          timeout: 5000,
        },
      ];

      const promise = executeParallelWithTimeout(requests, { timeout: 10000 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.results[0].status).toBe('timeout');
      expect(result.results[1].status).toBe('success');
    });

    test('AbortControllerでキャンセルできること', async () => {
      const abortController = new AbortController();

      const requests = [
        {
          name: 'request',
          fn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            return { data: 'result' };
          },
        },
      ];

      const promise = executeParallelWithTimeout(requests, {
        timeout: 10000,
        signal: abortController.signal,
      });

      // 1秒後にキャンセル
      vi.advanceTimersByTime(1000);
      abortController.abort();

      await vi.runAllTimersAsync();
      const result = await promise;

      // abortされたリクエストはエラーステータスになる
      expect(result.results[0].status).toBe('error');
      expect(result.results[0].error?.message).toContain('was aborted');
      expect(result.failureCount).toBe(1);
    });

    test('成功したデータのみを抽出できること', async () => {
      const requests = [
        {
          name: 'success1',
          fn: async () => ({ value: 1 }),
        },
        {
          name: 'error',
          fn: async () => {
            throw new Error('Failed');
          },
        },
        {
          name: 'success2',
          fn: async () => ({ value: 2 }),
        },
      ];

      const promise = executeParallelWithTimeout(requests, { timeout: 10000 });
      await vi.runAllTimersAsync();
      const result = await promise;

      const successData = result.results
        .filter((r) => r.status === 'success')
        .map((r) => r.data);

      expect(successData).toHaveLength(2);
      expect(successData).toEqual([{ value: 1 }, { value: 2 }]);
    });

    test('実行時間を計測すること', async () => {
      const requests = [
        {
          name: 'request',
          fn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { data: 'result' };
          },
        },
      ];

      const promise = executeParallelWithTimeout(requests, { timeout: 10000 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.results[0].duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration scenarios', () => {
    test('マルチチェーンデータ取得シミュレーション', async () => {
      const chainRequests = [
        {
          name: 'Ethereum',
          fn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return { chain: 'Ethereum', totalSupply: 1000000n };
          },
          timeout: 10000,
        },
        {
          name: 'Polygon',
          fn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { chain: 'Polygon', totalSupply: 500000n };
          },
          timeout: 10000,
        },
        {
          name: 'Avalanche',
          fn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 15000)); // タイムアウト
            return { chain: 'Avalanche', totalSupply: 300000n };
          },
          timeout: 10000,
        },
        {
          name: 'Gnosis',
          fn: async () => {
            throw new Error('RPC error'); // エラー
          },
          timeout: 10000,
        },
      ];

      const promise = executeParallelWithTimeout(chainRequests, { timeout: 10000 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.successCount).toBe(2); // Ethereum, Polygon
      expect(result.timeoutCount).toBe(1); // Avalanche
      expect(result.failureCount).toBe(1); // Gnosis

      const successData = result.results
        .filter((r) => r.status === 'success')
        .map((r) => r.data);

      expect(successData).toHaveLength(2);
    });

    test('高速リトライ戦略との統合', async () => {
      let attemptCount = 0;

      const requests = [
        {
          name: 'retry-request',
          fn: async () => {
            attemptCount++;
            if (attemptCount < 2) {
              throw new Error('Temporary failure');
            }
            return { data: 'success-after-retry' };
          },
        },
      ];

      // 最初の試行（失敗）
      const promise1 = executeParallelWithTimeout(requests, { timeout: 10000 });
      await vi.runAllTimersAsync();
      const result1 = await promise1;

      expect(result1.failureCount).toBe(1);

      // 2回目の試行（成功）
      const promise2 = executeParallelWithTimeout(requests, { timeout: 10000 });
      await vi.runAllTimersAsync();
      const result2 = await promise2;

      expect(result2.successCount).toBe(1);
      expect(result2.results[0].data).toEqual({ data: 'success-after-retry' });
    });
  });
});
