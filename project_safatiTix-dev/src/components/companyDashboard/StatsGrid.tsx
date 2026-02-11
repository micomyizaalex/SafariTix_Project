import React from 'react';
import { Bus, Calendar, Users, DollarSign, AlertCircle } from 'lucide-react';
import { DashboardStats } from './types';

interface Props {
  stats: DashboardStats;
}

export const StatsGrid: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <Bus className="w-8 h-8 text-[#0077B6]" />
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.activeBuses} / {stats.totalBuses}</p>
        <p className="text-sm text-gray-600 mt-1">Active Buses</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <Calendar className="w-8 h-8 text-purple-600" />
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Today</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.tripsToday}</p>
        <p className="text-sm text-gray-600 mt-1">Scheduled Trips</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <Users className="w-8 h-8 text-orange-600" />
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Booked</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.seatsBookedToday}</p>
        <p className="text-sm text-gray-600 mt-1">Seats Booked</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <DollarSign className="w-8 h-8 text-green-600" />
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stats.revenueChange >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}%
          </span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{(stats.revenueToday / 1000).toFixed(0)}K</p>
        <p className="text-sm text-gray-600 mt-1">Revenue Today (RWF)</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">Pending</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
        <p className="text-sm text-gray-600 mt-1">Pending Items</p>
      </div>
    </div>
  );
};

export default StatsGrid;
