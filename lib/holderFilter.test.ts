import { describe, test, expect } from 'vitest';
import { filterBlacklistedHolders } from './holderFilter';
import type { HolderSnapshot } from '../hooks/useJpycOnChainDataWithSWR';

describe('Holder Filtering', () => {
  const createMockHolder = (address: string, balanceRaw: bigint = 1000n): HolderSnapshot => ({
    address,
    name: `Holder ${address.slice(0, 6)}`,
    chain: 'Ethereum',
    balanceRaw,
    quantity: '1000.00',
    percentage: '1.00',
    rank: 1,
  });

  describe('filterBlacklistedHolders', () => {
    test('ブラックリストに含まれるホルダーを除外できること', () => {
      const holders: HolderSnapshot[] = [
        createMockHolder('0x1111111111111111111111111111111111111111'),
        createMockHolder('0x2222222222222222222222222222222222222222'),
        createMockHolder('0x3333333333333333333333333333333333333333'),
      ];

      const blacklist = ['0x2222222222222222222222222222222222222222'];

      const filtered = filterBlacklistedHolders(holders, blacklist);

      expect(filtered).toHaveLength(2);
      expect(filtered.map((h) => h.address)).toEqual([
        '0x1111111111111111111111111111111111111111',
        '0x3333333333333333333333333333333333333333',
      ]);
    });

    test('複数のブラックリストアドレスを除外できること', () => {
      const holders: HolderSnapshot[] = [
        createMockHolder('0x1111111111111111111111111111111111111111'),
        createMockHolder('0x2222222222222222222222222222222222222222'),
        createMockHolder('0x3333333333333333333333333333333333333333'),
        createMockHolder('0x4444444444444444444444444444444444444444'),
      ];

      const blacklist = [
        '0x2222222222222222222222222222222222222222',
        '0x4444444444444444444444444444444444444444',
      ];

      const filtered = filterBlacklistedHolders(holders, blacklist);

      expect(filtered).toHaveLength(2);
      expect(filtered.map((h) => h.address)).toEqual([
        '0x1111111111111111111111111111111111111111',
        '0x3333333333333333333333333333333333333333',
      ]);
    });

    test('空のブラックリストの場合、すべてのホルダーを返すこと', () => {
      const holders: HolderSnapshot[] = [
        createMockHolder('0x1111111111111111111111111111111111111111'),
        createMockHolder('0x2222222222222222222222222222222222222222'),
      ];

      const blacklist: string[] = [];

      const filtered = filterBlacklistedHolders(holders, blacklist);

      expect(filtered).toHaveLength(2);
      expect(filtered).toEqual(holders);
    });

    test('すべてのホルダーがブラックリストに含まれる場合、空配列を返すこと', () => {
      const holders: HolderSnapshot[] = [
        createMockHolder('0x1111111111111111111111111111111111111111'),
        createMockHolder('0x2222222222222222222222222222222222222222'),
      ];

      const blacklist = [
        '0x1111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222',
      ];

      const filtered = filterBlacklistedHolders(holders, blacklist);

      expect(filtered).toHaveLength(0);
    });

    test('大文字小文字を区別せずにフィルタリングできること', () => {
      const holders: HolderSnapshot[] = [
        createMockHolder('0xABCDEF1234567890123456789012345678901234'),
        createMockHolder('0x2222222222222222222222222222222222222222'),
      ];

      const blacklist = ['0xabcdef1234567890123456789012345678901234']; // 小文字

      const filtered = filterBlacklistedHolders(holders, blacklist);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].address).toBe('0x2222222222222222222222222222222222222222');
    });

    test('ホルダー配列が空の場合、空配列を返すこと', () => {
      const holders: HolderSnapshot[] = [];
      const blacklist = ['0x1111111111111111111111111111111111111111'];

      const filtered = filterBlacklistedHolders(holders, blacklist);

      expect(filtered).toHaveLength(0);
    });

    test('元の配列を変更しないこと（immutability）', () => {
      const holders: HolderSnapshot[] = [
        createMockHolder('0x1111111111111111111111111111111111111111'),
        createMockHolder('0x2222222222222222222222222222222222222222'),
      ];

      const blacklist = ['0x2222222222222222222222222222222222222222'];

      const filtered = filterBlacklistedHolders(holders, blacklist);

      expect(holders).toHaveLength(2); // 元の配列は変更されていない
      expect(filtered).toHaveLength(1);
    });

    test('ブラックリストに存在しないアドレスは影響を受けないこと', () => {
      const holders: HolderSnapshot[] = [
        createMockHolder('0x1111111111111111111111111111111111111111'),
        createMockHolder('0x2222222222222222222222222222222222222222'),
      ];

      const blacklist = ['0x9999999999999999999999999999999999999999'];

      const filtered = filterBlacklistedHolders(holders, blacklist);

      expect(filtered).toHaveLength(2);
      expect(filtered).toEqual(holders);
    });

    test('ホルダーのプロパティが正しく保持されること', () => {
      const holder = createMockHolder('0x1111111111111111111111111111111111111111', 5000n);
      holder.quantity = '5000.00';
      holder.percentage = '5.00';
      holder.rank = 10;

      const holders: HolderSnapshot[] = [holder, createMockHolder('0x2222222222222222222222222222222222222222')];

      const blacklist = ['0x2222222222222222222222222222222222222222'];

      const filtered = filterBlacklistedHolders(holders, blacklist);

      expect(filtered).toHaveLength(1);
      expect(filtered[0]).toEqual(holder);
      expect(filtered[0].balanceRaw).toBe(5000n);
      expect(filtered[0].quantity).toBe('5000.00');
      expect(filtered[0].percentage).toBe('5.00');
      expect(filtered[0].rank).toBe(10);
    });
  });
});
