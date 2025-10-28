import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '../lib/chartDataAggregator';

interface ChainDistributionChartProps {
  data: ChartDataPoint[];
  title: string;
  type: 'supply' | 'holders';
}

/**
 * カスタムツールチップコンポーネント
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
      <p className="font-semibold text-gray-800 mb-1">{data.name}</p>
      <p className="text-sm text-gray-600">
        値: <span className="font-medium">{data.value.toLocaleString()}</span>
      </p>
      <p className="text-sm text-gray-600">
        割合: <span className="font-medium">{data.percentage}%</span>
      </p>
    </div>
  );
};

/**
 * カスタムラベルコンポーネント
 */
const renderLabel = (entry: any) => {
  return `${entry.name} ${entry.percentage}%`;
};

/**
 * チェーン別分布円グラフコンポーネント
 */
const ChainDistributionChart: React.FC<ChainDistributionChartProps> = ({ data, title, type }) => {
  // データが空の場合
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 h-96 flex items-center justify-center">
        <p className="text-gray-500">データがありません</p>
      </div>
    );
  }

  // 最大値のチェーンを特定（すでにソート済みなので最初の要素）
  const maxChain = data[0].name;

  return (
    <div className="bg-surface border border-border rounded-lg p-6 h-96">
      <h3 className="text-lg font-semibold text-on-surface mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            innerRadius={type === 'supply' ? 0 : 40} // holdersの場合はドーナツチャート
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={renderLabel}
          >
            {data.map((entry, index) => {
              // 最大値のチェーンを視覚的に強調（少し大きく表示）
              const isMax = entry.name === maxChain;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  stroke={isMax ? '#000' : 'none'}
                  strokeWidth={isMax ? 2 : 0}
                  style={{
                    filter: isMax ? 'brightness(1.1)' : 'none',
                  }}
                />
              );
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string, entry: any) => {
              const isMax = value === maxChain;
              return (
                <span className={isMax ? 'font-bold' : ''}>
                  {value} {isMax && '★'}
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChainDistributionChart;
