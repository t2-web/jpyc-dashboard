/**
 * Rate Limiter
 *
 * APIレート制限を管理し、スライディングウィンドウアルゴリズムを使用して
 * リクエストレートを制御します。
 */

/**
 * レート制限設定のインターフェース
 */
export interface RateLimitConfig {
  /**
   * ウィンドウ期間内の最大リクエスト数
   */
  maxRequests: number;

  /**
   * ウィンドウ期間（ミリ秒）
   */
  windowMs: number;
}

/**
 * レート制限チェック結果のインターフェース
 */
export interface RateLimitResult {
  /**
   * リクエストが許可されたかどうか
   */
  allowed: boolean;

  /**
   * 残りリクエスト数
   */
  remaining: number;

  /**
   * リセット時刻（Unix timestamp）
   */
  resetTime: number;

  /**
   * 再試行までの待機時間（ミリ秒）（拒否された場合のみ）
   */
  retryAfter?: number;
}

/**
 * リクエスト履歴のインターフェース
 */
interface RequestHistory {
  /**
   * リクエストタイムスタンプの配列
   */
  timestamps: number[];

  /**
   * ウィンドウのリセット時刻
   */
  resetTime: number;
}

/**
 * レート制限超過エラー
 */
export class RateLimitExceededError extends Error {
  public apiKey: string;
  public retryAfter: number;
  public resetTime: number;

  constructor(apiKey: string, retryAfter: number, resetTime: number) {
    super(`レート制限を超えました (API: ${apiKey}). ${Math.ceil(retryAfter / 1000)}秒後に再試行してください。`);
    this.name = 'RateLimitExceededError';
    this.apiKey = apiKey;
    this.retryAfter = retryAfter;
    this.resetTime = resetTime;
  }
}

/**
 * レート制限管理クラス
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private history: Map<string, RequestHistory>;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.history = new Map();
  }

  /**
   * スライディングウィンドウから古いタイムスタンプを削除
   * @param timestamps タイムスタンプ配列
   * @param now 現在時刻
   * @returns クリーンアップされたタイムスタンプ配列
   */
  private cleanupOldTimestamps(timestamps: number[], now: number): number[] {
    const cutoff = now - this.config.windowMs;
    return timestamps.filter((ts) => ts > cutoff);
  }

  /**
   * リクエストの取得を試みる
   * @param apiKey APIキー（識別子）
   * @returns レート制限チェック結果
   */
  public tryAcquire(apiKey: string): RateLimitResult {
    const now = Date.now();

    // 履歴を取得または初期化
    let history = this.history.get(apiKey);
    if (!history) {
      history = {
        timestamps: [],
        resetTime: now + this.config.windowMs,
      };
      this.history.set(apiKey, history);
    }

    // 古いタイムスタンプをクリーンアップ
    history.timestamps = this.cleanupOldTimestamps(history.timestamps, now);

    // ウィンドウ期間が経過していたらリセット
    if (now >= history.resetTime) {
      history.timestamps = [];
      history.resetTime = now + this.config.windowMs;
    }

    // リクエスト数をチェック
    const currentRequests = history.timestamps.length;
    const remaining = Math.max(0, this.config.maxRequests - currentRequests - 1);

    if (currentRequests >= this.config.maxRequests) {
      // レート制限超過
      const oldestTimestamp = Math.min(...history.timestamps);
      const retryAfter = oldestTimestamp + this.config.windowMs - now;

      return {
        allowed: false,
        remaining: 0,
        resetTime: history.resetTime,
        retryAfter: Math.max(0, retryAfter),
      };
    }

    // リクエストを記録
    history.timestamps.push(now);

    return {
      allowed: true,
      remaining,
      resetTime: history.resetTime,
    };
  }

  /**
   * 特定のAPIキーの履歴をリセット
   * @param apiKey APIキー
   */
  public reset(apiKey: string): void {
    this.history.delete(apiKey);
  }

  /**
   * 全ての履歴をリセット
   */
  public resetAll(): void {
    this.history.clear();
  }

  /**
   * 現在のリクエスト統計を取得
   * @param apiKey APIキー
   * @returns 現在のリクエスト数と残り数
   */
  public getStats(apiKey: string): { current: number; remaining: number } {
    const now = Date.now();
    const history = this.history.get(apiKey);

    if (!history) {
      return { current: 0, remaining: this.config.maxRequests };
    }

    const cleanTimestamps = this.cleanupOldTimestamps(history.timestamps, now);
    const current = cleanTimestamps.length;
    const remaining = Math.max(0, this.config.maxRequests - current);

    return { current, remaining };
  }
}

/**
 * グローバルレート制限マネージャー
 */
const globalLimiters = new Map<string, RateLimiter>();

/**
 * レート制限をチェックする（簡易版）
 * @param apiKey APIキー
 * @param config レート制限設定
 * @returns リクエストが許可される場合true
 */
export function checkRateLimit(apiKey: string, config: RateLimitConfig): boolean {
  const key = `${apiKey}_${config.maxRequests}_${config.windowMs}`;

  let limiter = globalLimiters.get(key);
  if (!limiter) {
    limiter = new RateLimiter(config);
    globalLimiters.set(key, limiter);
  }

  const result = limiter.tryAcquire(apiKey);
  return result.allowed;
}

/**
 * レート制限を強制する関数ラッパー
 * @param apiKey APIキー
 * @param fn 実行する関数
 * @param config レート制限設定
 * @returns 関数の実行結果
 * @throws RateLimitExceededError レート制限を超えた場合
 */
export async function enforceRateLimit<T>(
  apiKey: string,
  fn: () => Promise<T>,
  config: RateLimitConfig
): Promise<T> {
  const key = `${apiKey}_${config.maxRequests}_${config.windowMs}`;

  let limiter = globalLimiters.get(key);
  if (!limiter) {
    limiter = new RateLimiter(config);
    globalLimiters.set(key, limiter);
  }

  const result = limiter.tryAcquire(apiKey);

  if (!result.allowed) {
    throw new RateLimitExceededError(apiKey, result.retryAfter || 0, result.resetTime);
  }

  return await fn();
}

/**
 * グローバルレート制限マネージャーをリセット
 * @param apiKey 特定のAPIキー（省略時は全てリセット）
 */
export function resetRateLimit(apiKey?: string): void {
  if (apiKey) {
    for (const [key, limiter] of globalLimiters.entries()) {
      if (key.startsWith(apiKey)) {
        limiter.reset(apiKey);
      }
    }
  } else {
    globalLimiters.clear();
  }
}
