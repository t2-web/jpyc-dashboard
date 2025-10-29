import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './views/Home';
import Analytics from './views/Analytics';
import Ecosystem from './views/Ecosystem';
import Tutorials from './views/Tutorials';
import Security from './views/Security';
import PrivacyPolicy from './views/PrivacyPolicy';
import TermsOfService from './views/TermsOfService';
import { type Tab } from './types';
import { initGA, trackPageView } from './lib/analytics';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ホーム');

  // Google Analytics初期化
  useEffect(() => {
    initGA();
  }, []);

  // タブ変更時にページビューを追跡
  useEffect(() => {
    trackPageView(`/${activeTab}`);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'ホーム':
        return <Home />;
      case '分析':
        return <Analytics />;
      case 'エコシステム':
        return <Ecosystem />;
      case 'チュートリアル':
        return <Tutorials />;
      case 'セキュリティ':
        return <Security />;
      case 'プライバシーポリシー':
        return <PrivacyPolicy />;
      case '利用規約':
        return <TermsOfService />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className={`flex-grow ${activeTab === 'ホーム' ? '' : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto'}`}>
        {renderContent()}
      </main>
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
