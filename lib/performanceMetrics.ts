/**
 * Performance Metrics
 *
 * パフォーマンスメトリクスの計測・記録・分析機能を提供します。
 * - Performance APIを使用した高精度計測
 * - メトリクスのlocalStorage保存
 * - 統計情報の計算
 */

/**
 * メトリクスエントリのインターフェース
 */
export interface MetricEntry {
  /**
   * 操作名
   */
  name: string;

  /**
   * 実行時間（ミリ秒）
   */
  duration: number;

  /**
   * タイムスタンプ（Unix timestamp）
   */
  timestamp: number;

  /**
   * ステータス
   */
  status: 'success' | 'error';

  /**
   * エラーメッセージ（エラー時）
   */
  error?: string;

  /**
   * カスタムメタデータ
   */
  metadata?: Record<string, any>;
}

/**
 * 統計情報のインターフェース
 */
export interface MetricStats {
  /**
   * 操作名
   */
  name: string;

  /**
   * 実行回数
   */
  count: number;

  /**
   * 平均実行時間（ミリ秒）
   */
  avgDuration: number;

  /**
   * 最小実行時間（ミリ秒）
   */
  minDuration: number;

  /**
   * 最大実行時間（ミリ秒）
   */
  maxDuration: number;

  /**
   * 成功率（%）
   */
  successRate: number;
}

/**
 * メトリクス保存用のストレージキー
 */
const STORAGE_KEY = 'performance_metrics';

/**
 * インメモリメトリクスストア
 */
let metricsStore: MetricEntry[] = [];

/**
 * パフォーマンスを計測する
 * @param name 操作名
 * @param fn 実行する関数
 * @param metadata カスタムメタデータ
 * @returns 関数の実行結果
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = performance.now();
  const timestamp = Date.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    // メトリクスを記録
    metricsStore.push({
      name,
      duration,
      timestamp,
      status: 'success',
      metadata,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    // エラーメトリクスを記録
    metricsStore.push({
      name,
      duration,
      timestamp,
      status: 'error',
      error: (error as Error).message,
      metadata,
    });

    throw error;
  }
}

/**
 * 記録されたメトリクスを取得する
 * @param name 操作名（省略時は全て）
 * @returns メトリクスエントリの配列
 */
export function getMetrics(name?: string): MetricEntry[] {
  if (name) {
    return metricsStore.filter((m) => m.name === name);
  }
  return [...metricsStore];
}

/**
 * メトリクスをクリアする
 * @param name 操作名（省略時は全て）
 */
export function clearMetrics(name?: string): void {
  if (name) {
    metricsStore = metricsStore.filter((m) => m.name !== name);
  } else {
    metricsStore = [];
  }
}

/**
 * メトリクスをlocalStorageに保存する
 */
export function saveMetricsToStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metricsStore));
  } catch (error) {
    console.error('[PerformanceMetrics] Failed to save metrics to localStorage:', error);
  }
}

/**
 * localStorageからメトリクスを読み込む
 * @returns メトリクスエントリの配列
 */
export function loadMetricsFromStorage(): MetricEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as MetricEntry[];
    }
  } catch (error) {
    console.error('[PerformanceMetrics] Failed to load metrics from localStorage:', error);
  }
  return [];
}

/**
 * パフォーマンスメトリクス分析クラス
 */
export class PerformanceMetrics {
  /**
   * 統計情報を計算する
   * @param name 操作名
   * @returns 統計情報
   */
  public getStats(name: string): MetricStats {
    const metrics = getMetrics(name);

    if (metrics.length === 0) {
      return {
        name,
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
      };
    }

    const durations = metrics.map((m) => m.duration);
    const successCount = metrics.filter((m) => m.status === 'success').length;

    return {
      name,
      count: metrics.length,
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: (successCount / metrics.length) * 100,
    };
  }

  /**
   * 全ての操作の統計情報を取得する
   * @returns 統計情報の配列
   */
  public getAllStats(): MetricStats[] {
    const operationNames = [...new Set(metricsStore.map((m) => m.name))];
    return operationNames.map((name) => this.getStats(name));
  }

  /**
   * 最近のメトリクスを取得する
   * @param limit 取得件数
   * @returns メトリクスエントリの配列
   */
  public getRecentMetrics(limit: number = 10): MetricEntry[] {
    return [...metricsStore].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * 時間範囲内のメトリクスを取得する
   * @param startTime 開始時刻（Unix timestamp）
   * @param endTime 終了時刻（Unix timestamp）
   * @returns メトリクスエントリの配列
   */
  public getMetricsByTimeRange(startTime: number, endTime: number): MetricEntry[] {
    return metricsStore.filter((m) => m.timestamp >= startTime && m.timestamp <= endTime);
  }

  /**
   * メタデータでフィルタリングしたメトリクスを取得する
   * @param key メタデータのキー
   * @param value メタデータの値
   * @returns メトリクスエントリの配列
   */
  public getMetricsByMetadata(key: string, value: any): MetricEntry[] {
    return metricsStore.filter((m) => m.metadata && m.metadata[key] === value);
  }

  /**
   * パーセンタイルを計算する
   * @param name 操作名
   * @param percentile パーセンタイル（0-100）
   * @returns パーセンタイル値（ミリ秒）
   */
  public getPercentile(name: string, percentile: number): number {
    const metrics = getMetrics(name);

    if (metrics.length === 0) {
      return 0;
    }

    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * durations.length) - 1;

    return durations[Math.max(0, index)];
  }

  /**
   * サマリーレポートを生成する
   * @returns サマリーレポート文字列
   */
  public generateSummaryReport(): string {
    const allStats = this.getAllStats();

    if (allStats.length === 0) {
      return 'No metrics recorded.';
    }

    const lines = ['Performance Metrics Summary', '='.repeat(50)];

    for (const stats of allStats) {
      lines.push('');
      lines.push(`Operation: ${stats.name}`);
      lines.push(`  Count: ${stats.count}`);
      lines.push(`  Avg Duration: ${stats.avgDuration.toFixed(2)}ms`);
      lines.push(`  Min Duration: ${stats.minDuration.toFixed(2)}ms`);
      lines.push(`  Max Duration: ${stats.maxDuration.toFixed(2)}ms`);
      lines.push(`  Success Rate: ${stats.successRate.toFixed(2)}%`);
    }

    return lines.join('\n');
  }
}
