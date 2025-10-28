import React from 'react';
import { type Tab } from '../types';
import portalLogo from '../image/logo.svg';
import portalIcon from '../image/favicon.svg';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavItem: React.FC<{
  label: Tab;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
      isActive
        ? 'text-primary'
        : 'text-on-surface-secondary hover:text-on-surface'
    }`}
  >
    {label}
  </button>
);

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { label: Tab }[] = [
    { label: 'ホーム' },
    { label: '分析' },
    { label: 'エコシステム' },
    { label: 'チュートリアル' },
    { label: 'コミュニティ' },
    { label: 'セキュリティ' },
  ];

  return (
    <header className="bg-surface sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <img src={portalLogo} alt="JPYC Portal" className="h-12 w-auto" />
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <NavItem
                key={item.label}
                label={item.label}
                isActive={activeTab === item.label}
                onClick={() => setActiveTab(item.label)}
              />
            ))}
          </nav>
          {/* Placeholder for potential future items like "Connect Wallet" */}
          <div className="hidden md:block w-24"></div>
        </div>
      </div>
       {/* Mobile Navigation */}
      <nav className="md:hidden flex items-center justify-around p-1 bg-surface border-t border-border">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              isActive={activeTab === item.label}
              onClick={() => setActiveTab(item.label)}
            />
          ))}
      </nav>
    </header>
  );
};

export default Header;
