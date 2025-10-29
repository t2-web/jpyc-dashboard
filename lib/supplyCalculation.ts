/**
 * Supply Calculation
 *
 * ブラックリストアドレスの保有量と流通供給量を計算する機能を提供します。
 */

import { isBlacklisted } from './blacklist';
import type { HolderSnapshot } from './holderFilter';

/**
 * ブラックリストアドレスの総保有量を計算する
 * @param holders ホルダー配列
 * @param blacklist ブラックリストアドレスの配列（小文字に正規化済み）
 * @returns ブラックリストアドレスの総保有量（BigInt）
 */
export function calculateBlacklistedSupply(holders: HolderSnapshot[], blacklist: string[]): bigint {
  return holders
    .filter((holder) => isBlacklisted(holder.address, blacklist))
    .reduce((total, holder) => total + holder.balanceRaw, 0n);
}

/**
 * 流通供給量を計算する
 * @param totalSupply 総供給量（BigInt）
 * @param blacklistedSupply ブラックリスト保有量（BigInt）
 * @returns 流通供給量（BigInt）。負の値になる場合は0を返す
 */
export function calculateCirculatingSupply(totalSupply: bigint, blacklistedSupply: bigint): bigint {
  const circulating = totalSupply - blacklistedSupply;
  return circulating < 0n ? 0n : circulating;
}
