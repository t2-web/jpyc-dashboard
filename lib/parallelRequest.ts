/**
 * Parallel Request
 *
 * 並列リクエスト処理を効率化し、タイムアウト管理とエラーハンドリングを提供します。
 * - Promise.allによる並列処理
 * - 個別タイムアウト設定
 * - AbortControllerによるキャンセル
 * - エラー発生時の他リクエスト継続
 */

/**
 * タイムアウトエラー
 */
export class TimeoutError extends Error {
  public requestName: string;
  public timeout: number;

  constructor(requestName: string, timeout: number) {
    super(`リクエスト "${requestName}" がタイムアウトしました (${timeout}ms)`);
    this.name = 'TimeoutError';
    this.requestName = requestName;
    this.timeout = timeout;
  }
}

/**
 * リクエスト定義のインターフェース
 */
export interface ParallelRequest<T> {
  /**
   * リクエスト名（識別子）
   */
  name: string;

  /**
   * 実行する非同期関数
   */
  fn: () => Promise<T>;

  /**
   * 個別のタイムアウト（ミリ秒）（オプション）
   */
  timeout?: number;
}

/**
 * 並列リクエスト設定のインターフェース
 */
export interface ParallelRequestConfig {
  /**
   * デフォルトタイムアウト（ミリ秒）
   */
  timeout: number;

  /**
   * AbortSignal（キャンセル用）
   */
  signal?: AbortSignal;

  /**
   * 進捗コールバック
   */
  onProgress?: (completed: number, total: number) => void;
}

/**
 * 個別リクエスト結果のインターフェース
 */
export interface RequestResult<T> {
  /**
   * リクエスト名
   */
  name: string;

  /**
   * ステータス
   */
  status: 'success' | 'error' | 'timeout';

  /**
   * 取得されたデータ（成功時）
   */
  data?: T;

  /**
   * エラー（失敗時）
   */
  error?: Error;

  /**
   * 実行時間（ミリ秒）
   */
  duration: number;
}

/**
 * 並列リクエスト結果のインターフェース
 */
export interface ParallelRequestResult<T> {
  /**
   * 各リクエストの結果
   */
  results: RequestResult<T>[];

  /**
   * 成功したリクエスト数
   */
  successCount: number;

  /**
   * 失敗したリクエスト数（タイムアウト除く）
   */
  failureCount: number;

  /**
   * タイムアウトしたリクエスト数
   */
  timeoutCount: number;

  /**
   * 全体の実行時間（ミリ秒）
   */
  duration: number;
}

/**
 * プロミスにタイムアウトを追加する
 * @param promise プロミス
 * @param timeout タイムアウト（ミリ秒）
 * @param requestName リクエスト名
 * @param signal AbortSignal
 * @returns タイムアウト付きプロミス
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  requestName: string,
  signal?: AbortSignal
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new TimeoutError(requestName, timeout));
      }, timeout);

      // AbortSignalがあればキャンセル処理を追加
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error(`Request "${requestName}" was aborted`));
        });
      }
    }),
  ]);
}

/**
 * 並列リクエストをタイムアウト付きで実行する
 * @param requests リクエスト配列
 * @param config 設定
 * @returns 並列リクエスト結果
 */
export async function executeParallelWithTimeout<T>(
  requests: ParallelRequest<T>[],
  config: ParallelRequestConfig
): Promise<ParallelRequestResult<T>> {
  const startTime = Date.now();

  // キャンセルチェック
  if (config.signal?.aborted) {
    throw new Error('Parallel requests aborted');
  }

  // 全てのリクエストを並列実行
  const promises = requests.map(async (request): Promise<RequestResult<T>> => {
    const requestStartTime = Date.now();
    const requestTimeout = request.timeout ?? config.timeout;

    try {
      // タイムアウト付きでリクエストを実行
      const data = await withTimeout(
        request.fn(),
        requestTimeout,
        request.name,
        config.signal
      );

      const duration = Date.now() - requestStartTime;

      return {
        name: request.name,
        status: 'success',
        data,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - requestStartTime;

      // タイムアウトエラーかどうかを判定
      if (error instanceof TimeoutError) {
        return {
          name: request.name,
          status: 'timeout',
          error: error as Error,
          duration,
        };
      }

      // その他のエラー
      return {
        name: request.name,
        status: 'error',
        error: error as Error,
        duration,
      };
    }
  });

  // Promise.allSettledを使用して、全てのリクエストの完了を待つ
  // （一部が失敗しても他のリクエストを継続）
  const settledResults = await Promise.allSettled(promises);

  // 進捗コールバックを実行
  if (config.onProgress) {
    config.onProgress(settledResults.length, requests.length);
  }

  // 結果を集計
  const results: RequestResult<T>[] = settledResults.map((settled, index) => {
    if (settled.status === 'fulfilled') {
      return settled.value;
    } else {
      // Promise.allSettled でrejectされた場合（通常は起こらないが念のため）
      return {
        name: requests[index].name,
        status: 'error',
        error: settled.reason as Error,
        duration: 0,
      };
    }
  });

  // 統計情報を計算
  const successCount = results.filter((r) => r.status === 'success').length;
  const failureCount = results.filter((r) => r.status === 'error').length;
  const timeoutCount = results.filter((r) => r.status === 'timeout').length;
  const duration = Date.now() - startTime;

  return {
    results,
    successCount,
    failureCount,
    timeoutCount,
    duration,
  };
}

/**
 * 成功したデータのみを抽出するヘルパー関数
 * @param result 並列リクエスト結果
 * @returns 成功したデータの配列
 */
export function extractSuccessData<T>(result: ParallelRequestResult<T>): T[] {
  return result.results
    .filter((r): r is RequestResult<T> & { data: T } => r.status === 'success' && r.data !== undefined)
    .map((r) => r.data);
}

/**
 * エラーとタイムアウトの詳細を取得するヘルパー関数
 * @param result 並列リクエスト結果
 * @returns エラー情報の配列
 */
export function extractErrors<T>(
  result: ParallelRequestResult<T>
): Array<{ name: string; error: Error; type: 'error' | 'timeout' }> {
  return result.results
    .filter((r) => r.status === 'error' || r.status === 'timeout')
    .map((r) => ({
      name: r.name,
      error: r.error!,
      type: r.status as 'error' | 'timeout',
    }));
}
