import React from 'react';
import Card from '../components/Card';
import StatCard from '../components/DataCard';
import HeroBackground from '../components/HeroBackground';
import { PlayIcon } from '../components/icons';
import { ANNOUNCEMENTS } from '../constants';
import { PRICE_PLACEHOLDER, useJpycOnChainData } from '../hooks/useJpycOnChainData';

const Home: React.FC = () => {
    const { isLoading, error, totalSupplyFormatted, totalSupplyBillions, holdersCount, holdersChange } = useJpycOnChainData();

    const supplyShort = isLoading ? '読み込み中…' : totalSupplyBillions ? `¥${totalSupplyBillions}B` : '—';
    const supplyFull = isLoading ? '読み込み中…' : totalSupplyFormatted ? `${totalSupplyFormatted} JPYC` : '—';
    const holdersLabel = isLoading ? '読み込み中…' : holdersCount ? holdersCount.toLocaleString('ja-JP') : 'Comming Soon';
    const holdersSubtitle = holdersCount ? 'スキャン + Moralis 集計（3チェーン合算）' : 'API キーの設定が必要です';
    const holdersChangeText = holdersCount && holdersChange !== undefined ? `${holdersChange >= 0 ? '+' : ''}${holdersChange.toLocaleString('ja-JP')} (24h)` : undefined;
    const holdersChangeClass = holdersChangeText ? (holdersChange! >= 0 ? 'text-green-600' : 'text-red-500') : '';

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard title="現在価格">
                            <div className="flex flex-col items-start">
                                <p className="text-3xl font-bold tracking-tight">{PRICE_PLACEHOLDER}</p>
                                <p className="text-sm text-on-surface-secondary mt-1">オンチェーン価格連携を準備中です</p>
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
                        </div>

                        {/* Getting Started */}
                        <div>
                             <h2 className="text-2xl font-bold mb-6">はじめての JPYC</h2>
                             <Card className="relative overflow-hidden">
                                <div className="opacity-50 blur-sm select-none pointer-events-none">
                                    <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                                        <PlayIcon />
                                    </div>
                                    <p className="text-on-surface-secondary my-4">
                                        JPYC の基本的な使い方から DeFi での活用方法まで、わかりやすく解説します。
                                    </p>
                                    <button className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-hover transition-colors">
                                        チュートリアルを見る
                                    </button>
                                </div>
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="rounded-full bg-slate-900/70 px-6 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white">
                                        Comming Soon
                                    </div>
                                </div>
                             </Card>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
