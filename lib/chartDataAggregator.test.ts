import { describe, test, expect } from 'vitest';
import {
  aggregateChainData,
  calculateChainPercentages,
  convertToRechartsFormat,
  type ChainData,
  type ChartDataPoint,
} from './chartDataAggregator';

describe('Chart Data Aggregator', () => {
  describe('aggregateChainData', () => {
    test('チェーン別データを集約できること', () => {
      const mockHolders = [
        { chain: 'Ethereum', balanceRaw: 1000n, address: '0x111', name: 'Holder1', quantity: '1000', percentage: '10' },
        { chain: 'Ethereum', balanceRaw: 2000n, address: '0x222', name: 'Holder2', quantity: '2000', percentage: '20' },
        { chain: 'Polygon', balanceRaw: 3000n, address: '0x333', name: 'Holder3', quantity: '3000', percentage: '30' },
        { chain: 'Avalanche', balanceRaw: 4000n, address: '0x444', name: 'Holder4', quantity: '4000', percentage: '40' },
      ];

      const result = aggregateChainData(mockHolders);

      expect(result).toHaveLength(3);
      expect(result.find((d) => d.chain === 'Ethereum')?.totalSupply).toBe(3000n);
      expect(result.find((d) => d.chain === 'Polygon')?.totalSupply).toBe(3000n);
      expect(result.find((d) => d.chain === 'Avalanche')?.totalSupply).toBe(4000n);
    });

    test('保有者数をカウントできること', () => {
      const mockHolders = [
        { chain: 'Ethereum', balanceRaw: 1000n, address: '0x111', name: 'Holder1', quantity: '1000', percentage: '10' },
        { chain: 'Ethereum', balanceRaw: 2000n, address: '0x222', name: 'Holder2', quantity: '2000', percentage: '20' },
        { chain: 'Polygon', balanceRaw: 3000n, address: '0x333', name: 'Holder3', quantity: '3000', percentage: '30' },
      ];

      const result = aggregateChainData(mockHolders);

      expect(result.find((d) => d.chain === 'Ethereum')?.holdersCount).toBe(2);
      expect(result.find((d) => d.chain === 'Polygon')?.holdersCount).toBe(1);
    });

    test('空の配列を処理できること', () => {
      const result = aggregateChainData([]);
      expect(result).toEqual([]);
    });

    test('残高が0のホルダーを除外すること', () => {
      const mockHolders = [
        { chain: 'Ethereum', balanceRaw: 1000n, address: '0x111', name: 'Holder1', quantity: '1000', percentage: '10' },
        { chain: 'Ethereum', balanceRaw: 0n, address: '0x222', name: 'Holder2', quantity: '0', percentage: '0' },
      ];

      const result = aggregateChainData(mockHolders);

      expect(result.find((d) => d.chain === 'Ethereum')?.totalSupply).toBe(1000n);
      expect(result.find((d) => d.chain === 'Ethereum')?.holdersCount).toBe(1);
    });
  });

  describe('calculateChainPercentages', () => {
    test('チェーン別総供給量のパーセンテージを計算できること', () => {
      const chainData: ChainData[] = [
        { chain: 'Ethereum', totalSupply: 6000n, holdersCount: 2 },
        { chain: 'Polygon', totalSupply: 3000n, holdersCount: 1 },
        { chain: 'Avalanche', totalSupply: 1000n, holdersCount: 1 },
      ];

      const result = calculateChainPercentages(chainData);

      expect(result.find((d) => d.chain === 'Ethereum')?.supplyPercentage).toBe(60);
      expect(result.find((d) => d.chain === 'Polygon')?.supplyPercentage).toBe(30);
      expect(result.find((d) => d.chain === 'Avalanche')?.supplyPercentage).toBe(10);
    });

    test('チェーン別保有者数のパーセンテージを計算できること', () => {
      const chainData: ChainData[] = [
        { chain: 'Ethereum', totalSupply: 1000n, holdersCount: 50 },
        { chain: 'Polygon', totalSupply: 1000n, holdersCount: 30 },
        { chain: 'Avalanche', totalSupply: 1000n, holdersCount: 20 },
      ];

      const result = calculateChainPercentages(chainData);

      expect(result.find((d) => d.chain === 'Ethereum')?.holdersPercentage).toBe(50);
      expect(result.find((d) => d.chain === 'Polygon')?.holdersPercentage).toBe(30);
      expect(result.find((d) => d.chain === 'Avalanche')?.holdersPercentage).toBe(20);
    });

    test('合計が100%になることを検証すること', () => {
      const chainData: ChainData[] = [
        { chain: 'Ethereum', totalSupply: 6000n, holdersCount: 60 },
        { chain: 'Polygon', totalSupply: 3000n, holdersCount: 30 },
        { chain: 'Avalanche', totalSupply: 1000n, holdersCount: 10 },
      ];

      const result = calculateChainPercentages(chainData);

      const totalSupplyPercentage = result.reduce((sum, d) => sum + d.supplyPercentage, 0);
      const totalHoldersPercentage = result.reduce((sum, d) => sum + d.holdersPercentage, 0);

      expect(totalSupplyPercentage).toBe(100);
      expect(totalHoldersPercentage).toBe(100);
    });

    test('小数点以下を適切に丸めること', () => {
      const chainData: ChainData[] = [
        { chain: 'Ethereum', totalSupply: 3333n, holdersCount: 33 },
        { chain: 'Polygon', totalSupply: 3333n, holdersCount: 33 },
        { chain: 'Avalanche', totalSupply: 3334n, holdersCount: 34 },
      ];

      const result = calculateChainPercentages(chainData);

      const totalSupplyPercentage = result.reduce((sum, d) => sum + d.supplyPercentage, 0);
      const totalHoldersPercentage = result.reduce((sum, d) => sum + d.holdersPercentage, 0);

      // 丸め誤差があっても合計が100に近いことを確認
      expect(Math.abs(totalSupplyPercentage - 100)).toBeLessThanOrEqual(1);
      expect(Math.abs(totalHoldersPercentage - 100)).toBeLessThanOrEqual(1);
    });

    test('総供給量が0の場合、すべて0%になること', () => {
      const chainData: ChainData[] = [
        { chain: 'Ethereum', totalSupply: 0n, holdersCount: 0 },
        { chain: 'Polygon', totalSupply: 0n, holdersCount: 0 },
      ];

      const result = calculateChainPercentages(chainData);

      result.forEach((data) => {
        expect(data.supplyPercentage).toBe(0);
        expect(data.holdersPercentage).toBe(0);
      });
    });
  });

  describe('convertToRechartsFormat', () => {
    test('Recharts互換のデータ構造に変換できること', () => {
      const chainData: ChainData[] = [
        { chain: 'Ethereum', totalSupply: 6000n, holdersCount: 60, supplyPercentage: 60, holdersPercentage: 60 },
        { chain: 'Polygon', totalSupply: 3000n, holdersCount: 30, supplyPercentage: 30, holdersPercentage: 30 },
        { chain: 'Avalanche', totalSupply: 1000n, holdersCount: 10, supplyPercentage: 10, holdersPercentage: 10 },
      ];

      const result = convertToRechartsFormat(chainData);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('value');
      expect(result[0]).toHaveProperty('percentage');
      expect(result[0]).toHaveProperty('fill');
    });

    test('最大値のチェーンが最初に配置されること', () => {
      const chainData: ChainData[] = [
        { chain: 'Polygon', totalSupply: 3000n, holdersCount: 30, supplyPercentage: 30, holdersPercentage: 30 },
        { chain: 'Ethereum', totalSupply: 6000n, holdersCount: 60, supplyPercentage: 60, holdersPercentage: 60 },
        { chain: 'Avalanche', totalSupply: 1000n, holdersCount: 10, supplyPercentage: 10, holdersPercentage: 10 },
      ];

      const supplyResult = convertToRechartsFormat(chainData, 'supply');
      const holdersResult = convertToRechartsFormat(chainData, 'holders');

      expect(supplyResult[0].name).toBe('Ethereum');
      expect(holdersResult[0].name).toBe('Ethereum');
    });

    test('チェーン別に異なる色が割り当てられること', () => {
      const chainData: ChainData[] = [
        { chain: 'Ethereum', totalSupply: 1000n, holdersCount: 10, supplyPercentage: 50, holdersPercentage: 50 },
        { chain: 'Polygon', totalSupply: 1000n, holdersCount: 10, supplyPercentage: 50, holdersPercentage: 50 },
      ];

      const result = convertToRechartsFormat(chainData);

      expect(result[0].fill).not.toBe(result[1].fill);
    });

    test('supply指定時は総供給量を使用すること', () => {
      const chainData: ChainData[] = [
        { chain: 'Ethereum', totalSupply: 6000n, holdersCount: 60, supplyPercentage: 60, holdersPercentage: 60 },
      ];

      const result = convertToRechartsFormat(chainData, 'supply');

      expect(result[0].value).toBe(6000);
      expect(result[0].percentage).toBe(60);
    });

    test('holders指定時は保有者数を使用すること', () => {
      const chainData: ChainData[] = [
        { chain: 'Ethereum', totalSupply: 6000n, holdersCount: 60, supplyPercentage: 60, holdersPercentage: 60 },
      ];

      const result = convertToRechartsFormat(chainData, 'holders');

      expect(result[0].value).toBe(60);
      expect(result[0].percentage).toBe(60);
    });
  });
});
