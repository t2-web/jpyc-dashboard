import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  ErrorType,
  ErrorLog,
  categorizeError,
  handleError,
  logError,
  getErrorLogs,
  clearErrorLogs,
} from './errorHandler';

describe('Error Handler', () => {
  beforeEach(() => {
    clearErrorLogs();
    vi.clearAllMocks();
  });

  describe('categorizeError', () => {
    test('4xxエラーをUser Errorとして分類すること', () => {
      const error = new Error('Bad Request');
      (error as any).status = 400;

      const result = categorizeError(error);

      expect(result).toBe(ErrorType.USER_ERROR);
    });

    test('404エラーをUser Errorとして分類すること', () => {
      const error = new Error('Not Found');
      (error as any).status = 404;

      const result = categorizeError(error);

      expect(result).toBe(ErrorType.USER_ERROR);
    });

    test('5xxエラーをSystem Errorとして分類すること', () => {
      const error = new Error('Internal Server Error');
      (error as any).status = 500;

      const result = categorizeError(error);

      expect(result).toBe(ErrorType.SYSTEM_ERROR);
    });

    test('503エラーをSystem Errorとして分類すること', () => {
      const error = new Error('Service Unavailable');
      (error as any).status = 503;

      const result = categorizeError(error);

      expect(result).toBe(ErrorType.SYSTEM_ERROR);
    });

    test('タイムアウトエラーをSystem Errorとして分類すること', () => {
      const error = new Error('Request timeout');

      const result = categorizeError(error);

      expect(result).toBe(ErrorType.SYSTEM_ERROR);
    });

    test('ネットワークエラーをSystem Errorとして分類すること', () => {
      const error = new Error('Network error');

      const result = categorizeError(error);

      expect(result).toBe(ErrorType.SYSTEM_ERROR);
    });

    test('バリデーションエラーをBusiness Logic Errorとして分類すること', () => {
      const error = new Error('Validation failed: invalid address format');

      const result = categorizeError(error);

      expect(result).toBe(ErrorType.BUSINESS_LOGIC_ERROR);
    });

    test('データ整合性エラーをBusiness Logic Errorとして分類すること', () => {
      const error = new Error('Data integrity violation');

      const result = categorizeError(error);

      expect(result).toBe(ErrorType.BUSINESS_LOGIC_ERROR);
    });

    test('不明なエラーをUnknown Errorとして分類すること', () => {
      const error = new Error('Unknown error');

      const result = categorizeError(error);

      expect(result).toBe(ErrorType.UNKNOWN_ERROR);
    });

    test('statusがない一般的なErrorをUnknown Errorとして分類すること', () => {
      const error = new Error('Generic error message');

      const result = categorizeError(error);

      expect(result).toBe(ErrorType.UNKNOWN_ERROR);
    });
  });

  describe('handleError', () => {
    test('User Errorの場合、適切なメッセージを返すこと', () => {
      const error = new Error('Bad Request');
      (error as any).status = 400;

      const result = handleError(error, 'testOperation');

      expect(result.type).toBe(ErrorType.USER_ERROR);
      expect(result.message).toContain('リクエストに問題があります');
      expect(result.userMessage).toContain('入力内容を確認してください');
      expect(result.recoverable).toBe(true);
    });

    test('System Errorの場合、適切なメッセージを返すこと', () => {
      const error = new Error('Internal Server Error');
      (error as any).status = 500;

      const result = handleError(error, 'testOperation');

      expect(result.type).toBe(ErrorType.SYSTEM_ERROR);
      expect(result.message).toContain('システムエラーが発生しました');
      expect(result.userMessage).toContain('しばらく時間をおいて再度お試しください');
      expect(result.recoverable).toBe(true);
    });

    test('Business Logic Errorの場合、適切なメッセージを返すこと', () => {
      const error = new Error('Validation failed: invalid address');

      const result = handleError(error, 'testOperation');

      expect(result.type).toBe(ErrorType.BUSINESS_LOGIC_ERROR);
      expect(result.message).toContain('データの検証に失敗しました');
      expect(result.userMessage).toContain('データを確認してください');
      expect(result.recoverable).toBe(true);
    });

    test('Unknown Errorの場合、適切なメッセージを返すこと', () => {
      const error = new Error('Unknown error');

      const result = handleError(error, 'testOperation');

      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(result.message).toContain('予期しないエラーが発生しました');
      expect(result.userMessage).toContain('問題が解決しない場合はサポートにお問い合わせください');
      expect(result.recoverable).toBe(false);
    });

    test('エラーハンドリング時に操作名を記録すること', () => {
      const error = new Error('Test error');

      const result = handleError(error, 'fetchChainData');

      expect(result.operation).toBe('fetchChainData');
    });

    test('エラーハンドリング時にタイムスタンプを記録すること', () => {
      const error = new Error('Test error');
      const beforeTime = Date.now();

      const result = handleError(error, 'testOperation');

      const afterTime = Date.now();
      expect(result.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(result.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('logError', () => {
    test('エラーログを記録できること', () => {
      const errorLog: ErrorLog = {
        type: ErrorType.USER_ERROR,
        message: 'Test error',
        userMessage: 'User-facing message',
        operation: 'testOperation',
        timestamp: Date.now(),
        recoverable: true,
        originalError: new Error('Test error'),
      };

      logError(errorLog);

      const logs = getErrorLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toEqual(errorLog);
    });

    test('複数のエラーログを記録できること', () => {
      const errorLog1: ErrorLog = {
        type: ErrorType.USER_ERROR,
        message: 'Test error 1',
        userMessage: 'User message 1',
        operation: 'operation1',
        timestamp: Date.now(),
        recoverable: true,
        originalError: new Error('Test error 1'),
      };

      const errorLog2: ErrorLog = {
        type: ErrorType.SYSTEM_ERROR,
        message: 'Test error 2',
        userMessage: 'User message 2',
        operation: 'operation2',
        timestamp: Date.now(),
        recoverable: true,
        originalError: new Error('Test error 2'),
      };

      logError(errorLog1);
      logError(errorLog2);

      const logs = getErrorLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0]).toEqual(errorLog1);
      expect(logs[1]).toEqual(errorLog2);
    });

    test('エラーログの最大数（100件）を超えた場合、古いログを削除すること', () => {
      // 101件のエラーログを記録
      for (let i = 0; i < 101; i++) {
        const errorLog: ErrorLog = {
          type: ErrorType.USER_ERROR,
          message: `Test error ${i}`,
          userMessage: `User message ${i}`,
          operation: `operation${i}`,
          timestamp: Date.now() + i,
          recoverable: true,
          originalError: new Error(`Test error ${i}`),
        };
        logError(errorLog);
      }

      const logs = getErrorLogs();
      expect(logs).toHaveLength(100);
      // 最も古いログ（Test error 0）が削除されていることを確認
      expect(logs[0].message).toBe('Test error 1');
      // 最も新しいログ（Test error 100）が残っていることを確認
      expect(logs[99].message).toBe('Test error 100');
    });
  });

  describe('getErrorLogs', () => {
    test('空の配列を返すこと（初期状態）', () => {
      const logs = getErrorLogs();

      expect(logs).toEqual([]);
    });

    test('記録されたエラーログを返すこと', () => {
      const errorLog: ErrorLog = {
        type: ErrorType.USER_ERROR,
        message: 'Test error',
        userMessage: 'User message',
        operation: 'testOperation',
        timestamp: Date.now(),
        recoverable: true,
        originalError: new Error('Test error'),
      };

      logError(errorLog);

      const logs = getErrorLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toEqual(errorLog);
    });
  });

  describe('clearErrorLogs', () => {
    test('エラーログをクリアできること', () => {
      const errorLog: ErrorLog = {
        type: ErrorType.USER_ERROR,
        message: 'Test error',
        userMessage: 'User message',
        operation: 'testOperation',
        timestamp: Date.now(),
        recoverable: true,
        originalError: new Error('Test error'),
      };

      logError(errorLog);
      expect(getErrorLogs()).toHaveLength(1);

      clearErrorLogs();

      expect(getErrorLogs()).toEqual([]);
    });
  });

  describe('Integration scenarios', () => {
    test('実際のエラーシナリオ: API 404エラー', () => {
      const error = new Error('API endpoint not found');
      (error as any).status = 404;

      const result = handleError(error, 'fetchTotalSupply');
      logError(result);

      expect(result.type).toBe(ErrorType.USER_ERROR);
      expect(result.recoverable).toBe(true);

      const logs = getErrorLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].operation).toBe('fetchTotalSupply');
    });

    test('実際のエラーシナリオ: ネットワークタイムアウト', () => {
      const error = new Error('Request timeout after 10 seconds');

      const result = handleError(error, 'fetchHoldersData');
      logError(result);

      expect(result.type).toBe(ErrorType.SYSTEM_ERROR);
      expect(result.recoverable).toBe(true);

      const logs = getErrorLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].operation).toBe('fetchHoldersData');
    });

    test('実際のエラーシナリオ: アドレスバリデーションエラー', () => {
      const error = new Error('Validation failed: invalid Ethereum address format');

      const result = handleError(error, 'validateAddress');
      logError(result);

      expect(result.type).toBe(ErrorType.BUSINESS_LOGIC_ERROR);
      expect(result.recoverable).toBe(true);

      const logs = getErrorLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].operation).toBe('validateAddress');
    });
  });
});
