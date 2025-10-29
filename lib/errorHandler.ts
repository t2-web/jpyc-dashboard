/**
 * Error Handler
 *
 * エラー分類とハンドリング機能を提供します。
 * User Error、System Error、Business Logic Errorを適切に処理し、
 * ユーザーフレンドリーなエラーメッセージを生成します。
 */

/**
 * エラータイプの列挙型
 */
export enum ErrorType {
  USER_ERROR = 'USER_ERROR', // 4xx - ユーザー起因のエラー
  SYSTEM_ERROR = 'SYSTEM_ERROR', // 5xx - システム起因のエラー
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR', // ビジネスロジックエラー
  UNKNOWN_ERROR = 'UNKNOWN_ERROR', // 不明なエラー
}

/**
 * エラーログのインターフェース
 */
export interface ErrorLog {
  type: ErrorType;
  message: string;
  userMessage: string;
  operation: string;
  timestamp: number;
  recoverable: boolean;
  originalError: Error;
}

/**
 * エラーログの保存用配列（メモリ内）
 */
let errorLogs: ErrorLog[] = [];

/**
 * エラーログの最大保存数
 */
const MAX_ERROR_LOGS = 100;

/**
 * エラーを分類する
 * @param error エラーオブジェクト
 * @returns エラータイプ
 */
export function categorizeError(error: Error): ErrorType {
  const errorMessage = error.message.toLowerCase();

  // HTTPステータスコードベースの分類
  if ('status' in error) {
    const status = (error as any).status;

    // 4xx: User Error
    if (status >= 400 && status < 500) {
      return ErrorType.USER_ERROR;
    }

    // 5xx: System Error
    if (status >= 500 && status < 600) {
      return ErrorType.SYSTEM_ERROR;
    }
  }

  // エラーメッセージベースの分類

  // System Error パターン
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('unavailable') ||
    errorMessage.includes('failed to fetch')
  ) {
    return ErrorType.SYSTEM_ERROR;
  }

  // Business Logic Error パターン
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('integrity') ||
    errorMessage.includes('constraint') ||
    errorMessage.includes('required')
  ) {
    return ErrorType.BUSINESS_LOGIC_ERROR;
  }

  // デフォルト: Unknown Error
  return ErrorType.UNKNOWN_ERROR;
}

/**
 * エラーをハンドリングする
 * @param error エラーオブジェクト
 * @param operation 実行していた操作名
 * @returns エラーログ
 */
export function handleError(error: Error, operation: string): ErrorLog {
  const errorType = categorizeError(error);
  const timestamp = Date.now();

  let message: string;
  let userMessage: string;
  let recoverable: boolean;

  switch (errorType) {
    case ErrorType.USER_ERROR:
      message = `リクエストに問題があります: ${error.message}`;
      userMessage = '入力内容を確認してください。問題が解決しない場合は、再度お試しください。';
      recoverable = true;
      break;

    case ErrorType.SYSTEM_ERROR:
      message = `システムエラーが発生しました: ${error.message}`;
      userMessage = 'しばらく時間をおいて再度お試しください。問題が継続する場合はサポートにお問い合わせください。';
      recoverable = true;
      break;

    case ErrorType.BUSINESS_LOGIC_ERROR:
      message = `データの検証に失敗しました: ${error.message}`;
      userMessage = 'データを確認してください。正しい形式で入力されているか確認してください。';
      recoverable = true;
      break;

    case ErrorType.UNKNOWN_ERROR:
    default:
      message = `予期しないエラーが発生しました: ${error.message}`;
      userMessage =
        '予期しないエラーが発生しました。問題が解決しない場合はサポートにお問い合わせください。';
      recoverable = false;
      break;
  }

  return {
    type: errorType,
    message,
    userMessage,
    operation,
    timestamp,
    recoverable,
    originalError: error,
  };
}

/**
 * エラーログを記録する
 * @param errorLog エラーログ
 */
export function logError(errorLog: ErrorLog): void {
  errorLogs.push(errorLog);

  // 最大保存数を超えた場合、古いログを削除
  if (errorLogs.length > MAX_ERROR_LOGS) {
    errorLogs = errorLogs.slice(errorLogs.length - MAX_ERROR_LOGS);
  }

  // コンソールにも出力（開発環境用）
  if (import.meta.env.DEV) {
    console.error(`[${errorLog.type}] ${errorLog.operation}:`, {
      message: errorLog.message,
      userMessage: errorLog.userMessage,
      timestamp: new Date(errorLog.timestamp).toISOString(),
      recoverable: errorLog.recoverable,
      originalError: errorLog.originalError,
    });
  }
}

/**
 * エラーログを取得する
 * @returns エラーログの配列
 */
export function getErrorLogs(): ErrorLog[] {
  return [...errorLogs];
}

/**
 * エラーログをクリアする
 */
export function clearErrorLogs(): void {
  errorLogs = [];
}
