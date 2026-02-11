import React from 'react';
import { BarChart3 } from 'lucide-react';
import { TopRoute } from './types';

interface Props {
  topRoutes: TopRoute[];
}

export const TopRoutes: React.FC<Props> = ({ topRoutes }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-[#0077B6]" />
        Top Routes
      </h2>
      <div className="space-y-4">
        {topRoutes.map((route, index) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900">{route.route}</span>
              <span className="text-xs bg-[#E6F4FB] text-[#0077B6] px-2 py-1 rounded-full font-semibold">{route.occupancy}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{route.trips} trips</span>
              <span className="font-bold text-gray-900">{(route.revenue / 1000).toFixed(0)}K RWF</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopRoutes;
