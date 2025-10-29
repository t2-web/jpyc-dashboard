import { describe, it, expect } from 'vitest';
import { callErc20TotalSupply, callErc20Balance, hexToBigInt, formatTokenAmount, ChainKey } from './onchain';

const JPYC_ADDRESSES = {
  Ethereum: '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29',
  Polygon: '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29',
  Avalanche: '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29',
};

async function testChainSupply(chain: ChainKey, address: string) {
  console.log(`\n🔍 Testing ${chain}...`);
  console.log(`📍 Contract: ${address}`);

  try {
    const supplyHex = await callErc20TotalSupply(chain, address);
    console.log(`✅ Raw hex response: ${supplyHex}`);

    const supply = hexToBigInt(supplyHex);
    console.log(`✅ Total Supply (raw): ${supply.toString()}`);

    const decimals = 18; // JPYC uses 18 decimals
    const formatted = formatTokenAmount(supply, decimals, 2);
    console.log(`✅ Total Supply (formatted): ${formatted} JPYC`);

    return { chain, success: true, supply };
  } catch (error) {
    console.error(`❌ ${chain} failed:`, error);
    return { chain, success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function testBlacklistBalance(chain: ChainKey, tokenAddress: string, blacklistAddress: string) {
  console.log(`\n🔍 Testing blacklist balance on ${chain}...`);
  console.log(`📍 Token: ${tokenAddress}`);
  console.log(`📍 Blacklist Address: ${blacklistAddress}`);

  try {
    const balanceHex = await callErc20Balance(chain, tokenAddress, blacklistAddress);
    console.log(`✅ Raw hex response: ${balanceHex}`);

    const balance = hexToBigInt(balanceHex);
    console.log(`✅ Balance (raw): ${balance.toString()}`);

    const decimals = 18;
    const formatted = formatTokenAmount(balance, decimals, 2);
    console.log(`✅ Balance (formatted): ${formatted} JPYC`);

    return { chain, success: true, balance };
  } catch (error) {
    console.error(`❌ ${chain} failed:`, error);
    return { chain, success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

describe('RPC Chain Tests', () => {
  it('should fetch total supply from Ethereum', async () => {
    const result = await testChainSupply('Ethereum', JPYC_ADDRESSES.Ethereum);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.supply).toBeGreaterThan(0n);
      console.log(`✅ Ethereum Supply: ${result.supply?.toString()} wei`);
    } else {
      console.error(`❌ Ethereum failed: ${result.error}`);
    }
  }, 30000);

  it('should fetch total supply from Polygon', async () => {
    const result = await testChainSupply('Polygon', JPYC_ADDRESSES.Polygon);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.supply).toBeGreaterThan(0n);
      console.log(`✅ Polygon Supply: ${result.supply?.toString()} wei`);
    } else {
      console.error(`❌ Polygon failed: ${result.error}`);
    }
  }, 30000);

  it('should fetch total supply from Avalanche', async () => {
    const result = await testChainSupply('Avalanche', JPYC_ADDRESSES.Avalanche);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.supply).toBeGreaterThan(0n);
      console.log(`✅ Avalanche Supply: ${result.supply?.toString()} wei`);
    } else {
      console.error(`❌ Avalanche failed: ${result.error}`);
    }
  }, 30000);

  it('should fetch blacklist balance if configured', async () => {
    const blacklistEnv = import.meta.env.VITE_BLACKLIST_ADDRESSES || '';
    if (!blacklistEnv) {
      console.log('⚠️  VITE_BLACKLIST_ADDRESSES not set, skipping blacklist test');
      return;
    }

    const blacklistAddresses = blacklistEnv.split(',').map(addr => addr.trim()).filter(addr => addr !== '');
    if (blacklistAddresses.length === 0) {
      console.log('⚠️  No blacklist addresses configured');
      return;
    }

    const testAddress = blacklistAddresses[0];
    console.log(`\nTesting first blacklist address: ${testAddress}`);

    const results = await Promise.all([
      testBlacklistBalance('Ethereum', JPYC_ADDRESSES.Ethereum, testAddress),
      testBlacklistBalance('Polygon', JPYC_ADDRESSES.Polygon, testAddress),
      testBlacklistBalance('Avalanche', JPYC_ADDRESSES.Avalanche, testAddress),
    ]);

    results.forEach(result => {
      expect(result.success).toBe(true);
      if (result.success) {
        console.log(`✅ ${result.chain} blacklist balance: ${result.balance?.toString()} wei`);
      } else {
        console.error(`❌ ${result.chain} failed: ${result.error}`);
      }
    });
  }, 30000);
});
