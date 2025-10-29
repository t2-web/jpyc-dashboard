import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadBlacklistAddresses, isBlacklisted, validateEthereumAddress } from './blacklist';

describe('Blacklist Address Management', () => {
  const originalEnv = import.meta.env;

  beforeEach(() => {
    // 環境変数をリセット
    vi.resetModules();
  });

  afterEach(() => {
    // 環境変数を元に戻す
    import.meta.env = originalEnv;
  });

  describe('validateEthereumAddress', () => {
    test('有効なEthereumアドレスを検証できること', () => {
      const validAddress = '0x1234567890123456789012345678901234567890';
      expect(validateEthereumAddress(validAddress)).toBe(true);
    });

    test('無効なアドレス（0xプレフィックスなし）を検出できること', () => {
      const invalidAddress = '1234567890123456789012345678901234567890';
      expect(validateEthereumAddress(invalidAddress)).toBe(false);
    });

    test('無効なアドレス（長さ不足）を検出できること', () => {
      const invalidAddress = '0x12345';
      expect(validateEthereumAddress(invalidAddress)).toBe(false);
    });

    test('無効なアドレス（長さ超過）を検出できること', () => {
      const invalidAddress = '0x12345678901234567890123456789012345678901234567890';
      expect(validateEthereumAddress(invalidAddress)).toBe(false);
    });

    test('無効なアドレス（不正な文字）を検出できること', () => {
      const invalidAddress = '0x123456789012345678901234567890123456789g';
      expect(validateEthereumAddress(invalidAddress)).toBe(false);
    });

    test('大文字小文字が混在したアドレスを検証できること', () => {
      const mixedCaseAddress = '0xAbCdEf1234567890123456789012345678901234';
      expect(validateEthereumAddress(mixedCaseAddress)).toBe(true);
    });

    test('空文字列を無効と判定できること', () => {
      expect(validateEthereumAddress('')).toBe(false);
    });

    test('nullを無効と判定できること', () => {
      expect(validateEthereumAddress(null as any)).toBe(false);
    });

    test('undefinedを無効と判定できること', () => {
      expect(validateEthereumAddress(undefined as any)).toBe(false);
    });
  });

  describe('loadBlacklistAddresses', () => {
    test('環境変数からブラックリストアドレスを読み込めること', () => {
      const mockEnv = {
        VITE_BLACKLIST_ADDRESSES: '0x1234567890123456789012345678901234567890,0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      };

      const addresses = loadBlacklistAddresses(mockEnv as any);

      expect(addresses).toHaveLength(2);
      expect(addresses).toContain('0x1234567890123456789012345678901234567890');
      expect(addresses).toContain('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
    });

    test('環境変数が空文字列の場合、空配列を返すこと', () => {
      const mockEnv = {
        VITE_BLACKLIST_ADDRESSES: '',
      };

      const addresses = loadBlacklistAddresses(mockEnv as any);

      expect(addresses).toEqual([]);
    });

    test('環境変数が未定義の場合、空配列を返すこと', () => {
      const mockEnv = {};

      const addresses = loadBlacklistAddresses(mockEnv as any);

      expect(addresses).toEqual([]);
    });

    test('無効なアドレスを除外すること', () => {
      const mockEnv = {
        VITE_BLACKLIST_ADDRESSES: '0x1234567890123456789012345678901234567890,invalid,0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      };

      const addresses = loadBlacklistAddresses(mockEnv as any);

      expect(addresses).toHaveLength(2);
      expect(addresses).not.toContain('invalid');
    });

    test('前後の空白をトリムすること', () => {
      const mockEnv = {
        VITE_BLACKLIST_ADDRESSES: ' 0x1234567890123456789012345678901234567890 , 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd ',
      };

      const addresses = loadBlacklistAddresses(mockEnv as any);

      expect(addresses).toHaveLength(2);
      expect(addresses).toContain('0x1234567890123456789012345678901234567890');
      expect(addresses).toContain('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
    });

    test('重複したアドレスを除外すること', () => {
      const mockEnv = {
        VITE_BLACKLIST_ADDRESSES:
          '0x1234567890123456789012345678901234567890,0x1234567890123456789012345678901234567890,0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      };

      const addresses = loadBlacklistAddresses(mockEnv as any);

      expect(addresses).toHaveLength(2);
      expect(addresses.filter((addr) => addr === '0x1234567890123456789012345678901234567890')).toHaveLength(1);
    });

    test('大文字小文字を正規化すること（小文字に統一）', () => {
      const mockEnv = {
        VITE_BLACKLIST_ADDRESSES: '0xABCDEF1234567890123456789012345678901234,0xabcdef1234567890123456789012345678901234',
      };

      const addresses = loadBlacklistAddresses(mockEnv as any);

      expect(addresses).toHaveLength(1);
      expect(addresses[0]).toBe('0xabcdef1234567890123456789012345678901234');
    });

    test('単一のアドレスを正しく処理できること', () => {
      const mockEnv = {
        VITE_BLACKLIST_ADDRESSES: '0x1234567890123456789012345678901234567890',
      };

      const addresses = loadBlacklistAddresses(mockEnv as any);

      expect(addresses).toHaveLength(1);
      expect(addresses[0]).toBe('0x1234567890123456789012345678901234567890');
    });
  });

  describe('isBlacklisted', () => {
    test('ブラックリストに含まれるアドレスをtrueと判定できること', () => {
      const blacklist = ['0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'];
      const address = '0x1234567890123456789012345678901234567890';

      expect(isBlacklisted(address, blacklist)).toBe(true);
    });

    test('ブラックリストに含まれないアドレスをfalseと判定できること', () => {
      const blacklist = ['0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'];
      const address = '0x9999999999999999999999999999999999999999';

      expect(isBlacklisted(address, blacklist)).toBe(false);
    });

    test('大文字小文字を区別せずに判定できること', () => {
      const blacklist = ['0x1234567890123456789012345678901234567890'];
      const address = '0x1234567890123456789012345678901234567890'.toUpperCase();

      expect(isBlacklisted(address, blacklist)).toBe(true);
    });

    test('空のブラックリストに対してfalseを返すこと', () => {
      const blacklist: string[] = [];
      const address = '0x1234567890123456789012345678901234567890';

      expect(isBlacklisted(address, blacklist)).toBe(false);
    });

    test('無効なアドレスに対してfalseを返すこと', () => {
      const blacklist = ['0x1234567890123456789012345678901234567890'];
      const invalidAddress = 'invalid';

      expect(isBlacklisted(invalidAddress, blacklist)).toBe(false);
    });

    test('nullアドレスに対してfalseを返すこと', () => {
      const blacklist = ['0x1234567890123456789012345678901234567890'];

      expect(isBlacklisted(null as any, blacklist)).toBe(false);
    });

    test('undefinedアドレスに対してfalseを返すこと', () => {
      const blacklist = ['0x1234567890123456789012345678901234567890'];

      expect(isBlacklisted(undefined as any, blacklist)).toBe(false);
    });
  });
});
