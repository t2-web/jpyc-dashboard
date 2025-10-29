import { describe, test, expect } from 'vitest';
import { serialize, deserialize } from './serializer';

describe('Serializer', () => {
  describe('BigInt のシリアライゼーション', () => {
    test('BigInt を文字列に変換できること', () => {
      const data = {
        totalSupply: BigInt('1000000000000000000'),
        balance: BigInt('500000000000000000'),
      };

      const serialized = serialize(data);
      const parsed = JSON.parse(serialized);

      expect(parsed.totalSupply).toBe('1000000000000000000');
      expect(parsed.balance).toBe('500000000000000000');
    });

    test('ネストされたオブジェクト内の BigInt を変換できること', () => {
      const data = {
        ethereum: {
          totalSupply: BigInt('1000000000000000000'),
        },
        polygon: {
          totalSupply: BigInt('2000000000000000000'),
        },
      };

      const serialized = serialize(data);
      const parsed = JSON.parse(serialized);

      expect(parsed.ethereum.totalSupply).toBe('1000000000000000000');
      expect(parsed.polygon.totalSupply).toBe('2000000000000000000');
    });

    test('配列内の BigInt を変換できること', () => {
      const data = {
        balances: [
          BigInt('1000000000000000000'),
          BigInt('2000000000000000000'),
          BigInt('3000000000000000000'),
        ],
      };

      const serialized = serialize(data);
      const parsed = JSON.parse(serialized);

      expect(parsed.balances[0]).toBe('1000000000000000000');
      expect(parsed.balances[1]).toBe('2000000000000000000');
      expect(parsed.balances[2]).toBe('3000000000000000000');
    });

    test('BigInt と通常の値が混在するデータを変換できること', () => {
      const data = {
        totalSupply: BigInt('1000000000000000000'),
        holders: 12345,
        name: 'JPYC',
        active: true,
        metadata: null,
      };

      const serialized = serialize(data);
      const parsed = JSON.parse(serialized);

      expect(parsed.totalSupply).toBe('1000000000000000000');
      expect(parsed.holders).toBe(12345);
      expect(parsed.name).toBe('JPYC');
      expect(parsed.active).toBe(true);
      expect(parsed.metadata).toBeNull();
    });
  });

  describe('BigInt のデシリアライゼーション', () => {
    test('文字列を BigInt に変換できること', () => {
      const serializedData = {
        totalSupply: '1000000000000000000',
        balance: '500000000000000000',
      };

      const deserialized = deserialize(JSON.stringify(serializedData));

      expect(deserialized.totalSupply).toBe(BigInt('1000000000000000000'));
      expect(deserialized.balance).toBe(BigInt('500000000000000000'));
    });

    test('ネストされたオブジェクト内の文字列を BigInt に変換できること', () => {
      const serializedData = {
        ethereum: {
          totalSupply: '1000000000000000000',
        },
        polygon: {
          totalSupply: '2000000000000000000',
        },
      };

      const deserialized = deserialize(JSON.stringify(serializedData));

      expect(deserialized.ethereum.totalSupply).toBe(BigInt('1000000000000000000'));
      expect(deserialized.polygon.totalSupply).toBe(BigInt('2000000000000000000'));
    });

    test('配列内の文字列を BigInt に変換できること', () => {
      const serializedData = {
        balances: ['1000000000000000000', '2000000000000000000', '3000000000000000000'],
      };

      const deserialized = deserialize(JSON.stringify(serializedData));

      expect(deserialized.balances[0]).toBe(BigInt('1000000000000000000'));
      expect(deserialized.balances[1]).toBe(BigInt('2000000000000000000'));
      expect(deserialized.balances[2]).toBe(BigInt('3000000000000000000'));
    });

    test('BigInt 候補でない文字列は変換しないこと', () => {
      const serializedData = {
        totalSupply: '1000000000000000000',
        name: 'JPYC',
        description: 'Japanese Yen Coin',
        shortNumber: '123',
      };

      const deserialized = deserialize(JSON.stringify(serializedData));

      expect(deserialized.totalSupply).toBe(BigInt('1000000000000000000'));
      expect(deserialized.name).toBe('JPYC');
      expect(deserialized.description).toBe('Japanese Yen Coin');
      expect(deserialized.shortNumber).toBe('123'); // 短い数値文字列はそのまま
    });

    test('BigInt と通常の値が混在するデータを変換できること', () => {
      const serializedData = {
        totalSupply: '1000000000000000000',
        holders: 12345,
        name: 'JPYC',
        active: true,
        metadata: null,
      };

      const deserialized = deserialize(JSON.stringify(serializedData));

      expect(deserialized.totalSupply).toBe(BigInt('1000000000000000000'));
      expect(deserialized.holders).toBe(12345);
      expect(deserialized.name).toBe('JPYC');
      expect(deserialized.active).toBe(true);
      expect(deserialized.metadata).toBeNull();
    });
  });

  describe('シリアライゼーション/デシリアライゼーションの往復', () => {
    test('往復変換でデータが保持されること', () => {
      const originalData = {
        ethereum: {
          totalSupply: BigInt('1000000000000000000'),
          holders: 5000,
        },
        polygon: {
          totalSupply: BigInt('2000000000000000000'),
          holders: 3000,
        },
        metadata: {
          name: 'JPYC',
          active: true,
        },
      };

      const serialized = serialize(originalData);
      const deserialized = deserialize(serialized);

      expect(deserialized.ethereum.totalSupply).toBe(originalData.ethereum.totalSupply);
      expect(deserialized.ethereum.holders).toBe(originalData.ethereum.holders);
      expect(deserialized.polygon.totalSupply).toBe(originalData.polygon.totalSupply);
      expect(deserialized.polygon.holders).toBe(originalData.polygon.holders);
      expect(deserialized.metadata.name).toBe(originalData.metadata.name);
      expect(deserialized.metadata.active).toBe(originalData.metadata.active);
    });
  });

  describe('Date のシリアライゼーション', () => {
    test('Date を ISO 文字列に変換できること', () => {
      const now = new Date('2025-10-28T12:00:00Z');
      const data = {
        timestamp: now,
        value: 123,
      };

      const serialized = serialize(data);
      const parsed = JSON.parse(serialized);

      expect(parsed.timestamp).toBe('2025-10-28T12:00:00.000Z');
      expect(parsed.value).toBe(123);
    });

    test('Date を ISO 文字列から Date に復元できること', () => {
      const serializedData = {
        timestamp: '2025-10-28T12:00:00.000Z',
        value: 123,
      };

      const deserialized = deserialize(JSON.stringify(serializedData));

      expect(deserialized.timestamp).toBeInstanceOf(Date);
      expect(deserialized.timestamp.toISOString()).toBe('2025-10-28T12:00:00.000Z');
      expect(deserialized.value).toBe(123);
    });
  });

  describe('バージョン管理', () => {
    test('シリアライズ時にバージョン情報を付与すること', () => {
      const data = { value: 123 };

      const serialized = serialize(data);
      const parsed = JSON.parse(serialized);

      expect(parsed.__version).toBe('v1.0.0');
    });

    test('デシリアライズ時にバージョン情報を検証すること', () => {
      const serializedData = {
        __version: 'v1.0.0',
        value: 123,
      };

      const deserialized = deserialize(JSON.stringify(serializedData));

      expect(deserialized.value).toBe(123);
      expect(deserialized.__version).toBeUndefined(); // バージョン情報は内部的に削除
    });

    test('バージョン情報がない場合でもデシリアライズできること', () => {
      const serializedData = { value: 123 };

      const deserialized = deserialize(JSON.stringify(serializedData));

      expect(deserialized.value).toBe(123);
    });
  });
});
