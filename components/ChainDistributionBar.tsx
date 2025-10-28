import React from 'react';
import type { SupportedChain } from '../types';

interface ChainData {
  chain: SupportedChain;
  value: string;
  percentage: number;
  label?: string;
}

interface ChainDistributionBarProps {
  title: string;
  data: ChainData[];
  isLoading?: boolean;
}

const CHAIN_COLORS: Record<SupportedChain, { bg: string; text: string }> = {
  Ethereum: { bg: 'bg-blue-500', text: 'text-blue-700' },
  Polygon: { bg: 'bg-purple-500', text: 'text-purple-700' },
  Avalanche: { bg: 'bg-red-500', text: 'text-red-700' },
};

const ChainDistributionBar: React.FC<ChainDistributionBarProps> = ({ title, data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-sm text-on-surface-secondary">データがありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item) => {
          const colors = CHAIN_COLORS[item.chain];
          return (
            <div key={item.chain} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${colors.text}`}>{item.chain}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-on-surface font-semibold">{item.value}</span>
                  <span className="text-on-surface-secondary text-xs">({item.percentage.toFixed(2)}%)</span>
                </div>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 ${colors.bg} transition-all duration-500 ease-out flex items-center justify-start px-3`}
                  style={{ width: `${Math.max(item.percentage, 3)}%` }}
                >
                  {item.label && (
                    <span className="text-xs font-medium text-white truncate">{item.label}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChainDistributionBar;
