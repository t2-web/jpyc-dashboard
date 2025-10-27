import React, { useState } from 'react';
import Header from './components/Header';
import Home from './views/Home';
import Analytics from './views/Analytics';
import Ecosystem from './views/Ecosystem';
import Tutorials from './views/Tutorials';
import Community from './views/Community';
import { type Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ホーム');

  const renderContent = () => {
    switch (activeTab) {
      case 'ホーム':
        return <Home />;
      case '分析':
        return <Analytics />;
      case 'DeFiエコシステム':
        return <Ecosystem />;
      case 'チュートリアル':
        return <Tutorials />;
      case 'コミュニティ':
        return <Community />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className={activeTab === 'ホーム' ? '' : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto'}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;