// commuter-dashboard/components/HomeTab/StatsGrid.tsx
import React from 'react';

interface StatsGridProps {
  stats: any;
  loading: any;
}

export default function StatsGrid({ stats, loading }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
        <div className="text-blue-600 text-sm font-semibold mb-2">Total Trips</div>
        <div className="text-3xl font-bold text-blue-900">
          {loading.stats ? '—' : stats.totalTrips?.toLocaleString() || '0'}
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
        <div className="text-green-600 text-sm font-semibold mb-2">Active Tickets</div>
        <div className="text-3xl font-bold text-green-900">
          {loading.stats ? '—' : stats.activeTickets?.toLocaleString() || '0'}
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
        <div className="text-purple-600 text-sm font-semibold mb-2">Favorite Routes</div>
        <div className="text-3xl font-bold text-purple-900">
          {loading.stats ? '—' : stats.favoriteRoutes?.toLocaleString() || '0'}
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
        <div className="text-orange-600 text-sm font-semibold mb-2">Rewards Points</div>
        <div className="text-3xl font-bold text-orange-900">
          {loading.stats ? '—' : stats.rewardsPoints?.toLocaleString() || '0'}
        </div>
      </div>
    </div>
  );
}