/**
 * Serializer - BigInt と Date を含むデータのシリアライゼーション
 *
 * BigInt と Date オブジェクトを JSON 互換形式に変換し、
 * デシリアライズ時に元の型に復元します。
 */

const SCHEMA_VERSION = 'v1.0.0';
const BIGINT_THRESHOLD = 15; // 15桁以上の数値文字列を BigInt として扱う

/**
 * データをシリアライズする
 * BigInt → 文字列、Date → ISO文字列 に変換し、バージョン情報を付与
 *
 * @param data シリアライズするデータ
 * @returns JSON文字列
 */
export function serialize<T>(data: T): string {
  const processed = processBigIntAndDate(data);
  const withVersion = {
    __version: SCHEMA_VERSION,
    ...processed,
  };

  return JSON.stringify(withVersion);
}

/**
 * データをデシリアライズする
 * 文字列 → BigInt、ISO文字列 → Date に変換
 *
 * @param serialized シリアライズされたJSON文字列
 * @returns デシリアライズされたデータ
 */
export function deserialize<T>(serialized: string): T {
  const parsed = JSON.parse(serialized);

  // バージョン情報を検証（将来のマイグレーション用）
  if (parsed.__version && parsed.__version !== SCHEMA_VERSION) {
    console.warn(
      `Schema version mismatch: expected ${SCHEMA_VERSION}, got ${parsed.__version}`
    );
  }

  // バージョン情報を削除
  delete parsed.__version;

  return restoreBigIntAndDate(parsed) as T;
}

/**
 * BigInt と Date を JSON 互換形式に変換する
 * BigInt → 文字列、Date → ISO文字列
 *
 * @param value 変換する値
 * @returns 変換後の値
 */
function processBigIntAndDate(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  // BigInt の処理
  if (typeof value === 'bigint') {
    return value.toString();
  }

  // Date の処理
  if (value instanceof Date) {
    return value.toISOString();
  }

  // 配列の処理
  if (Array.isArray(value)) {
    return value.map((item) => processBigIntAndDate(item));
  }

  // オブジェクトの処理
  if (typeof value === 'object') {
    const processed: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      processed[key] = processBigIntAndDate(val);
    }
    return processed;
  }

  return value;
}

/**
 * JSON 互換形式から BigInt と Date を復元する
 * 文字列 → BigInt (条件に合致する場合)、ISO文字列 → Date
 *
 * @param value 復元する値
 * @returns 復元後の値
 */
function restoreBigIntAndDate(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  // 文字列の処理
  if (typeof value === 'string') {
    // BigInt の復元: 15桁以上の数値文字列
    if (value.length >= BIGINT_THRESHOLD && /^\d+$/.test(value)) {
      try {
        return BigInt(value);
      } catch {
        return value;
      }
    }

    // Date の復元: ISO 8601 形式の文字列
    if (isISODateString(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return value;
  }

  // 配列の処理
  if (Array.isArray(value)) {
    return value.map((item) => restoreBigIntAndDate(item));
  }

  // オブジェクトの処理
  if (typeof value === 'object') {
    const restored: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      restored[key] = restoreBigIntAndDate(val);
    }
    return restored;
  }

  return value;
}

/**
 * ISO 8601 形式の日付文字列かどうかを判定
 *
 * @param value 判定する文字列
 * @returns ISO 8601 形式の場合 true
 */
function isISODateString(value: string): boolean {
  // ISO 8601 形式: YYYY-MM-DDTHH:mm:ss.sssZ
  const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  return isoPattern.test(value);
}
