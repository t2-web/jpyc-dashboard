import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartProps<T> {
  data: T[];
  dataKey: string;
  nameKey: string;
  title: string;
}

const COLORS = ['#00BCD4', '#FFC107', '#8884d8', '#82ca9d'];

const CustomPieChart = <T extends object>({ data, dataKey, nameKey, title }: PieChartProps<T>) => {
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
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}/>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomPieChart;