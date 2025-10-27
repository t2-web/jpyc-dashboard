import React from 'react';
import Card from './Card';

interface StatCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, children, className }) => {
  return (
    <Card className={`flex flex-col ${className}`}>
      <h3 className="text-sm font-medium text-on-surface-secondary mb-2">{title}</h3>
      <div className="flex-grow">{children}</div>
    </Card>
  );
};

export default StatCard;