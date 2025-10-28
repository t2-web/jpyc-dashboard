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

const Home: React.FC = () => {
    // Twitter Widgetを初期化
    useEffect(() => {
        // Twitterのウィジェットスクリプトが読み込まれているか確認
        if ((window as any).twttr?.widgets) {
            console.log('🐦 [Twitter Widget] Loading widgets...');
            (window as any).twttr.widgets.load();
        } else {
            // スクリプトが読み込まれていない場合は、読み込み完了を待つ
            const checkTwitterScript = setInterval(() => {
                if ((window as any).twttr?.widgets) {
                    console.log('🐦 [Twitter Widget] Script loaded, initializing widgets...');
                    (window as any).twttr.widgets.load();
                    clearInterval(checkTwitterScript);
                }
            }, 100);

            // 10秒後にタイムアウト
            setTimeout(() => {
                clearInterval(checkTwitterScript);
                console.warn('⚠️ [Twitter Widget] Script loading timeout');
            }, 10000);
        }
    }, []);

    const { isLoading, error, totalSupplyFormatted, totalSupplyBillions, holdersCount, holdersChange, chainDistribution } = useJpycOnChainData();
    const priceState = useJpycPrice();

    const supplyShort = isLoading ? '読み込み中…' : totalSupplyBillions ? `¥${totalSupplyBillions}M` : '—';
    const supplyFull = isLoading ? '読み込み中…' : totalSupplyFormatted ? `${totalSupplyFormatted} JPYC` : '—';
    const holdersLabel = isLoading ? '読み込み中…' : holdersCount ? holdersCount.toLocaleString('ja-JP') : 'Comming Soon';
    const holdersSubtitle = holdersCount ? 'スキャン）' : 'API キーの設定が必要です';
    const holdersChangeText = holdersCount && holdersChange !== undefined ? `${holdersChange >= 0 ? '+' : ''}${holdersChange.toLocaleString('ja-JP')} (24h)` : undefined;
    const holdersChangeClass = holdersChangeText ? (holdersChange! >= 0 ? 'text-green-600' : 'text-red-500') : '';

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

    // チェーン分布データの準備
    const supplyDistributionData = chainDistribution?.map((item) => ({
        chain: item.chain,
        value: item.supplyFormatted,
        percentage: item.supplyPercentage,
    })) || [];

    const holdersDistributionData = chainDistribution?.filter((item) => item.holdersCount !== undefined).map((item) => ({
        chain: item.chain,
        value: item.holdersCount!.toLocaleString('ja-JP'),
        percentage: item.holdersPercentage ?? 0,
    })) || [];

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
                            <button className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors">
                                はじめる
                            </button>
                            <button className="px-8 py-3 bg-white/90 text-slate-900 font-semibold rounded-lg border border-white/40 hover:bg-white transition-colors">
                                詳細を見る
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stats Section */}
                <section className="-mt-16 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <StatCard title="保有者数">
                            <p className="text-3xl font-bold">{holdersLabel}</p>
                            <p className="text-sm text-on-surface-secondary mt-1">{holdersSubtitle}</p>
                            {holdersChangeText && (
                                <p className={`text-sm mt-1 ${holdersChangeClass}`}>{holdersChangeText}</p>
                            )}
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
                                <ChainDistributionBar
                                    title="チェーン別保有者数"
                                    data={holdersDistributionData}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>

                        {/* X (Twitter) Timeline */}
                        <div>
                             <h2 className="text-2xl font-bold mb-6">最新情報</h2>
                             <Card className="h-[600px] overflow-hidden">
                                <a
                                    className="twitter-timeline"
                                    data-height="600"
                                    data-theme="light"
                                    data-chrome="noheader nofooter noborders"
                                    href="https://x.com/jpyc_official?ref_src=twsrc%5Etfw"
                                >
                                    Tweets by jpyc_official
                                </a>
                             </Card>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
