import { describe, test, expect } from 'vitest';
import { calculateBlacklistedSupply, calculateCirculatingSupply } from './supplyCalculation';
import type { HolderSnapshot } from './holderFilter';

describe('Supply Calculation', () => {
  const createMockHolder = (address: string, balanceRaw: bigint): HolderSnapshot => ({
    address,
    name: `Holder ${address.slice(0, 6)}`,
    chain: 'Ethereum',
    balanceRaw,
    quantity: '1000.00',
    percentage: '1.00',
  });

  describe('calculateBlacklistedSupply', () => {
    test('ブラックリストアドレスの総保有量を計算できること', () => {
      const holders: HolderSnapshot[] = [
        createMockHolder('0x1111111111111111111111111111111111111111', 1000n),
        createMockHolder('0x2222222222222222222222222222222222222222', 2000n),
        createMockHolder('0x3333333333333333333333333333333333333333', 3000n),
      ];

      const blacklist = ['0x2222222222222222222222222222222222222222'];

      const blacklistedSupply = calculateBlacklistedSupply(holders, blacklist);

      expect(blacklistedSupply).toBe(2000n);
    });

    test('複数のブラックリストアドレスの総保有量を計算できること', () => {
      const holders: HolderSnapshot[] = [
        createMockHolder('0x1111111111111111111111111111111111111111', 1000n),
        createMockHolder('0x2222222222222222222222222222222222222222', 2000n),
        createMockHolder('0x3333333333333333333333333333333333333333', 3000n),
        createMockHolder('0x4444444444444444444444444444444444444444', 4000n),
      ];

      const blacklist = [
        '0x2222222222222222222222222222222222222222',
        '0x4444444444444444444444444444444444444444',
      ];

      const blacklistedSupply = calculateBlacklistedSupply(holders, blacklist);

      expect(blacklistedSupply).toBe(6000n); // 2000 + 4000
    });

    test('ブラックリストが空の場合、0を返すこと', () => {
      const holders: HolderSnapshot[] = [
        createMockHolder('0x1111111111111111111111111111111111111111', 1000n),
        createMockHolder('0x2222222222222222222222222222222222222222', 2000n),
      ];

      const blacklist: string[] = [];

      const blacklistedSupply = calculateBlacklistedSupply(holders, blacklist);

      expect(blacklistedSupply).toBe(0n);
    });

    test('ブラックリストに該当するホルダーがいない場合、0を返すこと', () => {
      const holders: HolderSnapshot[] = [
        createMockHolder('0x1111111111111111111111111111111111111111', 1000n),
        createMockHolder('0x2222222222222222222222222222222222222222', 2000n),
      ];

      const blacklist = ['0x9999999999999999999999999999999999999999'];

      const blacklistedSupply = calculateBlacklistedSupply(holders, blacklist);

      expect(blacklistedSupply).toBe(0n);
    });

    test('ホルダー配列が空の場合、0を返すこと', () => {
      const holders: HolderSnapshot[] = [];
      const blacklist = ['0x1111111111111111111111111111111111111111'];

      const blacklistedSupply = calculateBlacklistedSupply(holders, blacklist);

      expect(blacklistedSupply).toBe(0n);
    });

    test('大きな数値でも正しく計算できること', () => {
      const holders: HolderSnapshot[] = [
        createMockHolder('0x1111111111111111111111111111111111111111', 1000000000000000000000n), // 1000 tokens (18 decimals)
        createMockHolder('0x2222222222222222222222222222222222222222', 2000000000000000000000n), // 2000 tokens
        createMockHolder('0x3333333333333333333333333333333333333333', 3000000000000000000000n), // 3000 tokens
      ];

      const blacklist = [
        '0x1111111111111111111111111111111111111111',
        '0x3333333333333333333333333333333333333333',
      ];

      const blacklistedSupply = calculateBlacklistedSupply(holders, blacklist);

      expect(blacklistedSupply).toBe(4000000000000000000000n); // 4000 tokens
    });

    test('大文字小文字を区別せずに計算できること', () => {
      const holders: HolderSnapshot[] = [
        createMockHolder('0xABCDEF1234567890123456789012345678901234', 1000n),
        createMockHolder('0x2222222222222222222222222222222222222222', 2000n),
      ];

      const blacklist = ['0xabcdef1234567890123456789012345678901234']; // 小文字

      const blacklistedSupply = calculateBlacklistedSupply(holders, blacklist);

      expect(blacklistedSupply).toBe(1000n);
    });
  });

  describe('calculateCirculatingSupply', () => {
    test('流通供給量を正しく計算できること', () => {
      const totalSupply = 10000n;
      const blacklistedSupply = 3000n;

      const circulatingSupply = calculateCirculatingSupply(totalSupply, blacklistedSupply);

      expect(circulatingSupply).toBe(7000n);
    });

    test('ブラックリスト保有量が0の場合、総供給量と同じ値を返すこと', () => {
      const totalSupply = 10000n;
      const blacklistedSupply = 0n;

      const circulatingSupply = calculateCirculatingSupply(totalSupply, blacklistedSupply);

      expect(circulatingSupply).toBe(10000n);
    });

    test('大きな数値でも正しく計算できること', () => {
      const totalSupply = 10000000000000000000000n; // 10000 tokens (18 decimals)
      const blacklistedSupply = 3000000000000000000000n; // 3000 tokens

      const circulatingSupply = calculateCirculatingSupply(totalSupply, blacklistedSupply);

      expect(circulatingSupply).toBe(7000000000000000000000n); // 7000 tokens
    });

    test('ブラックリスト保有量が総供給量と同じ場合、0を返すこと', () => {
      const totalSupply = 10000n;
      const blacklistedSupply = 10000n;

      const circulatingSupply = calculateCirculatingSupply(totalSupply, blacklistedSupply);

      expect(circulatingSupply).toBe(0n);
    });

    test('ブラックリスト保有量が総供給量を超える場合、0を返すこと（データ異常ケース）', () => {
      const totalSupply = 10000n;
      const blacklistedSupply = 15000n;

      const circulatingSupply = calculateCirculatingSupply(totalSupply, blacklistedSupply);

      // データ異常だが、負の値ではなく0を返すべき
      expect(circulatingSupply).toBe(0n);
    });

    test('総供給量が0の場合、0を返すこと', () => {
      const totalSupply = 0n;
      const blacklistedSupply = 0n;

      const circulatingSupply = calculateCirculatingSupply(totalSupply, blacklistedSupply);

      expect(circulatingSupply).toBe(0n);
    });
  });
});
