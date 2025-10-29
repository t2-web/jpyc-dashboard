import React from 'react';
import { priceChartData, holderChartData, CONTRACT_ADDRESSES } from '../constants';
import CustomLineChart from '../components/LineChart';
import SwapWidget from '../components/SwapWidget';
import Card from '../components/Card';
import { ExternalLinkIcon, CopyIcon, getChainLogo } from '../components/icons';

const Analytics: React.FC = () => {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-on-surface mb-2">データと分析</h1>
        <p className="text-on-surface-secondary">オンチェーン指標や価格推移など、JPYC の最新データを確認できます。</p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CustomLineChart 
          data={priceChartData} 
          xAxisKey="name" 
          lines={[{ key: 'price', color: '#00BCD4' }, { key: 'volume', color: '#FFC107' }]} 
          title="価格と出来高 (USD)" 
          comingSoon
        />
        <CustomLineChart 
          data={holderChartData} 
          xAxisKey="name" 
          lines={[{ key: 'holders', color: '#8884d8' }]}
          title="保有者推移"
          comingSoon
        />
      </section>
      
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <h2 className="text-xl font-semibold mb-4 text-on-surface">DEX情報</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="p-3">DEX</th>
                                <th className="p-3">チェーン</th>
                                <th className="p-3">価格 (USDC)</th>
                                <th className="p-3">取引高 (24h)</th>
                                <th className="p-3">流動性</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { dex: 'Uniswap v3', chain: 'Ethereum', price: '0.9989', volume: '$4.1M', liquidity: '$20M' },
                                { dex: 'KyberSwap', chain: 'Polygon', price: '0.9982', volume: '$1.8M', liquidity: '$8M' },
                                { dex: 'Trader Joe', chain: 'Avalanche', price: '0.9991', volume: '$2.2M', liquidity: '$12M' },
                                { dex: 'Uniswap v3', chain: 'Polygon', price: '0.9985', volume: '$1.5M', liquidity: '$7M' },
                            ].map(item => (
                                <tr key={item.dex+item.chain} className="border-b border-border last:border-b-0 hover:bg-background">
                                    <td className="p-3 font-medium">{item.dex}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            {getChainLogo(item.chain)}
                                            {item.chain}
                                        </div>
                                    </td>
                                    <td className="p-3 text-primary">{item.price}</td>
                                    <td className="p-3">{item.volume}</td>
                                    <td className="p-3">{item.liquidity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
        <div>
            <SwapWidget />
        </div>
      </section>
      
      <section>
        <Card>
            <h2 className="text-xl font-semibold mb-4 text-on-surface">主要コントラクトアドレス</h2>
            <div className="space-y-3">
                {CONTRACT_ADDRESSES.map(ca => (
                    <div key={ca.chain} className="bg-background p-3 rounded-lg flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {getChainLogo(ca.chain)}
                            <span className="font-bold">{ca.name} ({ca.chain})</span>
                            <span className="font-mono text-sm text-on-surface-secondary break-all">{ca.address}</span>
                        </div>
                        <div className="flex items-center">
                            <CopyIcon onClick={() => navigator.clipboard.writeText(ca.address)} />
                            <a href={ca.explorerUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLinkIcon />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      </section>
    </div>
  );
};

export default Analytics;
