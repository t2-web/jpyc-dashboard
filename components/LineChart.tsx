import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartProps<T> {
  data: T[];
  xAxisKey: string;
  lines: { key: string; color: string }[];
  title: string;
}

const CustomLineChart = <T extends object>({ data, xAxisKey, lines, title }: ChartProps<T>) => {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 h-96">
      <h3 className="text-lg font-semibold text-on-surface mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey={xAxisKey} stroke="#718096" />
          <YAxis stroke="#718096" />
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }} />
          <Legend />
          {lines.map(line => (
            <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;