/**
 * Fallback Strategy
 *
 * 一部またはすべての操作が失敗した場合のフォールバック戦略を提供します。
 * - 一部チェーン失敗時の部分データ表示
 * - 全チェーン失敗時のキャッシュフォールバック
 * - グレースフルデグラデーション（段階的な機能低下）
 */

/**
 * フォールバックステータス
 */
export enum FallbackStatus {
  SUCCESS = 'SUCCESS', // プライマリ操作が成功
  FALLBACK_USED = 'FALLBACK_USED', // フォールバック操作が使用された
  FAILED = 'FAILED', // プライマリとフォールバック両方が失敗
}

/**
 * フォールバック結果のインターフェース
 */
export interface FallbackResult<T> {
  /**
   * 操作名（チェーン名など）
   */
  name?: string;

  /**
   * フォールバックステータス
   */
  status: FallbackStatus;

  /**
   * 取得されたデータ（成功またはフォールバック時）
   */
  data?: T;

  /**
   * フォールバックが使用されたかどうか
   */
  usedFallback: boolean;

  /**
   * プライマリ操作のエラー
   */
  primaryError?: Error;

  /**
   * フォールバック操作のエラー
   */
  fallbackError?: Error;

  /**
   * エラーメッセージ（ユーザー向け）
   */
  error?: string;
}

/**
 * 並列フォールバック実行の結果
 */
export interface ParallelFallbackResult<T> {
  /**
   * 各操作の結果
   */
  results: FallbackResult<T>[];

  /**
   * 少なくとも1つの操作が成功したかどうか
   */
  hasAnySuccess: boolean;

  /**
   * 部分的な成功があるかどうか（一部成功、一部失敗）
   */
  hasPartialSuccess: boolean;

  /**
   * 成功した操作の数
   */
  successCount: number;

  /**
   * フォールバックを使用した操作の数
   */
  fallbackCount: number;

  /**
   * 失敗した操作の数
   */
  failureCount: number;
}

/**
 * 並列操作の定義
 */
export interface ParallelOperation<T> {
  /**
   * 操作名（チェーン名など）
   */
  name: string;

  /**
   * プライマリ操作
   */
  primaryFn: () => Promise<T>;

  /**
   * フォールバック操作（オプション）
   */
  fallbackFn?: () => Promise<T>;
}

/**
 * プライマリ操作を実行し、失敗時にフォールバックを試行する
 * @param primaryFn プライマリ操作
 * @param fallbackFn フォールバック操作（オプション）
 * @returns フォールバック結果
 */
export async function executeWithFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn?: () => Promise<T>
): Promise<FallbackResult<T>> {
  let primaryError: Error | undefined;
  let fallbackError: Error | undefined;

  // プライマリ操作を試行
  try {
    const data = await primaryFn();
    return {
      status: FallbackStatus.SUCCESS,
      data,
      usedFallback: false,
    };
  } catch (error) {
    primaryError = error as Error;

    // 開発環境でのログ出力
    if (import.meta.env.DEV) {
      console.warn('[Fallback] Primary operation failed:', primaryError.message);
    }
  }

  // フォールバック操作を試行
  if (fallbackFn) {
    try {
      const data = await fallbackFn();

      // 開発環境でのログ出力
      if (import.meta.env.DEV) {
        console.info('[Fallback] Fallback operation succeeded');
      }

      return {
        status: FallbackStatus.FALLBACK_USED,
        data,
        usedFallback: true,
        primaryError,
      };
    } catch (error) {
      fallbackError = error as Error;

      // 開発環境でのログ出力
      if (import.meta.env.DEV) {
        console.error('[Fallback] Fallback operation also failed:', fallbackError.message);
      }
    }
  }

  // 両方失敗またはフォールバックなし
  return {
    status: FallbackStatus.FAILED,
    usedFallback: !!fallbackFn,
    primaryError,
    fallbackError,
    error: primaryError?.message || 'Unknown error',
  };
}

/**
 * 複数の操作を並列実行し、各操作でフォールバックを試行する
 * @param operations 並列操作の配列
 * @returns 並列フォールバック実行の結果
 */
export async function executeParallelWithFallback<T>(
  operations: ParallelOperation<T>[]
): Promise<ParallelFallbackResult<T>> {
  // 空の配列の場合
  if (operations.length === 0) {
    return {
      results: [],
      hasAnySuccess: false,
      hasPartialSuccess: false,
      successCount: 0,
      fallbackCount: 0,
      failureCount: 0,
    };
  }

  // 全ての操作を並列実行
  const results = await Promise.all(
    operations.map(async (op) => {
      const result = await executeWithFallback(op.primaryFn, op.fallbackFn);
      return {
        ...result,
        name: op.name,
      };
    })
  );

  // 統計情報を計算
  const successCount = results.filter((r) => r.status === FallbackStatus.SUCCESS).length;
  const fallbackCount = results.filter((r) => r.status === FallbackStatus.FALLBACK_USED).length;
  const failureCount = results.filter((r) => r.status === FallbackStatus.FAILED).length;

  const totalSuccess = successCount + fallbackCount;
  const hasAnySuccess = totalSuccess > 0;
  const hasPartialSuccess = hasAnySuccess && failureCount > 0;

  return {
    results,
    hasAnySuccess,
    hasPartialSuccess,
    successCount,
    fallbackCount,
    failureCount,
  };
}
