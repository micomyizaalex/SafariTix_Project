import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Ticket,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// SafariTix Brand Colors
const COLORS = {
  primary: '#0077B6',
  success: '#27AE60',
  danger: '#E63946',
};

interface RevenueData {
  totalRevenue: number;
  totalTickets: number;
  todayRevenue: number;
  todayTickets: number;
  weekRevenue: number;
  weekTickets: number;
  monthRevenue: number;
  monthTickets: number;
  dailyRevenue: Array<{ date: string; revenue: number; tickets: number }>;
  breakdownByRoute: Array<{
    route: string;
    departureTime: string;
    ticketsSold: number;
    revenue: number;
    scheduleDate: string;
  }>;
}

export default function RevenueReports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    totalTickets: 0,
    todayRevenue: 0,
    todayTickets: 0,
    weekRevenue: 0,
    weekTickets: 0,
    monthRevenue: 0,
    monthTickets: 0,
    dailyRevenue: [],
    breakdownByRoute: [],
  });
  const [sortField, setSortField] = useState<'route' | 'revenue' | 'ticketsSold'>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async (start?: string, end?: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);

      const response = await fetch(`/api/company/revenue?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    if (startDate && endDate) {
      fetchRevenueData(startDate, endDate);
    } else {
      fetchRevenueData();
    }
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Route', 'Date', 'Departure Time', 'Tickets Sold', 'Revenue'],
      ...revenueData.breakdownByRoute.map((item) => [
        item.route,
        item.scheduleDate || '—',
        item.departureTime || '—',
        item.ticketsSold.toString(),
        `${item.revenue}`,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `revenue_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sortedData = [...revenueData.breakdownByRoute].sort((a, b) => {
    const aVal = sortField === 'route' ? a.route : sortField === 'revenue' ? a.revenue : a.ticketsSold;
    const bVal = sortField === 'route' ? b.route : sortField === 'revenue' ? b.revenue : b.ticketsSold;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const handleSort = (field: 'route' | 'revenue' | 'ticketsSold') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-['Montserrat'] font-bold text-[#2B2D42] mb-2">
            Revenue & Reports
          </h1>
          <p className="text-gray-600">Track your revenue, analyze performance, and export reports</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            disabled
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleApplyFilter}
            disabled={loading}
            className="px-6 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#005F8E] transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Apply Filter'}
          </button>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                fetchRevenueData();
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <SummaryCard
          title="Today's Revenue"
          value={`RWF ${revenueData.todayRevenue.toLocaleString()}`}
          subtitle={`${revenueData.todayTickets} tickets`}
          icon={DollarSign}
          color={COLORS.primary}
        />
        <SummaryCard
          title="This Week"
          value={`RWF ${revenueData.weekRevenue.toLocaleString()}`}
          subtitle={`${revenueData.weekTickets} tickets`}
          icon={TrendingUp}
          color={COLORS.success}
        />
        <SummaryCard
          title="This Month"
          value={`RWF ${revenueData.monthRevenue.toLocaleString()}`}
          subtitle={`${revenueData.monthTickets} tickets`}
          icon={TrendingUp}
          color={COLORS.primary}
        />
        <SummaryCard
          title="Total Revenue"
          value={`RWF ${revenueData.totalRevenue.toLocaleString()}`}
          subtitle="All time"
          icon={DollarSign}
          color={COLORS.success}
        />
        <SummaryCard
          title="Total Tickets"
          value={revenueData.totalTickets.toLocaleString()}
          subtitle="All time"
          icon={Ticket}
          color={COLORS.primary}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-['Montserrat'] font-bold text-[#2B2D42]">Revenue Over Time</h3>
          <span className="text-sm text-gray-500">
            {startDate && endDate
              ? `${startDate} to ${endDate}`
              : revenueData.dailyRevenue.length > 0
              ? `Last ${revenueData.dailyRevenue.length} days`
              : 'No data'}
          </span>
        </div>
        {revenueData.dailyRevenue.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueData.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.primary}
                strokeWidth={3}
                dot={{ fill: COLORS.primary, r: 4 }}
                name="Revenue (RWF)"
              />
              <Line
                type="monotone"
                dataKey="tickets"
                stroke={COLORS.success}
                strokeWidth={2}
                dot={{ fill: COLORS.success, r: 3 }}
                name="Tickets Sold"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[350px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No revenue data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Sales Breakdown Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-['Montserrat'] font-bold text-[#2B2D42] mb-6">
          Ticket Sales Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('route')}
                >
                  <div className="flex items-center gap-2">
                    Route
                    {sortField === 'route' && (
                      <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Departure</th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('ticketsSold')}
                >
                  <div className="flex items-center gap-2">
                    Tickets Sold
                    {sortField === 'ticketsSold' && (
                      <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('revenue')}
                >
                  <div className="flex items-center gap-2">
                    Revenue
                    {sortField === 'revenue' && (
                      <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.route}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.scheduleDate || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.departureTime || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <span className="inline-flex items-center gap-1">
                        <Ticket className="w-4 h-4 text-gray-400" />
                        {item.ticketsSold}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#27AE60]">
                      RWF {item.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <Ticket className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No ticket sales data available</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-2xl font-['Montserrat'] font-bold text-[#2B2D42]">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
