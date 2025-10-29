import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  RateLimiter,
  RateLimitConfig,
  RateLimitExceededError,
  checkRateLimit,
  enforceRateLimit,
} from './rateLimiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // LocalStorageをクリア
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('RateLimiter class', () => {
    test('初回リクエストは許可されること', () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });

      const result = limiter.tryAcquire('test-api');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    test('レート制限を超えた場合、拒否されること', () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });

      limiter.tryAcquire('test-api'); // 1回目: 成功
      const result = limiter.tryAcquire('test-api'); // 2回目: 拒否

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    test('時間経過後、再度リクエストが許可されること', () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });

      limiter.tryAcquire('test-api'); // 1回目: 成功
      vi.advanceTimersByTime(61000); // 61秒経過

      const result = limiter.tryAcquire('test-api'); // 2回目: 成功

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });

    test('複数のAPIキーを独立して管理すること', () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });

      const result1 = limiter.tryAcquire('api-1'); // api-1の1回目: 成功
      const result2 = limiter.tryAcquire('api-2'); // api-2の1回目: 成功

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);

      const result3 = limiter.tryAcquire('api-1'); // api-1の2回目: 拒否
      const result4 = limiter.tryAcquire('api-2'); // api-2の2回目: 拒否

      expect(result3.allowed).toBe(false);
      expect(result4.allowed).toBe(false);
    });

    test('残りリクエスト数を正しく計算すること', () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 60000 });

      const result1 = limiter.tryAcquire('test-api');
      expect(result1.remaining).toBe(2);

      const result2 = limiter.tryAcquire('test-api');
      expect(result2.remaining).toBe(1);

      const result3 = limiter.tryAcquire('test-api');
      expect(result3.remaining).toBe(0);
    });

    test('スライディングウィンドウが正しく機能すること', () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60000 });

      limiter.tryAcquire('test-api'); // t=0: 成功
      vi.advanceTimersByTime(30000); // t=30s
      limiter.tryAcquire('test-api'); // t=30s: 成功

      vi.advanceTimersByTime(31000); // t=61s (最初のリクエストから61秒後)

      const result = limiter.tryAcquire('test-api'); // t=61s: 成功 (最初のリクエストが期限切れ、t=30sのリクエストは残る)

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1); // t=30sのリクエストがまだwindow内に残っているため、残り1
    });

    test('リセット処理が正しく機能すること', () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });

      limiter.tryAcquire('test-api'); // 1回目: 成功

      const beforeReset = limiter.tryAcquire('test-api'); // 2回目: 拒否
      expect(beforeReset.allowed).toBe(false);

      limiter.reset('test-api'); // リセット

      const afterReset = limiter.tryAcquire('test-api'); // リセット後: 成功
      expect(afterReset.allowed).toBe(true);
    });

    test('全てのAPIキーをリセットできること', () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });

      limiter.tryAcquire('api-1');
      limiter.tryAcquire('api-2');

      limiter.resetAll();

      const result1 = limiter.tryAcquire('api-1');
      const result2 = limiter.tryAcquire('api-2');

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });
  });

  describe('checkRateLimit', () => {
    test('レート制限内の場合、trueを返すこと', () => {
      const result = checkRateLimit('test-check', { maxRequests: 1, windowMs: 60000 });

      expect(result).toBe(true);
    });

    test('レート制限を超えた場合、falseを返すこと', () => {
      checkRateLimit('test-check', { maxRequests: 1, windowMs: 60000 }); // 1回目
      const result = checkRateLimit('test-check', { maxRequests: 1, windowMs: 60000 }); // 2回目

      expect(result).toBe(false);
    });
  });

  describe('enforceRateLimit', () => {
    test('レート制限内の場合、正常に処理が実行されること', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await enforceRateLimit(
        'test-enforce',
        fn,
        { maxRequests: 1, windowMs: 60000 }
      );

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('レート制限を超えた場合、RateLimitExceededErrorをスローすること', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      await enforceRateLimit('test-enforce-2', fn, { maxRequests: 1, windowMs: 60000 }); // 1回目: 成功

      await expect(async () => {
        await enforceRateLimit('test-enforce-2', fn, { maxRequests: 1, windowMs: 60000 }); // 2回目: エラー
      }).rejects.toThrow(RateLimitExceededError);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('RateLimitExceededErrorに正しい情報が含まれること', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      await enforceRateLimit('test-error-info', fn, { maxRequests: 1, windowMs: 60000 });

      try {
        await enforceRateLimit('test-error-info', fn, { maxRequests: 1, windowMs: 60000 });
        expect.fail('エラーがスローされるべきでした');
      } catch (e) {
        expect(e).toBeInstanceOf(RateLimitExceededError);
        expect((e as RateLimitExceededError).apiKey).toBe('test-error-info');
        expect((e as RateLimitExceededError).retryAfter).toBeGreaterThan(0);
        expect((e as RateLimitExceededError).resetTime).toBeGreaterThan(Date.now());
      }
    });
  });

  describe('Integration scenarios', () => {
    test('30分に1回のAPI制限をシミュレーション', () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 30 * 60 * 1000 }); // 30分

      const request1 = limiter.tryAcquire('jpyc-api'); // t=0: 成功
      expect(request1.allowed).toBe(true);

      const request2 = limiter.tryAcquire('jpyc-api'); // t=0: 拒否
      expect(request2.allowed).toBe(false);
      expect(request2.retryAfter).toBeGreaterThan(29 * 60 * 1000); // 約30分後

      vi.advanceTimersByTime(31 * 60 * 1000); // 31分経過

      const request3 = limiter.tryAcquire('jpyc-api'); // t=31min: 成功
      expect(request3.allowed).toBe(true);
    });

    test('複数チェーンの独立したレート制限管理', () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60000 });

      // Ethereumチェーン
      limiter.tryAcquire('ethereum-rpc');
      limiter.tryAcquire('ethereum-rpc');

      // Polygonチェーン
      const polygonResult1 = limiter.tryAcquire('polygon-rpc');
      const polygonResult2 = limiter.tryAcquire('polygon-rpc');

      // Ethereumは制限到達
      const ethereumResult = limiter.tryAcquire('ethereum-rpc');
      expect(ethereumResult.allowed).toBe(false);

      // Polygonは制限到達
      const polygonResult3 = limiter.tryAcquire('polygon-rpc');
      expect(polygonResult3.allowed).toBe(false);

      // しかしAvalancheは独立して利用可能
      const avalancheResult = limiter.tryAcquire('avalanche-rpc');
      expect(avalancheResult.allowed).toBe(true);
    });

    test('バーストトラフィックの処理', () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 });

      // バースト: 5回連続リクエスト
      const results = Array.from({ length: 7 }, () => limiter.tryAcquire('burst-api'));

      // 最初の5回は成功
      expect(results.slice(0, 5).every((r) => r.allowed)).toBe(true);

      // 6回目以降は拒否
      expect(results.slice(5).every((r) => !r.allowed)).toBe(true);
    });
  });
});
