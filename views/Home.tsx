import React, { useState } from 'react';
import Card from '../components/Card';
import StatCard from '../components/DataCard';
import HeroBackground from '../components/HeroBackground';
import { PlayIcon } from '../components/icons';
import { ANNOUNCEMENTS, JPYC_PRICE_JPY, JPYC_PRICE_USD, TOTAL_SUPPLY_BILLIONS, TOTAL_SUPPLY_FORMATTED, TOTAL_HOLDERS, OPERATION_WALLET } from '../constants';

const Home: React.FC = () => {
    const [currency, setCurrency] = useState<'JPY' | 'USD'>('JPY');

    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white text-on-surface text-center py-20 md:py-32">
                <HeroBackground />
                <div className="relative max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        <span className="block">日本円ステーブルコイン</span>
                        <span className="block text-primary mt-2">JPYC</span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-on-surface-secondary">
                        安心して理解し、使えるデジタル円。透明性の高い運営と豊富なDeFiエコシステムで、新しい金融体験を提供します。
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <button className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors">
                            はじめる
                        </button>
                        <button className="px-8 py-3 bg-white text-on-surface font-semibold rounded-lg border border-border hover:bg-secondary transition-colors">
                            詳細を見る
                        </button>
                    </div>
                </div>
            </section>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stats Section */}
                <section className="-mt-16 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="現在価格">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-3xl font-bold">
                                        {currency === 'JPY' ? `¥${JPYC_PRICE_JPY.toFixed(2)}` : `$${JPYC_PRICE_USD.toFixed(4)}`}
                                    </p>
                                    <p className="text-sm text-green-500 mt-1">+0.02% (24h)</p>
                                </div>
                                <div className="flex bg-secondary rounded-lg p-1 text-xs">
                                    <button onClick={() => setCurrency('JPY')} className={`px-2 py-1 rounded ${currency === 'JPY' ? 'bg-white shadow-sm' : ''}`}>JPY</button>
                                    <button onClick={() => setCurrency('USD')} className={`px-2 py-1 rounded ${currency === 'USD' ? 'bg-white shadow-sm' : ''}`}>USD</button>
                                </div>
                            </div>
                        </StatCard>
                        <StatCard title="総供給量">
                             <p className="text-3xl font-bold">¥{TOTAL_SUPPLY_BILLIONS.toFixed(1)}B</p>
                             <p className="text-sm text-on-surface-secondary mt-1">{TOTAL_SUPPLY_FORMATTED} JPYC</p>
                        </StatCard>
                        <StatCard title="保有者数">
                            <p className="text-3xl font-bold">{TOTAL_HOLDERS}</p>
                            <p className="text-sm text-green-500 mt-1">+127 (今週)</p>
                        </StatCard>
                        <Card>
                             <h3 className="text-sm font-medium text-on-surface-secondary mb-2">運営ウォレット</h3>
                             <p className="font-mono text-sm break-all">{OPERATION_WALLET}</p>
                             <a href="#" className="text-sm text-primary hover:underline mt-1 block">Etherscan で確認</a>
                        </Card>
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
                             <Card>
                                <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                                    <PlayIcon />
                                </div>
                                <p className="text-on-surface-secondary my-4">
                                    JPYC の基本的な使い方から DeFi での活用方法まで、わかりやすく解説します。
                                </p>
                                <button className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-hover transition-colors">
                                    チュートリアルを見る
                                </button>
                             </Card>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;