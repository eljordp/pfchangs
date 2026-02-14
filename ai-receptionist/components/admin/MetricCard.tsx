'use client';

import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  suffix?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, suffix }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
            {suffix && <span className="text-lg text-gray-600 ml-1">{suffix}</span>}
          </p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last period
            </p>
          )}
        </div>
        <div className="ml-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
