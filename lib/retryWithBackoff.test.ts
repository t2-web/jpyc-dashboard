import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { retryWithBackoff, RetryConfig, RetryError } from './retryWithBackoff';

describe('Retry With Backoff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('retryWithBackoff', () => {
    test('成功した場合、結果を返すこと', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const promise = retryWithBackoff(fn);
      vi.runAllTimers();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('1回目の失敗後、リトライして成功すること', async () => {
      const error = new Error('Network timeout');
      const fn = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('success');

      const promise = retryWithBackoff(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('2回目の失敗後、リトライして成功すること', async () => {
      const error1 = new Error('Network timeout');
      const error2 = new Error('Connection reset');
      const fn = vi
        .fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockResolvedValueOnce('success');

      const promise = retryWithBackoff(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('最大リトライ回数を超えた場合、エラーをスローすること', async () => {
      const error = new Error('Network timeout - persistent failure');
      const fn = vi.fn().mockRejectedValue(error);

      const config: RetryConfig = { maxRetries: 3 };

      const promise = retryWithBackoff(fn, config);

      await expect(async () => {
        await vi.runAllTimersAsync();
        await promise;
      }).rejects.toThrow(RetryError);

      expect(fn).toHaveBeenCalledTimes(4);
    });

    test('指数バックオフで遅延が増加すること', async () => {
      const error1 = new Error('Network timeout 1');
      const error2 = new Error('Network timeout 2');
      const fn = vi
        .fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockResolvedValueOnce('success');

      const config: RetryConfig = {
        initialDelay: 100,
        maxRetries: 3,
      };

      const promise = retryWithBackoff(fn, config);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('最大遅延時間を超えないこと', async () => {
      const error1 = new Error('Network timeout 1');
      const error2 = new Error('Network timeout 2');
      const error3 = new Error('Network timeout 3');
      const fn = vi
        .fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockRejectedValueOnce(error3)
        .mockResolvedValueOnce('success');

      const config: RetryConfig = {
        initialDelay: 1000,
        maxDelay: 2000,
        maxRetries: 5,
      };

      const promise = retryWithBackoff(fn, config);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(4);
    });

    test('429エラー（Rate Limit）を検出してリトライすること', async () => {
      const error429 = new Error('Too Many Requests');
      (error429 as any).status = 429;

      const fn = vi.fn().mockRejectedValueOnce(error429).mockResolvedValueOnce('success');

      const promise = retryWithBackoff(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('503エラー（Service Unavailable）を検出してリトライすること', async () => {
      const error503 = new Error('Service Unavailable');
      (error503 as any).status = 503;

      const fn = vi.fn().mockRejectedValueOnce(error503).mockResolvedValueOnce('success');

      const promise = retryWithBackoff(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('タイムアウトエラーを検出してリトライすること', async () => {
      const timeoutError = new Error('Request timeout');

      const fn = vi.fn().mockRejectedValueOnce(timeoutError).mockResolvedValueOnce('success');

      const promise = retryWithBackoff(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('リトライ不可能なエラーの場合、即座に失敗すること', async () => {
      const error400 = new Error('Bad Request');
      (error400 as any).status = 400;

      const fn = vi.fn().mockRejectedValue(error400);

      const config: RetryConfig = {
        retryableErrors: [429, 503, 504],
      };

      const promise = retryWithBackoff(fn, config);
      vi.runAllTimers();

      await expect(promise).rejects.toThrow('Bad Request');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('カスタム設定を使用できること', async () => {
      const error1 = new Error('Network timeout 1');
      const error2 = new Error('Network timeout 2');
      const fn = vi
        .fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockResolvedValueOnce('success');

      const config: RetryConfig = {
        maxRetries: 5,
        initialDelay: 200,
        maxDelay: 5000,
        backoffFactor: 3,
      };

      const promise = retryWithBackoff(fn, config);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('onRetryコールバックが呼ばれること', async () => {
      const onRetry = vi.fn();
      const error = new Error('Network timeout');
      const fn = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('success');

      const config: RetryConfig = {
        onRetry,
      };

      const promise = retryWithBackoff(fn, config);
      await vi.runAllTimersAsync();
      await promise;

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Network timeout',
        }),
        1,
        expect.any(Number)
      );
    });
  });

  describe('RetryError', () => {
    test('RetryErrorが正しい情報を含むこと', async () => {
      const originalError = new Error('Network timeout - original error');
      const fn = vi.fn().mockRejectedValue(originalError);

      const config: RetryConfig = { maxRetries: 2 };

      const promise = retryWithBackoff(fn, config);

      try {
        await vi.runAllTimersAsync();
        await promise;
        expect.fail('エラーがスローされるべきでした');
      } catch (e) {
        expect(e).toBeInstanceOf(RetryError);
        expect((e as RetryError).message).toContain('最大リトライ回数（2回）を超えました');
        expect((e as RetryError).attempts).toBe(3);
        expect((e as RetryError).lastError).toBe(originalError);
      }
    });
  });

  describe('Integration scenarios', () => {
    test('実際のAPI呼び出しシミュレーション: 一時的な障害からの回復', async () => {
      let callCount = 0;
      const simulateApi = async () => {
        callCount++;
        if (callCount < 3) {
          const error = new Error('Service temporarily unavailable');
          (error as any).status = 503;
          throw error;
        }
        return { data: 'API response' };
      };

      const config: RetryConfig = {
        maxRetries: 5,
        initialDelay: 100,
      };

      const promise = retryWithBackoff(simulateApi, config);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toEqual({ data: 'API response' });
      expect(callCount).toBe(3);
    });

    test('実際のAPI呼び出しシミュレーション: Rate Limit対応', async () => {
      let callCount = 0;
      const simulateApi = async () => {
        callCount++;
        if (callCount === 1) {
          const error = new Error('Rate limit exceeded');
          (error as any).status = 429;
          throw error;
        }
        return { data: 'API response' };
      };

      const config: RetryConfig = {
        maxRetries: 3,
        initialDelay: 1000,
      };

      const promise = retryWithBackoff(simulateApi, config);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toEqual({ data: 'API response' });
      expect(callCount).toBe(2);
    });

    test('実際のAPI呼び出しシミュレーション: 永続的な障害での失敗', async () => {
      const simulateApi = async () => {
        const error = new Error('Internal server error');
        (error as any).status = 500;
        throw error;
      };

      const config: RetryConfig = {
        maxRetries: 3,
        initialDelay: 100,
      };

      const promise = retryWithBackoff(simulateApi, config);

      await expect(async () => {
        await vi.runAllTimersAsync();
        await promise;
      }).rejects.toThrow(RetryError);
    });
  });
});
