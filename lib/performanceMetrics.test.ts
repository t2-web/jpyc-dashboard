import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PerformanceMetrics,
  measurePerformance,
  getMetrics,
  clearMetrics,
  saveMetricsToStorage,
  loadMetricsFromStorage,
  MetricEntry,
} from './performanceMetrics';

describe('Performance Metrics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    clearMetrics();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('measurePerformance', () => {
    test('同期関数のパフォーマンスを計測できること', async () => {
      const fn = () => {
        return 'result';
      };

      const promise = measurePerformance('sync-operation', fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('result');

      const metrics = getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('sync-operation');
      expect(metrics[0].duration).toBeGreaterThanOrEqual(0);
      expect(metrics[0].status).toBe('success');
    });

    test('非同期関数のパフォーマンスを計測できること', async () => {
      const fn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return 'async-result';
      };

      const promise = measurePerformance('async-operation', fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('async-result');

      const metrics = getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('async-operation');
      expect(metrics[0].duration).toBeGreaterThanOrEqual(1000);
      expect(metrics[0].status).toBe('success');
    });

    test('エラーが発生した場合もメトリクスを記録すること', async () => {
      const fn = async () => {
        throw new Error('Operation failed');
      };

      const promise = measurePerformance('error-operation', fn);

      try {
        await vi.runAllTimersAsync();
        await promise;
      } catch (error) {
        // エラーをキャッチして処理
        expect((error as Error).message).toBe('Operation failed');
      }

      const metrics = getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('error-operation');
      expect(metrics[0].status).toBe('error');
      expect(metrics[0].error).toBe('Operation failed');
    });

    test('カスタムメタデータを記録できること', async () => {
      const fn = async () => 'result';

      const promise = measurePerformance('custom-operation', fn, {
        chain: 'Ethereum',
        cacheHit: true,
      });
      await vi.runAllTimersAsync();
      await promise;

      const metrics = getMetrics();
      expect(metrics[0].metadata).toEqual({
        chain: 'Ethereum',
        cacheHit: true,
      });
    });

    test('複数のメトリクスを記録できること', async () => {
      const fn1 = async () => 'result1';
      const fn2 = async () => 'result2';

      const promise1 = measurePerformance('operation1', fn1);
      const promise2 = measurePerformance('operation2', fn2);

      await vi.runAllTimersAsync();
      await Promise.all([promise1, promise2]);

      const metrics = getMetrics();
      expect(metrics).toHaveLength(2);
      expect(metrics[0].name).toBe('operation1');
      expect(metrics[1].name).toBe('operation2');
    });
  });

  describe('getMetrics', () => {
    test('空の配列を返すこと（初期状態）', () => {
      const metrics = getMetrics();
      expect(metrics).toEqual([]);
    });

    test('記録されたメトリクスを全て取得できること', async () => {
      const fn1 = async () => 'result1';
      const fn2 = async () => 'result2';

      const promise1 = measurePerformance('op1', fn1);
      const promise2 = measurePerformance('op2', fn2);

      await vi.runAllTimersAsync();
      await Promise.all([promise1, promise2]);

      const metrics = getMetrics();
      expect(metrics).toHaveLength(2);
    });

    test('特定の名前のメトリクスのみを取得できること', async () => {
      const fn = async () => 'result';

      await measurePerformance('op1', fn);
      await measurePerformance('op2', fn);
      await measurePerformance('op1', fn); // op1を2回実行

      await vi.runAllTimersAsync();

      const metrics = getMetrics('op1');
      expect(metrics).toHaveLength(2);
      expect(metrics.every((m) => m.name === 'op1')).toBe(true);
    });
  });

  describe('clearMetrics', () => {
    test('全てのメトリクスをクリアできること', async () => {
      const fn = async () => 'result';

      await measurePerformance('op1', fn);
      await measurePerformance('op2', fn);
      await vi.runAllTimersAsync();

      clearMetrics();

      const metrics = getMetrics();
      expect(metrics).toEqual([]);
    });

    test('特定の名前のメトリクスのみをクリアできること', async () => {
      const fn = async () => 'result';

      const p1 = measurePerformance('op1', fn);
      const p2 = measurePerformance('op2', fn);

      await vi.runAllTimersAsync();
      await Promise.all([p1, p2]);

      clearMetrics('op1');

      const metrics = getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('op2');
    });
  });

  describe('saveMetricsToStorage & loadMetricsFromStorage', () => {
    test('メトリクスをlocalStorageに保存できること', async () => {
      const fn = async () => 'result';

      const promise = measurePerformance('save-operation', fn);
      await vi.runAllTimersAsync();
      await promise;

      saveMetricsToStorage();

      const saved = localStorage.getItem('performance_metrics');
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('save-operation');
    });

    test('localStorageからメトリクスを読み込めること', async () => {
      const fn = async () => 'result';

      const promise = measurePerformance('load-operation', fn);
      await vi.runAllTimersAsync();
      await promise;

      saveMetricsToStorage();
      clearMetrics();

      const loadedMetrics = loadMetricsFromStorage();

      expect(loadedMetrics).toHaveLength(1);
      expect(loadedMetrics[0].name).toBe('load-operation');
    });

    test('破損したデータの場合、空配列を返すこと', () => {
      localStorage.setItem('performance_metrics', 'invalid json');

      const metrics = loadMetricsFromStorage();
      expect(metrics).toEqual([]);
    });

    test('localStorageにデータがない場合、空配列を返すこと', () => {
      const metrics = loadMetricsFromStorage();
      expect(metrics).toEqual([]);
    });
  });

  describe('PerformanceMetrics class', () => {
    test('統計情報を計算できること', async () => {
      const fn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return 'result';
      };

      const p1 = measurePerformance('stats-op', fn);
      const p2 = measurePerformance('stats-op', fn);
      const p3 = measurePerformance('stats-op', fn);

      await vi.runAllTimersAsync();
      await Promise.all([p1, p2, p3]);

      const performanceMetrics = new PerformanceMetrics();
      const stats = performanceMetrics.getStats('stats-op');

      expect(stats.count).toBe(3);
      expect(stats.avgDuration).toBeGreaterThanOrEqual(1000);
      expect(stats.minDuration).toBeGreaterThanOrEqual(1000);
      expect(stats.maxDuration).toBeGreaterThanOrEqual(1000);
      expect(stats.successRate).toBe(100);
    });

    test('エラー率を正しく計算すること', async () => {
      const successFn = async () => 'success';
      const errorFn = async () => {
        throw new Error('error');
      };

      const p1 = measurePerformance('error-rate-op', successFn);
      const p2 = measurePerformance('error-rate-op', errorFn);
      const p3 = measurePerformance('error-rate-op', errorFn);

      await vi.runAllTimersAsync();

      // Promise.allSettledで全ての結果を待つ
      await Promise.allSettled([p1, p2, p3]);

      const performanceMetrics = new PerformanceMetrics();
      const stats = performanceMetrics.getStats('error-rate-op');

      expect(stats.count).toBe(3);
      expect(stats.successRate).toBeCloseTo(33.33, 1); // 1/3 = 33.33%
    });
  });

  describe('Integration scenarios', () => {
    test('初回ロードとキャッシュ利用のパフォーマンス比較', async () => {
      // 初回ロード（遅い）
      const initialLoad = async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return { data: 'initial' };
      };

      // キャッシュ利用（速い）
      const cachedLoad = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { data: 'cached' };
      };

      const p1 = measurePerformance('data-load', initialLoad, { cached: false });
      await vi.runAllTimersAsync();
      await p1;

      const p2 = measurePerformance('data-load', cachedLoad, { cached: true });
      await vi.runAllTimersAsync();
      await p2;

      const metrics = getMetrics('data-load');
      expect(metrics).toHaveLength(2);

      const initialMetric = metrics.find((m) => m.metadata?.cached === false);
      const cachedMetric = metrics.find((m) => m.metadata?.cached === true);

      expect(initialMetric!.duration).toBeGreaterThan(cachedMetric!.duration);
    });

    test('マルチチェーンデータ取得のパフォーマンス追跡', async () => {
      const chainRequest = async (chain: string, delay: number) => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return { chain, data: 'result' };
      };

      const p1 = measurePerformance('chain-fetch', () => chainRequest('Ethereum', 2000), {
        chain: 'Ethereum',
      });
      const p2 = measurePerformance('chain-fetch', () => chainRequest('Polygon', 1000), {
        chain: 'Polygon',
      });
      const p3 = measurePerformance('chain-fetch', () => chainRequest('Avalanche', 3000), {
        chain: 'Avalanche',
      });

      await vi.runAllTimersAsync();
      await Promise.all([p1, p2, p3]);

      const metrics = getMetrics('chain-fetch');
      expect(metrics).toHaveLength(3);

      const ethereumMetric = metrics.find((m) => m.metadata?.chain === 'Ethereum');
      const polygonMetric = metrics.find((m) => m.metadata?.chain === 'Polygon');
      const avalancheMetric = metrics.find((m) => m.metadata?.chain === 'Avalanche');

      expect(polygonMetric!.duration).toBeLessThan(ethereumMetric!.duration);
      expect(ethereumMetric!.duration).toBeLessThan(avalancheMetric!.duration);
    });
  });
});
