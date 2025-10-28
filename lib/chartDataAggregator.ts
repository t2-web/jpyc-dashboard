/**
 * Chart Data Aggregator
 *
 * チェーン別データを集約し、Recharts互換のフォーマットに変換する機能を提供します。
 */

/**
 * ホルダースナップショット型（簡易版）
 */
export interface HolderSnapshot {
  chain: string;
  balanceRaw: bigint;
  address: string;
  name: string;
  quantity: string;
  percentage: string;
}

/**
 * チェーン別集約データ
 */
export interface ChainData {
  chain: string;
  totalSupply: bigint;
  holdersCount: number;
  supplyPercentage?: number;
  holdersPercentage?: number;
}

/**
 * Rechartsチャートデータポイント
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  percentage: number;
  fill: string;
}

/**
 * チェーン別の色マッピング
 */
const CHAIN_COLORS: Record<string, string> = {
  Ethereum: '#627EEA',
  Polygon: '#8247E5',
  Avalanche: '#E84142',
  Gnosis: '#04795B',
  Shiden: '#FF4F00',
};

/**
 * ホルダー配列をチェーン別に集約する
 * @param holders ホルダー配列
 * @returns チェーン別集約データ
 */
export function aggregateChainData(holders: HolderSnapshot[]): ChainData[] {
  const chainMap = new Map<string, ChainData>();

  for (const holder of holders) {
    // 残高が0のホルダーを除外
    if (holder.balanceRaw <= 0n) {
      continue;
    }

    const existing = chainMap.get(holder.chain);
    if (existing) {
      existing.totalSupply += holder.balanceRaw;
      existing.holdersCount += 1;
    } else {
      chainMap.set(holder.chain, {
        chain: holder.chain,
        totalSupply: holder.balanceRaw,
        holdersCount: 1,
      });
    }
  }

  return Array.from(chainMap.values());
}

/**
 * チェーン別データのパーセンテージを計算する
 * @param chainData チェーン別データ
 * @returns パーセンテージ付きチェーン別データ
 */
export function calculateChainPercentages(chainData: ChainData[]): ChainData[] {
  // 総供給量と保有者数の合計を計算
  const totalSupply = chainData.reduce((sum, data) => sum + data.totalSupply, 0n);
  const totalHolders = chainData.reduce((sum, data) => sum + data.holdersCount, 0);

  // パーセンテージを計算
  return chainData.map((data) => {
    const supplyPercentage =
      totalSupply > 0n ? Math.round((Number(data.totalSupply) / Number(totalSupply)) * 100) : 0;

    const holdersPercentage = totalHolders > 0 ? Math.round((data.holdersCount / totalHolders) * 100) : 0;

    return {
      ...data,
      supplyPercentage,
      holdersPercentage,
    };
  });
}

/**
 * チェーン別データをRecharts互換フォーマットに変換する
 * @param chainData チェーン別データ
 * @param type データタイプ（supply: 総供給量, holders: 保有者数）
 * @returns Rechartsチャートデータポイント配列
 */
export function convertToRechartsFormat(
  chainData: ChainData[],
  type: 'supply' | 'holders' = 'supply'
): ChartDataPoint[] {
  // データをソート（最大値が最初に来るように）
  const sorted = [...chainData].sort((a, b) => {
    if (type === 'supply') {
      return b.totalSupply > a.totalSupply ? 1 : -1;
    } else {
      return b.holdersCount - a.holdersCount;
    }
  });

  // Recharts互換フォーマットに変換
  return sorted.map((data) => ({
    name: data.chain,
    value: type === 'supply' ? Number(data.totalSupply) : data.holdersCount,
    percentage: type === 'supply' ? data.supplyPercentage ?? 0 : data.holdersPercentage ?? 0,
    fill: CHAIN_COLORS[data.chain] || '#999999',
  }));
}
