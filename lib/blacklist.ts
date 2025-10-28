/**
 * Blacklist Address Management
 *
 * ブラックリストアドレスの読み込み、検証、フィルタリング機能を提供します。
 */

/**
 * Ethereumアドレスの形式を検証する
 * @param address 検証するアドレス
 * @returns 有効なアドレスの場合true、無効な場合false
 */
export function validateEthereumAddress(address: unknown): boolean {
  if (typeof address !== 'string') {
    return false;
  }

  // 0x または 0X プレフィックス + 40桁の16進数
  const ethereumAddressRegex = /^0[xX][0-9a-fA-F]{40}$/;
  return ethereumAddressRegex.test(address);
}

/**
 * 環境変数からブラックリストアドレスを読み込む
 * @param env 環境変数オブジェクト（import.meta.env）
 * @returns 有効なブラックリストアドレスの配列（小文字に正規化、重複除外済み）
 */
export function loadBlacklistAddresses(env: ImportMetaEnv | Record<string, any>): string[] {
  const blacklistEnv = env.VITE_BLACKLIST_ADDRESSES;

  // 環境変数が未定義または空文字列の場合
  if (!blacklistEnv || typeof blacklistEnv !== 'string' || blacklistEnv.trim() === '') {
    return [];
  }

  // カンマで分割してトリム
  const addresses = blacklistEnv
    .split(',')
    .map((addr) => addr.trim())
    .filter((addr) => addr !== '');

  // 有効なアドレスのみをフィルタリング
  const validAddresses = addresses.filter(validateEthereumAddress);

  // 小文字に正規化して重複を除外
  const normalizedAddresses = validAddresses.map((addr) => addr.toLowerCase());
  const uniqueAddresses = Array.from(new Set(normalizedAddresses));

  return uniqueAddresses;
}

/**
 * アドレスがブラックリストに含まれるかチェックする
 * @param address チェックするアドレス
 * @param blacklist ブラックリストアドレスの配列
 * @returns ブラックリストに含まれる場合true、含まれない場合false
 */
export function isBlacklisted(address: unknown, blacklist: string[]): boolean {
  if (!validateEthereumAddress(address)) {
    return false;
  }

  const normalizedAddress = (address as string).toLowerCase();
  const normalizedBlacklist = blacklist.map((addr) => addr.toLowerCase());
  return normalizedBlacklist.includes(normalizedAddress);
}
