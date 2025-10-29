/**
 * Retry With Backoff
 *
 * 指数バックオフアルゴリズムを使用したリトライ機構を提供します。
 * APIレート制限エラーやタイムアウトエラーに対応します。
 */

/**
 * リトライ設定のインターフェース
 */
export interface RetryConfig {
  /**
   * 最大リトライ回数（デフォルト: 3）
   */
  maxRetries?: number;

  /**
   * 初回リトライまでの遅延時間（ミリ秒）（デフォルト: 1000）
   */
  initialDelay?: number;

  /**
   * 最大遅延時間（ミリ秒）（デフォルト: 10000）
   */
  maxDelay?: number;

  /**
   * バックオフ係数（デフォルト: 2）
   */
  backoffFactor?: number;

  /**
   * リトライ可能なHTTPステータスコード（デフォルト: [429, 500, 502, 503, 504]）
   */
  retryableErrors?: number[];

  /**
   * リトライ時のコールバック関数
   */
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

/**
 * リトライエラークラス
 */
export class RetryError extends Error {
  public attempts: number;
  public lastError: Error;

  constructor(message: string, attempts: number, lastError: Error) {
    super(message);
    this.name = 'RetryError';
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

/**
 * デフォルトのリトライ設定
 */
const DEFAULT_CONFIG: Required<Omit<RetryConfig, 'onRetry'>> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [429, 500, 502, 503, 504],
};

/**
 * エラーがリトライ可能かどうかを判定する
 * @param error エラーオブジェクト
 * @param retryableErrors リトライ可能なステータスコードの配列
 * @returns リトライ可能な場合true
 */
function isRetryableError(error: Error, retryableErrors: number[]): boolean {
  // HTTPステータスコードベースの判定
  if ('status' in error) {
    const status = (error as any).status;
    if (retryableErrors.includes(status)) {
      return true;
    }
  }

  // エラーメッセージベースの判定
  const errorMessage = error.message.toLowerCase();
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('network') ||
    errorMessage.includes('econnreset') ||
    errorMessage.includes('connection reset') ||
    errorMessage.includes('enotfound') ||
    errorMessage.includes('temporarily unavailable')
  ) {
    return true;
  }

  return false;
}

/**
 * 指数バックオフアルゴリズムで遅延時間を計算する
 * @param attempt リトライ回数（0から開始）
 * @param config リトライ設定
 * @returns 遅延時間（ミリ秒）
 */
function calculateDelay(attempt: number, config: Required<Omit<RetryConfig, 'onRetry'>>): number {
  const delay = config.initialDelay * Math.pow(config.backoffFactor, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * 指定された関数を指数バックオフでリトライする
 * @param fn 実行する非同期関数
 * @param config リトライ設定
 * @returns 関数の実行結果
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const mergedConfig: Required<Omit<RetryConfig, 'onRetry'>> = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;
  let attempt = 0;

  while (attempt <= mergedConfig.maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // 最大リトライ回数に達した場合
      if (attempt >= mergedConfig.maxRetries) {
        throw new RetryError(
          `最大リトライ回数（${mergedConfig.maxRetries}回）を超えました: ${lastError.message}`,
          attempt + 1,
          lastError
        );
      }

      // リトライ可能なエラーかどうかを判定
      if (!isRetryableError(lastError, mergedConfig.retryableErrors)) {
        throw lastError;
      }

      // 遅延時間を計算
      const delay = calculateDelay(attempt, mergedConfig);

      // onRetryコールバックを実行
      if (config.onRetry) {
        config.onRetry(lastError, attempt + 1, delay);
      }

      // 開発環境ではリトライ情報をログ出力
      if (import.meta.env.DEV) {
        console.warn(
          `[Retry] Attempt ${attempt + 1}/${mergedConfig.maxRetries} failed. Retrying in ${delay}ms...`,
          {
            error: lastError.message,
            attempt: attempt + 1,
            delay,
          }
        );
      }

      // 遅延を待機
      await new Promise((resolve) => setTimeout(resolve, delay));

      attempt++;
    }
  }

  // このコードには到達しないはずだが、TypeScriptのために必要
  throw new RetryError(
    `最大リトライ回数（${mergedConfig.maxRetries}回）を超えました`,
    attempt,
    lastError!
  );
}
