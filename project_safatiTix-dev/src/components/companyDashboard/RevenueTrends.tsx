import React from 'react';
import { TrendingUp } from 'lucide-react';
import { TopRoute } from './types';

interface DayData { day: string; revenue: number; occupancy: number }

interface Props {
  revenueData: DayData[];
}

export const RevenueTrends: React.FC<Props> = ({ revenueData }) => {
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 100000);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-[#0077B6]" />
        Weekly Revenue
      </h2>
      <div className="space-y-3">
        {revenueData.map((day) => (
          <div key={day.day} className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-600 w-8">{day.day}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#0077B6] to-[#00A8E8] h-full rounded-full transition-all"
                style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-900 w-16 text-right">{(day.revenue / 1000).toFixed(0)}K</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueTrends;
