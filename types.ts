// Fix: Import React to use React.ReactNode type.
import React from 'react';

export type Tab = 'ホーム' | '分析' | 'DeFiエコシステム' | 'チュートリアル' | 'コミュニティ';

export interface ContractAddress {
  chain: string;
  name: string;
  address: string;
  explorerUrl: string;
}

export interface DeFiProtocol {
  name: string;
  logoUrl: string;
  description: string;
  category: 'Swap' | 'Lend' | 'Bridge' | 'Pay' | 'Donate';
  link: string;
  tvl: string;
  apr?: string;
}

export interface TutorialSection {
  title: string;
  content: {
    heading: string;
    text: string;
    imageUrl?: string;
  }[];
}

export interface Holder {
  rank: number;
  address: string;
  quantity: string;
  percentage: string;
  chain: 'Ethereum' | 'Polygon' | 'Avalanche';
}