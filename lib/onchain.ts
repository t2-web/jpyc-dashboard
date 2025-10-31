/**
 * 主要コントラクトアドレス
 * JPYC トークンコントラクトの公式アドレス一覧
 */
export const JPYC_CONTRACT_ADDRESSES = {
  Ethereum: '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29',
  Polygon: '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29',
  Avalanche: '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29',
} as const;

const FUNCTION_SIG = {
  totalSupply: '0x18160ddd',
  decimals: '0x313ce567',
  balanceOf: '0x70a08231',
};

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

const DEFAULT_RPC: Record<string, string> = {
  Ethereum: import.meta.env.VITE_ETHEREUM_RPC_URL ?? (ALCHEMY_API_KEY ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` : 'https://rpc.ankr.com/eth'),
  Polygon: import.meta.env.VITE_POLYGON_RPC_URL ?? (ALCHEMY_API_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` : 'https://polygon.drpc.org'),
  Avalanche: import.meta.env.VITE_AVALANCHE_RPC_URL ?? (ALCHEMY_API_KEY ? `https://avax-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` : 'https://avalanche.public-rpc.com'),
};

export type ChainKey = 'Ethereum' | 'Polygon' | 'Avalanche';

function getRpcUrl(chain: ChainKey): string {
  const url = DEFAULT_RPC[chain];
  if (!url) {
    throw new Error(`RPC URL for ${chain} が設定されていません`);
  }
  return url;
}

function normalizeHex(hex?: string): string {
  if (!hex) return '0x0';
  return hex.startsWith('0x') ? hex : `0x${hex}`;
}

function encodeBalanceOf(address: string): string {
  const normalized = address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  return `${FUNCTION_SIG.balanceOf}${normalized}`;
}

export async function callErc20TotalSupply(chain: ChainKey, contract: string): Promise<string> {
  return callRpc(chain, contract, FUNCTION_SIG.totalSupply);
}

export async function callErc20Decimals(chain: ChainKey, contract: string): Promise<number> {
  const raw = await callRpc(chain, contract, FUNCTION_SIG.decimals);
  return Number(BigInt(normalizeHex(raw)));
}

export async function callErc20Balance(chain: ChainKey, contract: string, holder: string): Promise<string> {
  return callRpc(chain, contract, encodeBalanceOf(holder));
}

async function callRpc(chain: ChainKey, contract: string, data: string): Promise<string> {
  const body = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'eth_call',
    params: [
      {
        to: contract,
        data,
      },
      'latest',
    ],
  };

  let response: Response;
  try {
    response = await fetch(getRpcUrl(chain), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      mode: 'cors',
    });
  } catch (error) {
    throw new Error(`${chain} RPC 接続に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!response.ok) {
    throw new Error(`${chain} RPC エラー: ${response.status} ${response.statusText}`);
  }

  const payload: { result?: string; error?: { message: string } } = await response.json();
  if (payload.error) {
    throw new Error(`${chain} RPC コール失敗: ${payload.error.message}`);
  }

  return normalizeHex(payload.result);
}

export function hexToBigInt(value: string | undefined): bigint {
  return BigInt(normalizeHex(value));
}

export function formatTokenAmount(value: bigint, decimals: number, fractionDigits = 2): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const base = absolute.toString().padStart(decimals + 1, '0');
  const whole = base.slice(0, base.length - decimals) || '0';
  const fractionRaw = base.slice(base.length - decimals).replace(/0+$/, '');
  const fraction = fractionRaw.slice(0, fractionDigits);
  const wholeWithDelimiters = addThousandsSeparator(whole);
  const formatted = fraction ? `${wholeWithDelimiters}.${fraction}` : wholeWithDelimiters;
  return negative ? `-${formatted}` : formatted;
}

export function addThousandsSeparator(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatMillions(value: bigint, decimals: number): string {
  const numeric = Number(value) / Math.pow(10, decimals);
  if (!Number.isFinite(numeric)) return '0';
  return (numeric / 1_000_000).toFixed(1);
}

// 後方互換性のため残す
export function formatBillions(value: bigint, decimals: number): string {
  return formatMillions(value, decimals);
}

export function formatPercentage(value: bigint, total: bigint): string {
  if (total === 0n) return '0.00';
  const ratio = Number(value) / Number(total);
  if (!Number.isFinite(ratio)) return '0.00';
  return (ratio * 100).toFixed(2);
}
