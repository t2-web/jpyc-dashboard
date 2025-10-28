/**
 * Holder Filtering
 *
 * ホルダー配列からブラックリストアドレスを除外する機能を提供します。
 */

import { isBlacklisted } from './blacklist';

/**
 * HolderSnapshot型（useJpycOnChainDataWithSWRから）
 */
export interface HolderSnapshot {
  address: string;
  name: string;
  chain: string;
  balanceRaw: bigint;
  quantity: string;
  percentage: string;
  rank?: number;
}

/**
 * ホルダー配列からブラックリストに含まれるアドレスを除外する
 * @param holders ホルダー配列
 * @param blacklist ブラックリストアドレスの配列（小文字に正規化済み）
 * @returns フィルタリングされたホルダー配列
 */
export function filterBlacklistedHolders(holders: HolderSnapshot[], blacklist: string[]): HolderSnapshot[] {
  return holders.filter((holder) => !isBlacklisted(holder.address, blacklist));
}
