import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartProps<T> {
  data: T[];
  xAxisKey: string;
  lines: { key: string; color: string }[];
  title: string;
  comingSoon?: boolean;
}

const CustomLineChart = <T extends object>({ data, xAxisKey, lines, title, comingSoon = false }: ChartProps<T>) => {
  return (
    <div className="relative">
      <div className={`bg-surface border border-border rounded-lg p-6 h-96 transition ${comingSoon ? 'pointer-events-none select-none blur-sm opacity-70' : ''}`}>
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
      {comingSoon && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-slate-900/70 px-6 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Comming Soon
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomLineChart;
