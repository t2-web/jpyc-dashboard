import React, { useEffect } from 'react';
import Card from '../components/Card';
import StatCard from '../components/DataCard';
import HeroBackground from '../components/HeroBackground';
import ChainDistributionBar from '../components/ChainDistributionBar';
import { PlayIcon } from '../components/icons';
import { ANNOUNCEMENTS } from '../constants';
import { useJpycOnChainData } from '../hooks/useJpycOnChainData';
import { useJpycPrice } from '../hooks/useJpycPrice';
import { formatPrice, formatVolume, formatChange, formatMarketCap } from '../lib/coingecko';
import { JPYC_CONTRACT_ADDRESSES } from '../lib/onchain';

const Home: React.FC = () => {
    // Twitter Widgetを初期化
    useEffect(() => {
        let mounted = true;
        let checkInterval: NodeJS.Timeout | null = null;
        let timeoutId: NodeJS.Timeout | null = null;

        const loadTwitterWidgets = () => {
            if (!mounted) return;

            if ((window as any).twttr?.widgets) {
                console.log('🐦 [Twitter Widget] Loading widgets...');
                (window as any).twttr.widgets.load();
            } else {
                // スクリプトが読み込まれていない場合は、読み込み完了を待つ
                checkInterval = setInterval(() => {
                    if (!mounted) {
                        if (checkInterval) clearInterval(checkInterval);
                        return;
                    }

                    if ((window as any).twttr?.widgets) {
                        console.log('🐦 [Twitter Widget] Script loaded, initializing widgets...');
                        (window as any).twttr.widgets.load();
                        if (checkInterval) clearInterval(checkInterval);
                    }
                }, 100);

                // 10秒後にタイムアウト
                timeoutId = setTimeout(() => {
                    if (checkInterval) clearInterval(checkInterval);
                    if (mounted) {
                        console.warn('⚠️ [Twitter Widget] Script loading timeout');
                    }
                }, 10000);
            }
        };

        // 少し遅延させて実行（DOMの準備完了を確実にする）
        const initTimeout = setTimeout(loadTwitterWidgets, 500);

        return () => {
            mounted = false;
            clearTimeout(initTimeout);
            if (checkInterval) clearInterval(checkInterval);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    const { isLoading, error, totalSupplyFormatted, totalSupplyBillions, chainDistribution } = useJpycOnChainData();
    const priceState = useJpycPrice();

    const supplyShort = isLoading ? '読み込み中…' : totalSupplyBillions ? `¥${totalSupplyBillions}M` : '—';
    const supplyFull = isLoading ? '読み込み中…' : totalSupplyFormatted ? `${totalSupplyFormatted} JPYC` : '—';

    // 価格データの表示ロジック
    // USD価格の逆数で円建て価格を計算（1 JPYC = 1/usd JPY）
    const priceInJPY = priceState.data ? (1 / priceState.data.usd).toFixed(2) : null;
    const priceLabel = priceState.isLoading
        ? '読み込み中…'
        : priceState.data
            ? `¥${priceInJPY} (${formatPrice(priceState.data.usd)})`
            : 'Coming Soon';
    const priceSubtitle = priceState.data ? `時価総額: ${formatMarketCap(priceState.data.usd_market_cap)}` : priceState.error ? priceState.error : 'CoinGecko API から取得';
    const priceChangeText = priceState.data ? formatChange(priceState.data.usd_24h_change) : undefined;
    const priceChangeClass = priceChangeText && priceState.data ? (priceState.data.usd_24h_change >= 0 ? 'text-green-600' : 'text-red-500') : '';
    const volumeText = priceState.data ? `24h取引高: ${formatVolume(priceState.data.usd_24h_vol)}` : undefined;

    // チェーン分布データの準備（最も多いチェーンを100%とする）
    const supplyDistributionData = (() => {
        if (!chainDistribution || chainDistribution.length === 0) return [];

        // 最大供給量を取得（BigIntの配列から）
        const supplies = chainDistribution.map((item) => item.supply);
        const maxSupply = supplies.reduce((max: bigint, current: bigint) => current > max ? current : max, 0n);

        return chainDistribution.map((item) => ({
            chain: item.chain,
            value: item.supplyFormatted,
            percentage: maxSupply > 0n ? Number((item.supply * 10000n) / maxSupply) / 100 : 0,
        }));
    })();

    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-950 text-center text-white py-20 md:py-32">
                <HeroBackground />
                <div className="relative max-w-4xl mx-auto px-4">
                    <div className="mx-auto max-w-3xl rounded-3xl bg-slate-950/40 backdrop-blur-sm border border-white/10 p-8 md:p-12 shadow-2xl">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            <span className="block text-white">日本円ステーブルコイン</span>
                            <span className="block text-primary mt-2">JPYC</span>
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-white/85">
                            安心して理解し、使えるデジタル円。透明性の高い運営と広がるエコシステムで、新しい金融体験を提供します。
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row sm:justify-center gap-4">
                            <a
                                href="https://jpyc.co.jp/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors text-center"
                            >
                                はじめる
                            </a>
                            <button
                                disabled
                                className="px-8 py-3 bg-gray-400 text-gray-200 font-semibold rounded-lg shadow-md cursor-not-allowed opacity-60"
                            >
                                詳細を見る
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stats Section */}
                <section className="-mt-16 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="現在価格">
                            <div className="flex flex-col items-start">
                                <p className="text-3xl font-bold tracking-tight">{priceLabel}</p>
                                <p className="text-sm text-on-surface-secondary mt-1">{priceSubtitle}</p>
                                {priceChangeText && (
                                    <p className={`text-sm mt-1 ${priceChangeClass}`}>{priceChangeText}</p>
                                )}
                                {priceState.error && <p className="text-xs text-red-500 mt-1">{priceState.error}</p>}
                            </div>
                        </StatCard>
                        <StatCard title="24h取引高">
                            <div className="flex flex-col items-start">
                                <p className="text-3xl font-bold tracking-tight">
                                    {priceState.isLoading ? '読み込み中…' : priceState.data ? formatVolume(priceState.data.usd_24h_vol) : '—'}
                                </p>
                                <p className="text-sm text-on-surface-secondary mt-1"></p>
                            </div>
                        </StatCard>
                        <StatCard title="総供給量">
                             <p className="text-3xl font-bold">{supplyShort}</p>
                             <p className="text-sm text-on-surface-secondary mt-1">{supplyFull}</p>
                             {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                        </StatCard>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Announcements */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6">最新アナウンス</h2>
                            <div className="relative border-l-2 border-primary/20 pl-6 space-y-8">
                                {ANNOUNCEMENTS.map((item, index) => (
                                    <div key={index} className="relative">
                                        <div className="absolute -left-[34px] top-1 h-4 w-4 bg-primary rounded-full border-4 border-white"></div>
                                        <p className="text-sm text-on-surface-secondary mb-1">{item.date}</p>
                                        <p className="font-semibold text-on-surface">{item.text}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Chain Distribution Charts */}
                            <div className="mt-12 space-y-8">
                                <ChainDistributionBar
                                    title="チェーン別総供給量"
                                    data={supplyDistributionData}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>

                        {/* X (Twitter) Timeline */}
                        <div>
                             <h2 className="text-2xl font-bold mb-6">最新情報</h2>
                             <Card className="h-[600px]">
                                <a
                                    className="twitter-timeline"
                                    data-height="600"
                                    data-theme="light"
                                    data-chrome="noheader nofooter noborders"
                                    href="https://twitter.com/jpyc_official?ref_src=twsrc%5Etfw"
                                >
                                    Tweets by jpyc_official
                                </a>
                             </Card>
                        </div>
                    </div>

                    {/* Contract Addresses Section - Full Width */}
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold mb-6">主要コントラクトアドレス</h2>
                        <Card>
                            <div className="space-y-4">
                                <p className="text-sm text-on-surface-secondary mb-4">
                                    JPYC トークンコントラクトの公式アドレス一覧です。スワップや送金の際は必ずこのアドレスを確認してください。
                                </p>
                                {Object.entries(JPYC_CONTRACT_ADDRESSES).map(([chain, address]) => {
                                    const chainConfig = {
                                        Ethereum: {
                                            icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
                                            explorerUrl: `https://etherscan.io/token/${address}`,
                                            explorerName: 'Etherscan'
                                        },
                                        Polygon: {
                                            icon: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
                                            explorerUrl: `https://polygonscan.com/token/${address}`,
                                            explorerName: 'Polygonscan'
                                        },
                                        Avalanche: {
                                            icon: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
                                            explorerUrl: `https://snowtrace.io/token/${address}`,
                                            explorerName: 'Snowtrace'
                                        }
                                    }[chain];

                                    if (!chainConfig) return null;

                                    return (
                                        <div key={chain} className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={chainConfig.icon}
                                                    alt={`${chain} Logo`}
                                                    className="w-10 h-10 rounded-full"
                                                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg==';
                                                    }}
                                                />
                                                <div>
                                                    <p className="font-semibold text-on-surface text-lg">{chain}</p>
                                                    <p className="text-xs text-on-surface-secondary">JPYC Token</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <code className="px-4 py-2 bg-white rounded border border-gray-200 text-sm font-mono text-gray-700">
                                                    {address}
                                                </code>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(address);
                                                        // TODO: Add toast notification
                                                    }}
                                                    className="flex-shrink-0 p-2 hover:bg-surface rounded transition-colors"
                                                    title="アドレスをコピー"
                                                >
                                                    <svg className="w-5 h-5 text-on-surface-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                                <a
                                                    href={chainConfig.explorerUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-shrink-0 px-3 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors text-sm font-medium"
                                                    title={`${chainConfig.explorerName}で確認`}
                                                >
                                                    {chainConfig.explorerName}
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="font-semibold text-yellow-800 mb-1">⚠️ セキュリティ注意</p>
                                            <p className="text-sm text-yellow-700">
                                                偽トークンにご注意ください。スワップや送金の前に必ず上記の公式アドレスと一致することを確認してください。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
