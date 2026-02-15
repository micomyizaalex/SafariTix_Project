import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Building2, Bus, Ticket, MapPin, Settings,
  Bell, Search, ChevronDown, Menu, X, Plus, Edit2, Trash2, Eye,
  Filter, Download, TrendingUp, DollarSign, AlertCircle, CheckCircle,
  Clock, Calendar, Navigation, Phone, Mail, Shield, BarChart3,
  PieChart, Activity, ArrowUp, ArrowDown, MoreVertical, RefreshCw,
  UserCheck, UserX, Package, CreditCard, Zap, Crown, Star, Loader2,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

// ==================== BRAND COLORS ====================
const COLORS = {
  primary: '#0077B6',
  primaryDark: '#005F8E',
  secondary: '#F4A261',
  success: '#27AE60',
  danger: '#E63946',
  darkGray: '#2B2D42',
  lightGray: '#F5F7FA',
  white: '#FFFFFF',
};

// ==================== MAIN COMPONENT ====================
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalCommuters: 0,
    totalCompanies: 0,
    totalRevenue: 0,
    activeBuses: 0,
    ticketsToday: 0,
    growth: {
      commuters: 0,
      companies: 0,
      revenue: 0,
      buses: 0,
      tickets: 0,
    }
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any[]>([]);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found - redirecting to login');
        alert('Session expired. Please login again.');
        navigate('/app/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('Fetching dashboard data with token:', token.substring(0, 20) + '...');

      // Fetch all data in parallel with Promise.allSettled to handle individual failures
      const results = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/admin/stats`, config),
        axios.get(`${API_BASE_URL}/admin/companies`, config),
        axios.get(`${API_BASE_URL}/admin/users`, config),
        axios.get(`${API_BASE_URL}/admin/buses`, config),
        axios.get(`${API_BASE_URL}/admin/tickets?limit=100`, config),
        axios.get(`${API_BASE_URL}/admin/revenue`, config),
      ]);

      // Extract successful results
      const [statsRes, companiesRes, usersRes, busesRes, ticketsRes, revenueRes] = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          const endpoints = ['stats', 'companies', 'users', 'buses', 'tickets', 'revenue'];
          console.error(`Failed to fetch ${endpoints[index]}:`, result.reason.message);
          console.error('Error details:', result.reason.response?.data);
          return null;
        }
      });

      console.log('Stats response:', statsRes?.data);
      console.log('Companies response:', companiesRes?.data);

      // Set stats (with fallback)
      if (statsRes) {
        setDashboardStats(statsRes.data);
      }

      // Get buses and tickets data for aggregation
      const busesData = (busesRes?.data.buses) || [];
      const ticketsData = (ticketsRes?.data.tickets) || [];

      // Calculate buses per company by ID
      const busesByCompanyId = busesData.reduce((acc: any, bus: any) => {
        const companyId = bus.companyId;
        if (companyId) {
          acc[companyId] = (acc[companyId] || 0) + 1;
        }
        return acc;
      }, {});

      // Calculate tickets and revenue per company by ID
      const ticketsByCompanyId = ticketsData.reduce((acc: any, ticket: any) => {
        const companyId = ticket.companyId;
        if (companyId) {
          if (!acc[companyId]) {
            acc[companyId] = { count: 0, revenue: 0 };
          }
          acc[companyId].count += 1;
          acc[companyId].revenue += parseFloat(ticket.price) || 0;
        }
        return acc;
      }, {});

      // Set companies with enhanced data
      const companiesData = (companiesRes?.data.companies) || [];
      const enrichedCompanies = companiesData.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        plan: c.subscriptionPlan || 'Free Trial',
        status: c.status === 'approved' ? 'active' : c.status,
        subscriptionEnd: c.updatedAt,
        buses: busesByCompanyId[c.id] || 0,
        tickets: ticketsByCompanyId[c.id]?.count || 0,
        revenue: ticketsByCompanyId[c.id]?.revenue || 0,
      }));

      // Sort by revenue descending for top companies display
      setCompanies(enrichedCompanies.sort((a: any, b: any) => b.revenue - a.revenue));

      // Calculate subscription data
      const planCounts = companiesData.reduce((acc: any, c: any) => {
        const plan = c.subscriptionPlan || 'Free Trial';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {});

      setSubscriptionData([
        { name: 'Starter', value: planCounts['Starter'] || 0, color: COLORS.primary },
        { name: 'Growth', value: planCounts['Growth'] || 0, color: COLORS.secondary },
        { name: 'Enterprise', value: planCounts['Enterprise'] || 0, color: COLORS.success },
        { name: 'Free Trial', value: planCounts['Free Trial'] || 0, color: '#00BFFF' },
      ]);

      // Set users
      if (usersRes) {
        const usersData = usersRes.data.users || [];
        console.log('Raw users data from API:', usersData.slice(0, 2));
        setUsers(usersData);
      }

      // Set buses
      setBuses(busesData);

      // Set tickets
      setRecentTickets(ticketsData);

      // Set revenue data
      if (revenueRes) {
        setRevenueData(revenueRes.data.revenueData || []);
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show error to user
      alert(`Failed to load dashboard data: ${error.message}\n\nPlease check the console for details.`);
      
      setLoading(false);
    }
  };

  const modules = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { id: 'users', icon: Users, label: 'User Management', badge: users.length > 0 ? users.length.toLocaleString() : null },
    { id: 'companies', icon: Building2, label: 'Companies', badge: companies.length > 0 ? companies.length.toString() : null },
    { id: 'buses', icon: Bus, label: 'Buses & Routes', badge: buses.length > 0 ? buses.length.toString() : null },
    { id: 'tickets', icon: Ticket, label: 'Tickets', badge: dashboardStats.ticketsToday > 0 ? dashboardStats.ticketsToday.toString() : null },
    { id: 'tracking', icon: MapPin, label: 'Live Tracking', badge: null },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', badge: null },
    { id: 'settings', icon: Settings, label: 'Settings', badge: null },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0077B6] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* ========== SIDEBAR ========== */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-20'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-xl flex items-center justify-center shadow-lg">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-black text-lg text-[#2B2D42]">SafariTix</div>
                <div className="text-[10px] text-gray-500 font-semibold -mt-1">ADMIN PORTAL</div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-xl flex items-center justify-center shadow-lg">
              <Bus className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-64px)]">
          {modules.map(module => (
            <button
              key={module.id}
              onClick={() => { setActiveModule(module.id); setMobileMenuOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl
                transition-all duration-200 font-semibold text-sm
                ${activeModule === module.id
                  ? 'bg-gradient-to-r from-[#0077B6] to-[#005F8E] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <module.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left truncate">{module.label}</span>
                  {module.badge && (
                    <span className={`
                      px-2 py-0.5 rounded-full text-[10px] font-bold
                      ${activeModule === module.id ? 'bg-white/20 text-white' : 'bg-[#0077B6] text-white'}
                    `}>
                      {module.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ========== MAIN CONTENT ========== */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex w-10 h-10 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              {/* Search */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-96">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users, companies, tickets..."
                  className="bg-transparent border-none outline-none flex-1 text-sm"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <button className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E63946] rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-semibold text-gray-900">Admin User</div>
                  <div className="text-xs text-gray-500">Super Admin</div>
                </div>
                <button className="w-10 h-10 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-full flex items-center justify-center text-white font-bold">
                  A
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-6 xl:p-8">
          {activeModule === 'dashboard' && (
            <DashboardView 
              stats={dashboardStats}
              companies={companies}
              recentTickets={recentTickets}
              revenueData={revenueData}
              subscriptionData={subscriptionData}
            />
          )}
          {activeModule === 'users' && <UserManagement users={users} tickets={recentTickets} />}
          {activeModule === 'companies' && <CompanyManagement companies={companies} />}
          {activeModule === 'buses' && <BusManagement buses={buses} />}
          {activeModule === 'tickets' && <TicketManagement tickets={recentTickets} />}
          {activeModule === 'tracking' && <LiveTracking />}
          {activeModule === 'analytics' && (
            <Analytics
              stats={dashboardStats}
              companies={companies}
              users={users}
              buses={buses}
              tickets={recentTickets}
              revenueData={revenueData}
              subscriptionData={subscriptionData}
            />
          )}
          {activeModule === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

// ==================== DASHBOARD VIEW ====================
interface DashboardViewProps {
  stats: any;
  companies: any[];
  recentTickets: any[];
  revenueData: any[];
  subscriptionData: any[];
}

function DashboardView({ stats, companies, recentTickets, revenueData, subscriptionData }: DashboardViewProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black font-['Montserrat'] text-[#2B2D42] mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">Welcome to SafariTix Admin Portal</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-[#0077B6] text-white rounded-xl font-semibold hover:bg-[#005F8E] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="Total Commuters"
          value={stats.totalCommuters.toLocaleString()}
          change={`+${stats.growth.commuters}%`}
          trend="up"
          color={COLORS.primary}
        />
        <StatCard
          icon={Building2}
          label="Companies"
          value={stats.totalCompanies}
          change={`+${stats.growth.companies}%`}
          trend="up"
          color={COLORS.secondary}
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`RWF ${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          change={`+${stats.growth.revenue}%`}
          trend="up"
          color={COLORS.success}
        />
        <StatCard
          icon={Bus}
          label="Active Buses"
          value={stats.activeBuses}
          change={`+${stats.growth.buses}%`}
          trend="up"
          color={COLORS.primary}
        />
        <StatCard
          icon={Ticket}
          label="Tickets Today"
          value={stats.ticketsToday}
          change={`+${stats.growth.tickets}%`}
          trend="up"
          color={COLORS.secondary}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42]">Revenue Overview</h3>
              <p className="text-sm text-gray-500 mt-1">Last 6 months performance</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={3} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <p>No revenue data available</p>
            </div>
          )}
        </div>

        {/* Subscription Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-6">Subscription Plans</h3>
          {subscriptionData.filter(s => s.value > 0).length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPie>
                  <Pie
                    data={subscriptionData.filter(s => s.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subscriptionData.filter(s => s.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {subscriptionData.filter(s => s.value > 0).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              <p>No subscription data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42]">Recent Tickets</h3>
            <button className="text-[#0077B6] font-bold text-sm hover:underline">View All →</button>
          </div>
          {recentTickets.length > 0 ? (
            <div className="space-y-3">
              {recentTickets.map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-900">{ticket.bookingReference || `TKT-${ticket.id.slice(0, 4)}`}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        ticket.status === 'CONFIRMED' || ticket.status === 'CHECKED_IN' ? 'bg-green-100 text-green-700' : 
                        ticket.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{ticket.passengerName}</div>
                    <div className="text-xs text-gray-500">{ticket.route}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">RWF {ticket.price?.toLocaleString() || '0'}</div>
                    <div className="text-xs text-gray-500">{ticket.date ? new Date(ticket.date).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent tickets</p>
            </div>
          )}
        </div>

        {/* Top Companies */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42]">Top Companies</h3>
            <button className="text-[#0077B6] font-bold text-sm hover:underline">View All →</button>
          </div>
          {companies.length > 0 ? (
            <div className="space-y-3">
              {companies.slice(0, 4).map(company => (
                <div key={company.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-gray-900">{company.name}</div>
                    <div className="text-xs text-gray-500">{company.buses || 0} buses • {company.tickets || 0} tickets</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#27AE60]">
                      {company.revenue >= 1000000 
                        ? `RWF ${(company.revenue / 1000000).toFixed(1)}M`
                        : company.revenue >= 1000
                        ? `RWF ${(company.revenue / 1000).toFixed(0)}K`
                        : `RWF ${company.revenue.toLocaleString()}`
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No companies registered</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== STAT CARD ====================
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  color: string;
}

function StatCard({ icon: Icon, label, value, change, trend, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
          trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div className="text-2xl font-black font-['Montserrat'] text-[#2B2D42] mb-1">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
  );
}

// ==================== USER MANAGEMENT ====================
interface UserManagementProps {
  users: any[];
  tickets: any[];
}

function UserManagement({ users, tickets }: UserManagementProps) {
  const [filter, setFilter] = useState('all');

  // Debug: Log user data to see what's being received
  console.log('Users data in UserManagement:', users.slice(0, 2)); // Log first 2 users for inspection
  if (users.length > 0) {
    console.log('Sample user object keys:', Object.keys(users[0]));
    console.log('Sample user registered field:', users[0].registered);
  }

  // Calculate tickets per user (by email matching)
  const ticketsByUserEmail = tickets.reduce((acc: any, ticket: any) => {
    const email = ticket.passengerEmail;
    if (email) {
      acc[email] = (acc[email] || 0) + 1;
    }
    return acc;
  }, {});

  // Format date helper
  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Calculate days since registration
  const getDaysSince = (dateValue: any) => {
    if (!dateValue) return null;
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return null;
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return diff;
    } catch (error) {
      return null;
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    if (filter === 'commuters') return u.role === 'commuter';
    if (filter === 'drivers') return u.role === 'driver';
    if (filter === 'companies') return u.role === 'company_admin' || u.role === 'company';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black font-['Montserrat'] text-[#2B2D42] mb-2">User Management</h1>
          <p className="text-gray-600">Manage all system users</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-[#0077B6] to-[#005F8E] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4 flex-wrap">
        <button className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
          filter === 'all' ? 'bg-[#0077B6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`} onClick={() => setFilter('all')}>
          All Users
        </button>
        <button className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
          filter === 'commuters' ? 'bg-[#0077B6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`} onClick={() => setFilter('commuters')}>
          Commuters
        </button>
        <button className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
          filter === 'drivers' ? 'bg-[#0077B6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`} onClick={() => setFilter('drivers')}>
          Drivers
        </button>
        <button className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
          filter === 'companies' ? 'bg-[#0077B6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`} onClick={() => setFilter('companies')}>
          Companies
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(user.registered)}
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'commuter' || user.role === 'driver' ? (
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-[#0077B6]" />
                        <span className="text-sm font-semibold text-gray-900">
                          {ticketsByUserEmail[user.email] || 0} tickets
                        </span>
                      </div>
                    ) : user.role === 'company_admin' ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#F4A261]" />
                        <span className="text-sm font-semibold text-gray-700">
                          Company Admin
                        </span>
                      </div>
                    ) : user.role === 'admin' ? (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#E63946]" />
                        <span className="text-sm font-semibold text-gray-700">
                          System Admin
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        {getDaysSince(user.registered) !== null 
                          ? `${getDaysSince(user.registered)} days ago`
                          : 'N/A'
                        }
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPANY MANAGEMENT ====================
interface CompanyManagementProps {
  companies: any[];
}

function CompanyManagement({ companies }: CompanyManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; company: any } | null>(null);

  // Extended company data with more fields
  const companiesData = companies.map(c => ({
    ...c,
    email: c.email || `contact@${c.name.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: c.phone || '+250788' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
    registeredOn: c.createdAt || '2024-01-15',
    trialStart: c.plan === 'Free Trial' ? c.createdAt : null,
    trialEnd: c.plan === 'Free Trial' && c.createdAt ? new Date(new Date(c.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() : null,
    nextPayment: c.plan !== 'Free Trial' && c.subscriptionEnd ? c.subscriptionEnd : null,
    drivers: c.drivers || Math.floor(Math.random() * 30) + 10,
  }));

  // Filter and sort
  const filteredCompanies = companiesData
    .filter(c => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        c.name.toLowerCase().includes(searchLower) ||
        (c.email && c.email.toLowerCase().includes(searchLower)) ||
        (c.phone && c.phone.includes(searchQuery));
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesPlan = planFilter === 'all' || c.plan === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.registeredOn).getTime() - new Date(a.registeredOn).getTime();
      if (sortBy === 'revenue') return b.revenue - a.revenue;
      return 0;
    });

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-[#27AE60]/10 text-[#27AE60] border border-[#27AE60]/20',
      suspended: 'bg-[#F4A261]/10 text-[#F4A261] border border-[#F4A261]/20',
      blocked: 'bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20'
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      'Free Trial': 'bg-[#00BFFF]/10 text-[#00BFFF] border border-[#00BFFF]/20',
      'Starter': 'bg-[#0077B6]/10 text-[#0077B6] border border-[#0077B6]/20',
      'Growth': 'bg-[#F4A261]/10 text-[#F4A261] border border-[#F4A261]/20',
      'Enterprise': 'bg-[#27AE60]/10 text-[#27AE60] border border-[#27AE60]/20'
    };
    return colors[plan as keyof typeof colors] || colors.Starter;
  };

  const getTrialDaysLeft = (trialEnd: string | null) => {
    if (!trialEnd) return null;
    const end = new Date(trialEnd);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleAction = (action: string, company: any) => {
    setConfirmAction({ type: action, company });
    setShowConfirmModal(true);
  };

  const executeAction = () => {
    if (!confirmAction) return;
    console.log(`Executing ${confirmAction.type} on company:`, confirmAction.company.name);
    // Add API call here
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black font-['Montserrat'] text-[#2B2D42] mb-2">
            Company Management
          </h1>
          <p className="text-gray-600">Manage transport companies and subscriptions</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0077B6] to-[#005F8E] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-5 h-5" />
          Onboard Company
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077B6] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077B6] focus:border-transparent outline-none transition-all font-semibold"
            >
              <option value="all">All Status</option>
              <option value="active">✅ Active</option>
              <option value="suspended">⚠️ Suspended</option>
              <option value="blocked">❌ Blocked</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077B6] focus:border-transparent outline-none transition-all font-semibold"
            >
              <option value="all">All Plans</option>
              <option value="Free Trial">💎 Free Trial</option>
              <option value="Starter">Starter</option>
              <option value="Growth">Growth</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Sort & Active Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <button
              onClick={() => setSortBy('name')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                sortBy === 'name' ? 'bg-[#0077B6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                sortBy === 'date' ? 'bg-[#0077B6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Date
            </button>
            <button
              onClick={() => setSortBy('revenue')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                sortBy === 'revenue' ? 'bg-[#0077B6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Revenue
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Showing <span className="font-bold text-gray-900">{filteredCompanies.length}</span> of{' '}
            <span className="font-bold text-gray-900">{companiesData.length}</span> companies
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Trial/Next Payment</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCompanies.map(company => {
                const daysLeft = getTrialDaysLeft(company.trialEnd);
                return (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    {/* Company Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{company.name}</div>
                          <div className="text-xs text-gray-500">{company.buses} buses · {company.drivers} drivers</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{company.email}</div>
                        <div className="text-gray-500">{company.phone}</div>
                      </div>
                    </td>

                    {/* Registered On */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{new Date(company.registeredOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(company.status)}`}>
                        {company.status === 'active' && '✅'}
                        {company.status === 'suspended' && '⚠️'}
                        {company.status === 'blocked' && '❌'}
                        {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                      </span>
                    </td>

                    {/* Plan */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getPlanBadge(company.plan)}`}>
                        {company.plan === 'Free Trial' && '💎'}
                        {company.plan}
                      </span>
                    </td>

                    {/* Trial/Next Payment */}
                    <td className="px-6 py-4">
                      {company.plan === 'Free Trial' && daysLeft !== null ? (
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{daysLeft} days left</div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${daysLeft > 7 ? 'bg-[#27AE60]' : daysLeft > 3 ? 'bg-[#F4A261]' : 'bg-[#E63946]'}`}
                              style={{ width: `${(daysLeft / 14) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          {company.nextPayment ? new Date(company.nextPayment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedCompany(company); setShowDetailModal(true); }}
                          className="p-2 hover:bg-[#0077B6]/10 rounded-lg transition-colors group"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600 group-hover:text-[#0077B6]" />
                        </button>
                        <button
                          onClick={() => handleAction('edit', company)}
                          className="p-2 hover:bg-[#0077B6]/10 rounded-lg transition-colors group"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600 group-hover:text-[#0077B6]" />
                        </button>
                        {company.status === 'active' ? (
                          <button
                            onClick={() => handleAction('suspend', company)}
                            className="p-2 hover:bg-[#F4A261]/10 rounded-lg transition-colors group"
                            title="Suspend"
                          >
                            <AlertCircle className="w-4 h-4 text-gray-600 group-hover:text-[#F4A261]" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction('reactivate', company)}
                            className="p-2 hover:bg-[#27AE60]/10 rounded-lg transition-colors group"
                            title="Reactivate"
                          >
                            <CheckCircle className="w-4 h-4 text-gray-600 group-hover:text-[#27AE60]" />
                          </button>
                        )}
                        <button
                          onClick={() => handleAction('delete', company)}
                          className="p-2 hover:bg-[#E63946]/10 rounded-lg transition-colors group"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-[#E63946]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedCompany.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(selectedCompany.status)}`}>
                      {selectedCompany.status === 'active' && '✅'}
                      {selectedCompany.status.charAt(0).toUpperCase() + selectedCompany.status.slice(1)}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getPlanBadge(selectedCompany.plan)}`}>
                      {selectedCompany.plan}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-[#0077B6]" />
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="font-semibold text-gray-900">{selectedCompany.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-[#0077B6]" />
                    <div>
                      <div className="text-xs text-gray-500">Phone</div>
                      <div className="font-semibold text-gray-900">{selectedCompany.phone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Subscription Details</h3>
                <div className="bg-gradient-to-br from-[#0077B6]/10 to-[#005F8E]/10 rounded-xl p-6 border border-[#0077B6]/20">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Current Plan</div>
                      <div className="text-xl font-black text-gray-900">{selectedCompany.plan}</div>
                    </div>
                    {selectedCompany.plan === 'Free Trial' ? (
                      <>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Trial Started</div>
                          <div className="font-semibold text-gray-900">{new Date(selectedCompany.trialStart).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Trial Ends</div>
                          <div className="font-semibold text-[#E63946]">{new Date(selectedCompany.trialEnd).toLocaleDateString()}</div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Next Payment</div>
                        <div className="font-semibold text-gray-900">{new Date(selectedCompany.nextPayment).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fleet & Performance */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Fleet & Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Bus className="w-8 h-8 text-[#0077B6] mx-auto mb-2" />
                    <div className="text-2xl font-black text-gray-900">{selectedCompany.buses}</div>
                    <div className="text-xs text-gray-600">Buses</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Users className="w-8 h-8 text-[#F4A261] mx-auto mb-2" />
                    <div className="text-2xl font-black text-gray-900">{selectedCompany.drivers}</div>
                    <div className="text-xs text-gray-600">Drivers</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Ticket className="w-8 h-8 text-[#0077B6] mx-auto mb-2" />
                    <div className="text-2xl font-black text-gray-900">{selectedCompany.tickets.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Tickets Sold</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <DollarSign className="w-8 h-8 text-[#27AE60] mx-auto mb-2" />
                    <div className="text-2xl font-black text-[#27AE60]">{(selectedCompany.revenue / 1000000).toFixed(1)}M</div>
                    <div className="text-xs text-gray-600">Revenue</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleAction('upgrade', selectedCompany)}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-gradient-to-r from-[#0077B6] to-[#005F8E] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <Crown className="w-5 h-5" />
                  Upgrade Plan
                </button>
                {selectedCompany.status === 'active' ? (
                  <button
                    onClick={() => { setShowDetailModal(false); handleAction('suspend', selectedCompany); }}
                    className="flex items-center justify-center gap-2 bg-[#F4A261] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#F4A261]/90 transition-all"
                  >
                    <AlertCircle className="w-5 h-5" />
                    Suspend Account
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowDetailModal(false); handleAction('reactivate', selectedCompany); }}
                    className="flex items-center justify-center gap-2 bg-[#27AE60] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#27AE60]/90 transition-all"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Reactivate
                  </button>
                )}
                <button
                  onClick={() => { setShowDetailModal(false); handleAction('delete', selectedCompany); }}
                  className="flex items-center justify-center gap-2 bg-[#E63946] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#E63946]/90 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                confirmAction.type === 'delete' ? 'bg-[#E63946]/10' :
                confirmAction.type === 'suspend' ? 'bg-[#F4A261]/10' :
                'bg-[#27AE60]/10'
              }`}>
                {confirmAction.type === 'delete' && <Trash2 className="w-8 h-8 text-[#E63946]" />}
                {confirmAction.type === 'suspend' && <AlertCircle className="w-8 h-8 text-[#F4A261]" />}
                {(confirmAction.type === 'reactivate' || confirmAction.type === 'upgrade') && <CheckCircle className="w-8 h-8 text-[#27AE60]" />}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Confirm Action</h3>
              <p className="text-gray-600">
                Are you sure you want to <span className="font-bold">{confirmAction.type}</span>{' '}
                <span className="font-bold">{confirmAction.company.name}</span>?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all ${
                  confirmAction.type === 'delete' ? 'bg-[#E63946] hover:bg-[#E63946]/90' :
                  confirmAction.type === 'suspend' ? 'bg-[#F4A261] hover:bg-[#F4A261]/90' :
                  'bg-[#27AE60] hover:bg-[#27AE60]/90'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== BUS MANAGEMENT ====================
interface BusManagementProps {
  buses: any[];
}

function BusManagement({ buses }: BusManagementProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black font-['Montserrat'] text-[#2B2D42] mb-2">Bus & Route Management</h1>
          <p className="text-gray-600">Manage fleet and schedules</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-[#0077B6] to-[#005F8E] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-5 h-5" />
          Add Bus
        </button>
      </div>

      {/* Bus Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Bus</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Company</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Driver</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Capacity</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Last Service</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {buses.map(bus => (
                <tr key={bus.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-gray-900">{bus.plateNumber}</div>
                      <div className="text-sm text-gray-500">{bus.model}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{bus.company}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{bus.driver}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{bus.capacity} seats</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      bus.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {bus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{bus.lastService}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== TICKET MANAGEMENT ====================
interface TicketManagementProps {
  tickets: any[];
}

function TicketManagement({ tickets }: TicketManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter(t => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        t.bookingReference?.toLowerCase().includes(searchLower) ||
        t.passengerName?.toLowerCase().includes(searchLower) ||
        t.passengerEmail?.toLowerCase().includes(searchLower) ||
        t.route?.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'passenger') return (a.passengerName || '').localeCompare(b.passengerName || '');
      return 0;
    });

  const getStatusBadge = (status: string) => {
    const colors = {
      CONFIRMED: 'bg-[#27AE60]/10 text-[#27AE60] border border-[#27AE60]/20',
      PENDING_PAYMENT: 'bg-[#F4A261]/10 text-[#F4A261] border border-[#F4A261]/20',
      CANCELLED: 'bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20',
      EXPIRED: 'bg-gray-100 text-gray-600 border border-gray-200',
      CHECKED_IN: 'bg-[#0077B6]/10 text-[#0077B6] border border-[#0077B6]/20',
    };
    return colors[status as keyof typeof colors] || colors.PENDING_PAYMENT;
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    // Convert tickets to CSV
    const headers = ['Booking Reference', 'Passenger', 'Email', 'Route', 'Company', 'Seat', 'Price', 'Status', 'Date'];
    const csvData = filteredTickets.map(t => [
      t.bookingReference,
      t.passengerName,
      t.passengerEmail,
      t.route,
      t.companyName,
      t.seatNumber,
      `RWF ${t.price}`,
      t.status,
      formatDate(t.date)
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black font-['Montserrat'] text-[#2B2D42] mb-2">
            Ticket Management
          </h1>
          <p className="text-gray-600">View and manage all ticket bookings</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:border-[#0077B6] transition-all font-semibold"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by booking ref, passenger, route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077B6] font-semibold text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077B6] font-semibold text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="price">Sort by Price</option>
              <option value="passenger">Sort by Passenger</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Showing <span className="font-bold text-gray-900">{filteredTickets.length}</span> of <span className="font-bold text-gray-900">{tickets.length}</span> tickets
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#0077B6] hover:underline font-semibold"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#0077B6] to-[#005F8E] text-white">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Booking Ref
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Passenger
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Seat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTickets.map((ticket, index) => (
                  <tr 
                    key={ticket.id || index} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-[#0077B6]" />
                        <span className="font-mono text-sm font-bold text-gray-900">
                          {ticket.bookingReference || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {ticket.passengerName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ticket.passengerEmail || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {ticket.route || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {ticket.companyName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 text-gray-700 font-bold text-sm rounded-lg">
                        {ticket.seatNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        RWF {ticket.price?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(ticket.status)}`}>
                        {formatStatus(ticket.status || 'PENDING')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {ticket.date ? formatDate(ticket.date) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-2 hover:bg-[#0077B6]/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-[#0077B6]" />
                        </button>
                        <button 
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel Ticket"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Tickets Found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters or search query.' 
                : 'No ticket bookings in the database yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {tickets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Tickets</div>
            <div className="text-2xl font-black text-gray-900">{tickets.length}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Confirmed</div>
            <div className="text-2xl font-black text-[#27AE60]">
              {tickets.filter(t => t.status === 'CONFIRMED').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Pending Payment</div>
            <div className="text-2xl font-black text-[#F4A261]">
              {tickets.filter(t => t.status === 'PENDING_PAYMENT').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-black text-gray-900">
              RWF {tickets.reduce((sum, t) => sum + (t.price || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== LIVE TRACKING ====================
function LiveTracking() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-black font-['Montserrat'] text-[#2B2D42]">Live Fleet Tracking</h1>
      
      <div className="bg-white rounded-2xl p-8 border border-gray-200 aspect-video flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-[#0077B6] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Map Integration</h3>
          <p className="text-gray-600">GPS tracking map coming soon</p>
        </div>
      </div>
    </div>
  );
}

// ==================== ANALYTICS ====================
interface AnalyticsProps {
  stats: any;
  companies: any[];
  users: any[];
  buses: any[];
  tickets: any[];
  revenueData: any[];
  subscriptionData: any[];
}

function Analytics({ stats, companies, users, buses, tickets, revenueData, subscriptionData }: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // ---- Derived data computations ----

  // Ticket status distribution
  const ticketStatusCounts = tickets.reduce((acc: any, t: any) => {
    const status = t.status || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const ticketStatusData = Object.entries(ticketStatusCounts).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value: value as number,
    color: name === 'CONFIRMED' ? COLORS.success : name === 'CHECKED_IN' ? COLORS.primary : name === 'CANCELLED' ? COLORS.danger : name === 'PENDING_PAYMENT' ? COLORS.secondary : '#94a3b8',
  }));

  // User role distribution
  const roleCounts = users.reduce((acc: any, u: any) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});
  const userRoleData = Object.entries(roleCounts).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: value as number,
    color: name === 'commuter' ? COLORS.primary : name === 'company_admin' ? COLORS.secondary : name === 'driver' ? COLORS.success : name === 'admin' ? COLORS.danger : '#94a3b8',
  }));

  // Company status distribution
  const companyStatusCounts = companies.reduce((acc: any, c: any) => {
    const status = c.status === 'active' ? 'Active' : c.status === 'pending' ? 'Pending' : c.status === 'suspended' ? 'Suspended' : c.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const companyStatusData = Object.entries(companyStatusCounts).map(([name, value]) => ({
    name,
    value: value as number,
    color: name === 'Active' ? COLORS.success : name === 'Pending' ? COLORS.secondary : name === 'Suspended' ? COLORS.danger : '#94a3b8',
  }));

  // Bus status distribution
  const busStatusCounts = buses.reduce((acc: any, b: any) => {
    const status = (b.status || 'UNKNOWN').toUpperCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const busStatusData = Object.entries(busStatusCounts).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    value: value as number,
    color: name === 'ACTIVE' ? COLORS.success : name === 'INACTIVE' ? '#94a3b8' : COLORS.secondary,
  }));

  // Top routes by ticket count
  const routeTicketCounts = tickets.reduce((acc: any, t: any) => {
    const route = t.route || 'Unknown';
    if (!acc[route]) acc[route] = { count: 0, revenue: 0 };
    acc[route].count += 1;
    acc[route].revenue += parseFloat(t.price) || 0;
    return acc;
  }, {});
  const topRoutes = Object.entries(routeTicketCounts)
    .map(([route, data]: [string, any]) => ({ route, tickets: data.count, revenue: data.revenue }))
    .sort((a, b) => b.tickets - a.tickets)
    .slice(0, 8);

  // Company revenue ranking for bar chart
  const companyRevenueData = companies
    .filter(c => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)
    .map(c => ({ name: c.name.length > 15 ? c.name.slice(0, 15) + '...' : c.name, revenue: c.revenue, tickets: c.tickets }));

  // Daily ticket volume (last 30 days from ticket data)
  const dailyTickets = tickets.reduce((acc: any, t: any) => {
    if (!t.date) return acc;
    const day = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  const dailyTicketData = Object.entries(dailyTickets)
    .map(([day, count]) => ({ day, tickets: count as number }))
    .slice(-14);

  // Revenue data enriched with ticket count
  const enrichedRevenue = revenueData.map((r: any) => ({
    month: r.month,
    revenue: parseFloat(r.revenue) || 0,
    tickets: parseInt(r.tickets) || 0,
  }));

  // Bus capacity distribution
  const capacityCounts = buses.reduce((acc: any, b: any) => {
    const cap = `${b.capacity}-seat`;
    acc[cap] = (acc[cap] || 0) + 1;
    return acc;
  }, {});
  const capacityData = Object.entries(capacityCounts).map(([name, value]) => ({
    name,
    value: value as number,
    color: name === '25-seat' ? COLORS.primary : name === '30-seat' ? COLORS.secondary : COLORS.success,
  }));

  // Summary KPIs
  const totalRevenue = stats.totalRevenue || 0;
  const avgTicketPrice = tickets.length > 0 ? tickets.reduce((s: number, t: any) => s + (parseFloat(t.price) || 0), 0) / tickets.length : 0;
  const confirmedRate = tickets.length > 0 ? ((ticketStatusCounts['CONFIRMED'] || 0) + (ticketStatusCounts['CHECKED_IN'] || 0)) / tickets.length * 100 : 0;
  const avgBusCapacity = buses.length > 0 ? buses.reduce((s: number, b: any) => s + (b.capacity || 0), 0) / buses.length : 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'tickets', label: 'Tickets' },
    { id: 'users', label: 'Users & Companies' },
    { id: 'fleet', label: 'Fleet & Routes' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black font-['Montserrat'] text-[#2B2D42] mb-2">
            Advanced Analytics
          </h1>
          <p className="text-gray-600">Insights and performance metrics across the platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-1.5 border border-gray-200 flex items-center gap-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#0077B6] to-[#005F8E] text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#0077B6]/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#0077B6]" />
                </div>
                <span className="text-sm text-gray-600 font-medium">Total Revenue</span>
              </div>
              <div className="text-2xl font-black text-[#2B2D42]">
                RWF {totalRevenue >= 1000000 ? `${(totalRevenue / 1000000).toFixed(1)}M` : totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs font-bold text-green-600">
                <ArrowUp className="w-3 h-3" />
                +{stats.growth?.revenue || 0}% vs last period
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F4A261]/10 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-[#F4A261]" />
                </div>
                <span className="text-sm text-gray-600 font-medium">Avg. Ticket Price</span>
              </div>
              <div className="text-2xl font-black text-[#2B2D42]">
                RWF {avgTicketPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-gray-500 mt-2">{tickets.length} total tickets</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#27AE60]/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#27AE60]" />
                </div>
                <span className="text-sm text-gray-600 font-medium">Confirmation Rate</span>
              </div>
              <div className="text-2xl font-black text-[#2B2D42]">
                {confirmedRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-2">Confirmed + checked in</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center">
                  <Bus className="w-5 h-5 text-[#E63946]" />
                </div>
                <span className="text-sm text-gray-600 font-medium">Avg. Bus Capacity</span>
              </div>
              <div className="text-2xl font-black text-[#2B2D42]">
                {avgBusCapacity.toFixed(0)} seats
              </div>
              <div className="text-xs text-gray-500 mt-2">{buses.length} total buses</div>
            </div>
          </div>

          {/* Revenue Trend + Ticket Status */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Revenue & Tickets Trend</h3>
              <p className="text-sm text-gray-500 mb-6">Monthly performance over the last 6 months</p>
              {enrichedRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={enrichedRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis yAxisId="left" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip
                      formatter={(value: any, name: string) =>
                        name === 'Revenue (RWF)' ? [`RWF ${Number(value).toLocaleString()}`, 'Revenue'] : [value, 'Tickets']
                      }
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill={COLORS.primary} name="Revenue (RWF)" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="tickets" stroke={COLORS.secondary} strokeWidth={3} name="Tickets" dot={{ fill: COLORS.secondary, r: 5 }} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  <p>No revenue data available yet</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Ticket Status</h3>
              <p className="text-sm text-gray-500 mb-6">Distribution by status</p>
              {ticketStatusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPie>
                      <Pie data={ticketStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                        {ticketStatusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any, name: string) => [value, name]} />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {ticketStatusData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600 capitalize">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-400">No ticket data</div>
              )}
            </div>
          </div>

          {/* User Role + Top Routes */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">User Distribution</h3>
              <p className="text-sm text-gray-500 mb-6">Users by role</p>
              {userRoleData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPie>
                      <Pie data={userRoleData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                        {userRoleData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {userRoleData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-400">No user data</div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Top Routes</h3>
              <p className="text-sm text-gray-500 mb-6">By ticket volume</p>
              {topRoutes.length > 0 ? (
                <div className="space-y-3">
                  {topRoutes.slice(0, 5).map((route, i) => {
                    const maxTickets = topRoutes[0].tickets;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-700 truncate max-w-[60%]">{route.route}</span>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-500">{route.tickets} tickets</span>
                            <span className="font-bold text-[#27AE60]">RWF {route.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#0077B6] to-[#005F8E]"
                            style={{ width: `${(route.tickets / maxTickets) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-400">No route data</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== REVENUE TAB ===== */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
              <div className="text-2xl font-black text-[#2B2D42]">
                RWF {totalRevenue >= 1000000 ? `${(totalRevenue / 1000000).toFixed(1)}M` : totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">This Month</div>
              <div className="text-2xl font-black text-[#27AE60]">
                RWF {enrichedRevenue.length > 0 ? (enrichedRevenue[enrichedRevenue.length - 1].revenue >= 1000000 ? `${(enrichedRevenue[enrichedRevenue.length - 1].revenue / 1000000).toFixed(1)}M` : enrichedRevenue[enrichedRevenue.length - 1].revenue.toLocaleString()) : '0'}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Avg. Monthly Revenue</div>
              <div className="text-2xl font-black text-[#0077B6]">
                RWF {enrichedRevenue.length > 0 ? (enrichedRevenue.reduce((s: number, r: any) => s + r.revenue, 0) / enrichedRevenue.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Revenue per Ticket</div>
              <div className="text-2xl font-black text-[#F4A261]">
                RWF {avgTicketPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Revenue Area Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Revenue Over Time</h3>
            <p className="text-sm text-gray-500 mb-6">Monthly revenue trend</p>
            {enrichedRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={enrichedRevenue}>
                  <defs>
                    <linearGradient id="colorAnalyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <Tooltip formatter={(value: any) => [`RWF ${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={3} fill="url(#colorAnalyticsRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-400">No revenue data available</div>
            )}
          </div>

          {/* Revenue by Company */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Revenue by Company</h3>
            <p className="text-sm text-gray-500 mb-6">Top performing companies</p>
            {companyRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companyRevenueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" style={{ fontSize: '12px' }} width={130} />
                  <Tooltip formatter={(value: any) => [`RWF ${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No company revenue data</div>
            )}
          </div>
        </div>
      )}

      {/* ===== TICKETS TAB ===== */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Ticket KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Total Tickets</div>
              <div className="text-2xl font-black text-[#2B2D42]">{tickets.length}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Confirmed</div>
              <div className="text-2xl font-black text-[#27AE60]">{ticketStatusCounts['CONFIRMED'] || 0}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Cancelled</div>
              <div className="text-2xl font-black text-[#E63946]">{ticketStatusCounts['CANCELLED'] || 0}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Today</div>
              <div className="text-2xl font-black text-[#0077B6]">{stats.ticketsToday || 0}</div>
            </div>
          </div>

          {/* Ticket Volume + Status Chart */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Daily Ticket Volume</h3>
              <p className="text-sm text-gray-500 mb-6">Recent booking activity</p>
              {dailyTicketData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyTicketData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '11px' }} angle={-30} textAnchor="end" height={60} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="tickets" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Tickets" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">No daily ticket data</div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Ticket Status Breakdown</h3>
              <p className="text-sm text-gray-500 mb-6">Current distribution</p>
              {ticketStatusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <RechartsPie>
                      <Pie data={ticketStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                        {ticketStatusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {ticketStatusData.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-600 truncate">{item.name}</span>
                        <span className="font-bold text-gray-900 ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>
              )}
            </div>
          </div>

          {/* Top Routes Table */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Route Performance</h3>
            <p className="text-sm text-gray-500 mb-6">Ranked by ticket sales</p>
            {topRoutes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Route</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Tickets</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Revenue</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Avg. Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topRoutes.map((route, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-bold text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-[#0077B6]" />
                            <span className="text-sm font-semibold text-gray-900">{route.route}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{route.tickets}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-[#27AE60]">RWF {route.revenue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">RWF {route.tickets > 0 ? (route.revenue / route.tickets).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400">No route data available</div>
            )}
          </div>
        </div>
      )}

      {/* ===== USERS & COMPANIES TAB ===== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Total Users</div>
              <div className="text-2xl font-black text-[#2B2D42]">{users.length}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Commuters</div>
              <div className="text-2xl font-black text-[#0077B6]">{roleCounts['commuter'] || 0}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Companies</div>
              <div className="text-2xl font-black text-[#F4A261]">{companies.length}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Drivers</div>
              <div className="text-2xl font-black text-[#27AE60]">{roleCounts['driver'] || 0}</div>
            </div>
          </div>

          {/* User Role + Subscription Plan Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">User Role Distribution</h3>
              <p className="text-sm text-gray-500 mb-6">Breakdown across roles</p>
              {userRoleData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie data={userRoleData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                        {userRoleData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {userRoleData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">{item.value}</span>
                          <span className="text-gray-400 text-xs">({users.length > 0 ? ((item.value / users.length) * 100).toFixed(0) : 0}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">No user data</div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Subscription Plans</h3>
              <p className="text-sm text-gray-500 mb-6">Company plan distribution</p>
              {subscriptionData.filter(s => s.value > 0).length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie data={subscriptionData.filter(s => s.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                        {subscriptionData.filter(s => s.value > 0).map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {subscriptionData.filter(s => s.value > 0).map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">No subscription data</div>
              )}
            </div>
          </div>

          {/* Company Status + Top Companies */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Company Status</h3>
              <p className="text-sm text-gray-500 mb-6">Active vs pending vs suspended</p>
              {companyStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={companyStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Companies" radius={[4, 4, 0, 0]}>
                      {companyStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">No company data</div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Top Companies by Revenue</h3>
              <p className="text-sm text-gray-500 mb-6">Highest earning companies</p>
              {companies.filter(c => c.revenue > 0).length > 0 ? (
                <div className="space-y-3">
                  {companies.filter(c => c.revenue > 0).slice(0, 5).map((c, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-gray-900 truncate">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.buses} buses · {c.tickets} tickets</div>
                      </div>
                      <div className="text-sm font-bold text-[#27AE60] whitespace-nowrap">
                        RWF {c.revenue >= 1000000 ? `${(c.revenue / 1000000).toFixed(1)}M` : c.revenue.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">No revenue data</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== FLEET & ROUTES TAB ===== */}
      {activeTab === 'fleet' && (
        <div className="space-y-6">
          {/* Fleet KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Total Buses</div>
              <div className="text-2xl font-black text-[#2B2D42]">{buses.length}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Active Buses</div>
              <div className="text-2xl font-black text-[#27AE60]">{busStatusCounts['ACTIVE'] || 0}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Total Seat Capacity</div>
              <div className="text-2xl font-black text-[#0077B6]">{buses.reduce((s: number, b: any) => s + (b.capacity || 0), 0).toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Active Routes</div>
              <div className="text-2xl font-black text-[#F4A261]">{topRoutes.length}</div>
            </div>
          </div>

          {/* Bus Status + Capacity Distribution */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Bus Status</h3>
              <p className="text-sm text-gray-500 mb-6">Fleet availability</p>
              {busStatusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie data={busStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                        {busStatusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {busStatusData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">{item.value}</span>
                          <span className="text-gray-400 text-xs">({buses.length > 0 ? ((item.value / buses.length) * 100).toFixed(0) : 0}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">No bus data</div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Capacity Distribution</h3>
              <p className="text-sm text-gray-500 mb-6">Buses by seat layout</p>
              {capacityData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={capacityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Buses" radius={[4, 4, 0, 0]}>
                        {capacityData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {capacityData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.value} buses</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">No capacity data</div>
              )}
            </div>
          </div>

          {/* Fleet by Company */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-black font-['Montserrat'] text-[#2B2D42] mb-1">Fleet by Company</h3>
            <p className="text-sm text-gray-500 mb-6">Bus count per company</p>
            {companies.filter(c => c.buses > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companies.filter(c => c.buses > 0).sort((a: any, b: any) => b.buses - a.buses).slice(0, 8).map((c: any) => ({ name: c.name.length > 15 ? c.name.slice(0, 15) + '...' : c.name, buses: c.buses }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '11px' }} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="buses" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Buses" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No fleet data available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== SETTINGS ====================
function SettingsView() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-black font-['Montserrat'] text-[#2B2D42]">System Settings</h1>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Subscription Plans</h3>
          <div className="space-y-3">
            {['Starter', 'Growth', 'Enterprise'].map(plan => (
              <div key={plan} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-900">{plan}</span>
                <button className="text-[#0077B6] font-bold text-sm hover:underline">Configure</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">System Configuration</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">Notifications</span>
              <button className="text-[#0077B6] font-bold text-sm hover:underline">Manage</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">Permissions</span>
              <button className="text-[#0077B6] font-bold text-sm hover:underline">Configure</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
