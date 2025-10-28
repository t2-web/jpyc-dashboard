import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChainDistributionChart from './ChainDistributionChart';
import type { ChartDataPoint } from '../lib/chartDataAggregator';

describe('ChainDistributionChart', () => {
  const mockData: ChartDataPoint[] = [
    { name: 'Ethereum', value: 6000, percentage: 60, fill: '#627EEA' },
    { name: 'Polygon', value: 3000, percentage: 30, fill: '#8247E5' },
    { name: 'Avalanche', value: 1000, percentage: 10, fill: '#E84142' },
  ];

  test('タイトルが表示されること', () => {
    render(<ChainDistributionChart data={mockData} title="チェーン別総供給量" type="supply" />);

    expect(screen.getByText('チェーン別総供給量')).toBeTruthy();
  });

  test('データが空の場合、メッセージを表示すること', () => {
    render(<ChainDistributionChart data={[]} title="チェーン別総供給量" type="supply" />);

    expect(screen.getByText('データがありません')).toBeTruthy();
  });

  test('チャートコンポーネントがレンダリングされること', () => {
    const { container } = render(<ChainDistributionChart data={mockData} title="チェーン別総供給量" type="supply" />);

    // ResponsiveContainerが存在することを確認
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeTruthy();
  });

  test('supply typeを指定して正常にレンダリングできること', () => {
    const { container } = render(<ChainDistributionChart data={mockData} title="チェーン別総供給量" type="supply" />);

    // コンポーネントが正常にレンダリングされたことを確認
    expect(container.querySelector('.bg-surface')).toBeTruthy();
  });

  test('holders typeを指定して正常にレンダリングできること', () => {
    const { container } = render(<ChainDistributionChart data={mockData} title="チェーン別保有者数" type="holders" />);

    // コンポーネントが正常にレンダリングされたことを確認
    expect(container.querySelector('.bg-surface')).toBeTruthy();
  });

  test('複数のデータポイントを処理できること', () => {
    const multiChainData: ChartDataPoint[] = [
      { name: 'Ethereum', value: 6000, percentage: 40, fill: '#627EEA' },
      { name: 'Polygon', value: 4000, percentage: 27, fill: '#8247E5' },
      { name: 'Avalanche', value: 3000, percentage: 20, fill: '#E84142' },
      { name: 'Gnosis', value: 2000, percentage: 13, fill: '#04795B' },
    ];

    const { container } = render(<ChainDistributionChart data={multiChainData} title="チェーン別分布" type="supply" />);

    // コンポーネントが正常にレンダリングされたことを確認
    expect(container.querySelector('.bg-surface')).toBeTruthy();
  });
});
