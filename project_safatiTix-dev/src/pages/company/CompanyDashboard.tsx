// pages/company/CompanyDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useKPIStore } from '../../stores/kpiStore';
import { useBusesStore } from '../../stores/busesStore';
import { useDriversStore } from '../../stores/driversStore';
import { useSchedulesStore } from '../../stores/schedulesStore';
import SuccessPopup from '../../components/SuccessPopup';
import RevenueReports from './RevenueReports';
import TicketsManagement from './TicketsManagement';
import CompanyFleetTracking from '../../components/CompanyFleetTracking';
import {
  LayoutDashboard,
  Bus,
  Users,
  Calendar,
  Ticket,
  TrendingUp,
  MapPin,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Navigation,
  Phone,
  Mail,
  Filter,
  Download,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Bell,
  User,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

const notifications = [
  { id: 1, type: 'alert', message: 'Bus RAB-202B scheduled for maintenance today', time: '10 min ago' },
  { id: 2, type: 'success', message: '3 new ticket bookings for Kigali → Gisenyi route', time: '25 min ago' },
  { id: 3, type: 'info', message: 'Driver James Mwangi completed trip RAB-101A', time: '1 hr ago' },
];

export default function CompanyDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { 
    totalBuses,
    activeBuses,
    activeRoutes,
    activeDrivers,
    todaysRevenue,
    todaysTickets,
    activeTripsCount,
    activeBusesList,
    revenueData,
    busStatusData,
    recentTickets,
    loading: kpiLoading,
    fetchDashboardData 
  } = useKPIStore();

  const { fetchBuses } = useBusesStore();
  const { fetchDrivers } = useDriversStore();
  const { fetchSchedules } = useSchedulesStore();

  useEffect(() => {
    fetchDashboardData();
    fetchBuses();
    fetchDrivers();
    fetchSchedules();

    // Poll for active buses every 5 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const displayName = user?.name || user?.full_name || user?.email || 'Admin User';
  const displayRole = user?.role === 'company_admin' ? 'Company Admin' : 
                     (user?.role || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'buses', label: 'Buses', icon: Bus },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'schedules', label: 'Schedules', icon: Calendar },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'revenue', label: 'Revenue & Reports', icon: TrendingUp },
    { id: 'tracking', label: 'Live Tracking', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/app/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] font-['Inter']">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-gradient-to-b from-[#2B2D42] to-[#1a1b2e]
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-xl flex items-center justify-center shadow-lg">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-['Montserrat'] font-bold bg-gradient-to-r from-[#0077B6] to-[#00A8E8] bg-clip-text text-transparent">
                SafariTix
              </span>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-xl flex items-center justify-center shadow-lg">
              <Bus className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-3 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-300 font-medium text-sm
                ${activeSection === item.id
                  ? 'bg-gradient-to-r from-[#0077B6] to-[#005F8E] text-white shadow-lg shadow-[#0077B6]/30'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && activeSection === item.id && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 font-medium text-sm"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Sidebar Toggle Desktop */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex w-10 h-10 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-[#F5F7FA] rounded-lg px-4 py-2 w-96">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search buses, drivers, routes..."
                className="bg-transparent border-none outline-none flex-1 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#E63946] rounded-full"></span>
            </button>

            {/* Profile */}
            <button className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-gray-900">{displayName}</div>
                <div className="text-xs text-gray-500">{displayRole}</div>
              </div>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {activeSection === 'dashboard' && (
            <DashboardOverview 
              kpis={{
                totalBuses,
                activeBuses,
                activeRoutes,
                activeDrivers,
                todaysRevenue,
                todaysTickets
              }}
              activeBusesList={activeBusesList}
              revenueData={revenueData}
              busStatusData={busStatusData}
              recentTickets={recentTickets}
              loading={kpiLoading}
            />
          )}
          {activeSection === 'buses' && <BusesSection />}
          {activeSection === 'drivers' && <DriversSection />}
          {activeSection === 'schedules' && <SchedulesSection />}
          {activeSection === 'tickets' && <TicketsManagement />}
          {activeSection === 'revenue' && <RevenueReports />}
          {activeSection === 'tracking' && <TrackingSection totalActiveTrips={activeTripsCount} />}
          {activeSection === 'settings' && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview({ kpis, activeBusesList, revenueData, busStatusData, recentTickets, loading }: { 
  kpis: any; 
  activeBusesList?: any[]; 
  revenueData?: any[]; 
  busStatusData?: any[]; 
  recentTickets?: any[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0077B6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-['Montserrat'] font-bold text-[#2B2D42] mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Buses"
          value={kpis.totalBuses}
          change="+2"
          trend="up"
          icon={Bus}
          color={COLORS.primary}
          subtitle={`${kpis.activeBuses} Active`}
        />
        <KPICard
          title="Active Routes"
          value={kpis.activeRoutes}
          change="+1"
          trend="up"
          icon={MapPin}
          color={COLORS.secondary}
          subtitle="High Traffic"
        />
        <KPICard
          title="Active Drivers"
          value={kpis.activeDrivers}
          change="-1"
          trend="down"
          icon={Users}
          color={COLORS.success}
          subtitle="On Duty"
        />
        <KPICard
          title="Today's Revenue"
          value={`RWF ${Math.round(kpis.todaysRevenue).toLocaleString()}`}
          change="+15%"
          trend="up"
          icon={DollarSign}
          color={COLORS.primary}
          subtitle={`${kpis.todaysTickets} Tickets`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-['Montserrat'] font-bold text-[#2B2D42]">
                Revenue Overview
              </h3>
              <p className="text-sm text-gray-500 mt-1">Monthly revenue trends</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
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
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.primary}
                strokeWidth={3}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bus Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-['Montserrat'] font-bold text-[#2B2D42] mb-6">
            Fleet Status
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={busStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {busStatusData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {busStatusData?.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Buses and Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Buses */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-['Montserrat'] font-bold text-[#2B2D42]">
              Active Buses
            </h3>
            <button className="text-sm text-[#0077B6] font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {activeBusesList?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bus className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No active buses at the moment</p>
              </div>
            ) : (
              activeBusesList?.map((bus) => (
                <div key={bus.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-xl flex items-center justify-center">
                      <Bus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{bus.plate}</div>
                      <div className="text-sm text-gray-600">{bus.driver}</div>
                      <div className="text-xs text-gray-500 mt-1">{bus.route}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#27AE60]">{typeof bus.occupancy === 'number' ? `${bus.occupancy}%` : bus.occupancy}</div>
                    <div className="text-xs text-gray-500 mt-1">ETA: {bus.eta}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-['Montserrat'] font-bold text-[#2B2D42]">
              Recent Tickets
            </h3>
            <button className="text-sm text-[#0077B6] font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentTickets?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Ticket className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No recent tickets</p>
              </div>
            ) : (
              recentTickets?.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-[#0077B6] transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{ticket.id}</span>
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full font-medium
                        ${ticket.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                      `}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{ticket.passenger}</div>
                    <div className="text-xs text-gray-500 mt-1">{ticket.route}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">RWF {ticket.amount?.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">{ticket.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-['Montserrat'] font-bold text-[#2B2D42] mb-6">
          Alerts & Notifications
        </h3>
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div key={notif.id} className={`
              flex items-start gap-4 p-4 rounded-xl
              ${notif.type === 'alert' ? 'bg-red-50 border border-red-100' :
                notif.type === 'success' ? 'bg-green-50 border border-green-100' :
                'bg-blue-50 border border-blue-100'}
            `}>
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${notif.type === 'alert' ? 'bg-red-100' :
                  notif.type === 'success' ? 'bg-green-100' :
                  'bg-blue-100'}
              `}>
                {notif.type === 'alert' && <AlertCircle className="w-5 h-5 text-red-600" />}
                {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {notif.type === 'info' && <Clock className="w-5 h-5 text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
function KPICard({ title, value, change, trend, icon: Icon, color, subtitle }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
          trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div className="text-3xl font-['Montserrat'] font-bold text-[#2B2D42] mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-2">{subtitle}</div>}
    </div>
  );
}

// Placeholder sections - to be implemented with stores
function BusesSection() {
  const { buses, loading, error, fetchBuses, addBus, updateBus, deleteBus } = useBusesStore();
  const { drivers, fetchDrivers } = useDriversStore();
  const [showAddBus, setShowAddBus] = useState(false);
  const [showEditBus, setShowEditBus] = useState(false);
  const [editBus, setEditBus] = useState<any | null>(null);

  useEffect(() => {
    fetchBuses();
    fetchDrivers();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-['Montserrat'] font-bold text-[#2B2D42]">Buses Management</h2>
        <button onClick={() => setShowAddBus(true)} className="px-3 py-2 bg-[#0077B6] text-white rounded-md">Add Bus</button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading buses...</div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : buses.length === 0 ? (
        <div className="text-sm text-gray-500">No buses found for this company.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="text-left">
                <th className="px-3 py-2 border-b">Plate</th>
                <th className="px-3 py-2 border-b">Model</th>
                <th className="px-3 py-2 border-b">Capacity</th>
                <th className="px-3 py-2 border-b">Driver</th>
                <th className="px-3 py-2 border-b">Status</th>
                <th className="px-3 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b">{b.plate_number || b.plateNumber || b.id}</td>
                  <td className="px-3 py-2 border-b">{b.model || '—'}</td>
                  <td className="px-3 py-2 border-b">{b.capacity || '—'}</td>
                  <td className="px-3 py-2 border-b">{b.driver?.name || b.driverName || '—'}</td>
                  <td className="px-3 py-2 border-b">{b.status || '—'}</td>
                  <td className="px-3 py-2 border-b">
                    <button onClick={() => { setShowEditBus(true); setEditBus(b); }} className="px-2 py-1 bg-gray-100 rounded">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddBus && (
        <AddBusModal 
          onClose={() => setShowAddBus(false)} 
          drivers={drivers}
          onCreated={() => {
            setShowAddBus(false);
            fetchBuses();
          }} 
        />
      )}
      {showEditBus && editBus && (
        <EditBusModal 
          bus={editBus} 
          drivers={drivers}
          onClose={() => { setShowEditBus(false); setEditBus(null); }} 
          onUpdated={() => {
            setShowEditBus(false);
            setEditBus(null);
            fetchBuses();
          }} 
        />
      )}
    </div>
  );
}

function DriversSection() {
  const { drivers, loading, error, fetchDrivers, addDriver, updateDriver, deleteDriver } = useDriversStore();
  const [selected, setSelected] = useState<any>(null);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showEditDriver, setShowEditDriver] = useState(false);
  const [editDriver, setEditDriver] = useState<any | null>(null);
  const [successPopup, setSuccessPopup] = useState<{ open: boolean; tempPassword?: string | null; message?: string | null }>({ open: false, tempPassword: null, message: null });
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-['Montserrat'] font-bold text-[#2B2D42]">Drivers Management</h2>
        <button onClick={() => setShowAddDriver(true)} className="px-3 py-2 bg-[#0077B6] text-white rounded-md">Add Driver</button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading drivers...</div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : drivers.length === 0 ? (
        <div className="text-sm text-gray-500">No drivers found for this company.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="text-left">
                <th className="px-3 py-2 border-b"><input type="checkbox" checked={selectAll} onChange={(e) => {
                  const next = e.target.checked;
                  setSelectAll(next);
                  if (next) {
                    const map: Record<string, boolean> = {};
                    drivers.forEach(d => { map[String(d.id)] = true; });
                    setSelectedIds(map);
                  } else {
                    setSelectedIds({});
                  }
                }} /></th>
                <th className="px-3 py-2 border-b">Name</th>
                <th className="px-3 py-2 border-b">Email</th>
                <th className="px-3 py-2 border-b">Phone</th>
                <th className="px-3 py-2 border-b">License</th>
                <th className="px-3 py-2 border-b">Available</th>
                <th className="px-3 py-2 border-b">Assigned Buses</th>
                <th className="px-3 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b">
                    <input type="checkbox" checked={!!selectedIds[String(d.id || '')]} onChange={(e) => {
                      const next = { ...selectedIds, [String(d.id || '')]: e.target.checked };
                      setSelectedIds(next);
                      if (!e.target.checked) setSelectAll(false);
                    }} />
                  </td>
                  <td className="px-3 py-2 border-b">{d.name || d.full_name}</td>
                  <td className="px-3 py-2 border-b">{d.email || '—'}</td>
                  <td className="px-3 py-2 border-b">{d.phone || '—'}</td>
                  <td className="px-3 py-2 border-b">{d.license || '—'}</td>
                  <td className="px-3 py-2 border-b">{d.available ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2 border-b">{(d.buses || []).length}</td>
                  <td className="px-3 py-2 border-b flex gap-2">
                    <button onClick={() => setSelected(d)} className="px-2 py-1 bg-gray-100 rounded">View</button>
                    <button onClick={() => { setEditDriver(d); setShowEditDriver(true); }} className="px-2 py-1 bg-blue-100 rounded">Edit</button>
                    <button onClick={async () => {
                      if (!confirm('Delete this driver? This cannot be undone.')) return;
                      try {
                        await deleteDriver(d.id);
                      } catch (err) {
                        alert('Failed to delete driver');
                      }
                    }} className="px-2 py-1 bg-red-100 text-red-700 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <DriverModal driver={selected} onClose={() => setSelected(null)} />}
      {showAddDriver && (
        <AddDriverModal 
          onClose={() => setShowAddDriver(false)} 
          onCreated={(driver: any, tempPassword: string) => {
            setShowAddDriver(false);
            setSuccessPopup({ open: true, tempPassword, message: 'Driver created successfully' });
          }} 
        />
      )}
      {showEditDriver && editDriver && (
        <EditDriverModal 
          driver={editDriver} 
          onClose={() => { setShowEditDriver(false); setEditDriver(null); }} 
          onUpdated={() => {
            setShowEditDriver(false);
            setEditDriver(null);
            fetchDrivers();
          }} 
        />
      )}

      {successPopup.open && (
        <SuccessPopup 
          isOpen={successPopup.open} 
          title="Driver created" 
          message={successPopup.message || ''} 
          tempPassword={successPopup.tempPassword || ''} 
          onClose={() => { 
            setSuccessPopup({ open: false, tempPassword: null, message: null }); 
            fetchDrivers();
          }} 
        />
      )}
    </div>
  );
}

function DriverModal({ driver, onClose }: { driver: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl p-6 w-[520px] shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Driver Details</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>
        <div className="space-y-3">
          <div><span className="font-semibold">Name:</span> {driver.name || driver.full_name}</div>
          <div><span className="font-semibold">License:</span> {driver.license || 'N/A'}</div>
          <div><span className="font-semibold">Phone:</span> {driver.phone || 'N/A'}</div>
          <div><span className="font-semibold">Status:</span> {driver.available ? 'Available' : 'Unavailable'}</div>
          <div>
            <span className="font-semibold">Assigned buses:</span>
            <ul className="list-disc ml-6">
              {(driver.buses || []).map((b: any) => (<li key={b.id}>{b.plate_number || b.plateNumber || b.id}</li>))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchedulesSection() {
  const { schedules, loading, error, fetchSchedules, addSchedule } = useSchedulesStore();
  const { buses, fetchBuses } = useBusesStore();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchSchedules();
    fetchBuses();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-['Montserrat'] font-bold text-[#2B2D42]">Schedules Management</h2>
        <button onClick={() => setShowAdd(true)} className="px-3 py-2 bg-[#0077B6] text-white rounded-md">Create Schedule</button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading schedules...</div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : schedules.length === 0 ? (
        <div className="text-sm text-gray-500">No schedules found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="text-left">
                <th className="px-3 py-2 border-b">Date</th>
                <th className="px-3 py-2 border-b">Route</th>
                <th className="px-3 py-2 border-b">Bus</th>
                <th className="px-3 py-2 border-b">Departure</th>
                <th className="px-3 py-2 border-b">Arrival</th>
                <th className="px-3 py-2 border-b">Seats</th>
                <th className="px-3 py-2 border-b">Price</th>
                <th className="px-3 py-2 border-b">Revenue</th>
                <th className="px-3 py-2 border-b">Driver</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => {
                const totalSeats = s.totalSeats || s.total_seats || 0;
                const availableSeats = (s.seatsAvailable != null ? s.seatsAvailable : s.seats_available) || 0;
                const soldSeats = totalSeats - availableSeats;
                const price = s.price || 0;
                const revenue = soldSeats * price;
                
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border-b">{s.scheduleDate || s.date || s.schedule_date || '—'}</td>
                    <td className="px-3 py-2 border-b">{(s.routeFrom || '—') + ' → ' + (s.routeTo || '—')}</td>
                    <td className="px-3 py-2 border-b">{s.busPlateNumber || (s.bus?.plate_number) || '—'}</td>
                    <td className="px-3 py-2 border-b">{s.departureTime || '—'}</td>
                    <td className="px-3 py-2 border-b">{s.arrivalTime || '—'}</td>
                    <td className="px-3 py-2 border-b">{availableSeats + '/' + (totalSeats || '—')}</td>
                    <td className="px-3 py-2 border-b">{price ? `RWF ${price.toLocaleString()}` : '—'}</td>
                    <td className="px-3 py-2 border-b font-semibold text-[#27AE60]">{revenue > 0 ? `RWF ${revenue.toLocaleString()}` : 'RWF 0'}</td>
                    <td className="px-3 py-2 border-b">{s.driverName || s.driver?.name || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddScheduleModal 
          buses={buses} 
          onClose={() => { 
            setShowAdd(false); 
            fetchSchedules(); 
          }} 
        />
      )}
    </div>
  );
}

function TrackingSection({ totalActiveTrips }: { totalActiveTrips: number }) {
  return <CompanyFleetTracking activeBuses={totalActiveTrips} />;
}

function SettingsSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-['Montserrat'] font-bold text-[#2B2D42] mb-4">Settings</h2>
      <p className="text-gray-600">Settings interface coming soon...</p>
    </div>
  );
}

// Modal Components (simplified - using stores instead of fetch)
function AddDriverModal({ onClose, onCreated }: { onClose: () => void; onCreated?: (driver: any, tempPassword: string) => void }) {
  const { addDriver } = useDriversStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    setError('');
    if (!fullName || !license) { setError('Name and license number are required'); return; }
    setSaving(true);
    try {
      const { driver, temporaryPassword } = await addDriver({ name: fullName, email, phone, license });
      if (onCreated) onCreated(driver, temporaryPassword);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating driver');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl p-6 w-[520px] shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Driver</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Full name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} type="text" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="text" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">License number</label>
            <input value={license} onChange={e => setLicense(e.target.value)} type="text" className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#0077B6] text-white rounded">{saving ? 'Saving...' : 'Create Driver'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddBusModal({ onClose, drivers, onCreated }: { onClose: () => void; drivers: any[]; onCreated?: () => void }) {
  const { addBus } = useBusesStore();
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState('30');
  const [driverId, setDriverId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const selectableDrivers = React.useMemo(() => drivers.filter(d => !(String(d.id || '').startsWith('legacy-'))), [drivers]);

  const submit = async (e: any) => {
    e.preventDefault();
    setError('');
    if (!plate || !driverId) { setError('Plate number and driver selection are required'); return; }
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (driverId && !uuidRegex.test(driverId)) { setError('Invalid driver selected'); return; }
    setSaving(true);
    try {
      await addBus({ plate_number: plate, model, capacity: parseInt(capacity, 10) || 30, driver_id: driverId });
      if (onCreated) onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating bus');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl p-6 w-[520px] shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Bus</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Plate number</label>
            <input value={plate} onChange={e => setPlate(e.target.value)} type="text" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Model</label>
            <input value={model} onChange={e => setModel(e.target.value)} type="text" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Capacity</label>
            <input value={capacity} onChange={e => setCapacity(e.target.value)} type="number" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Assign Driver</label>
            {selectableDrivers.length === 0 ? (
              <div className="text-sm text-gray-500">No assignable drivers available. Create a driver first.</div>
            ) : (
              <select value={driverId || ''} onChange={e => setDriverId(e.target.value || null)} className="w-full border rounded px-3 py-2">
                <option value="">-- Select driver --</option>
                {selectableDrivers.map(d => (<option key={d.id} value={d.id}>{d.name || d.full_name || d.email || d.id}</option>))}
              </select>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#0077B6] text-white rounded">{saving ? 'Saving...' : 'Create Bus'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddScheduleModal({ onClose, buses }: { onClose: () => void; buses: any[] }) {
  const { addSchedule } = useSchedulesStore();
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [date, setDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [price, setPrice] = useState('0');
  const [busId, setBusId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    setError('');
    if (!busId || !routeFrom || !routeTo || !date || !departureTime || !price) { 
      setError('Bus, route, date, departure time and price are required'); 
      return; 
    }
    setSaving(true);
    try {
      await addSchedule({ 
        busId, 
        routeFrom, 
        routeTo, 
        departureTime, 
        arrivalTime, 
        price: parseFloat(price || '0'), 
        date 
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl p-6 w-[640px] shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Schedule</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">From</label>
              <input value={routeFrom} onChange={e => setRouteFrom(e.target.value)} type="text" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">To</label>
              <input value={routeTo} onChange={e => setRouteTo(e.target.value)} type="text" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Date</label>
              <input value={date} onChange={e => setDate(e.target.value)} type="date" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Departure Time</label>
              <input value={departureTime} onChange={e => setDepartureTime(e.target.value)} type="time" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Arrival Time</label>
              <input value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} type="time" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Price (RWF)</label>
              <input value={price} onChange={e => setPrice(e.target.value)} type="number" className="w-full border rounded px-3 py-2" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm mb-1">Bus</label>
              <select value={busId || ''} onChange={e => setBusId(e.target.value || null)} className="w-full border rounded px-3 py-2">
                <option value="">-- Select Bus --</option>
                {buses.map(b => (<option key={b.id} value={b.id}>{b.plate_number || b.plateNumber || b.id}</option>))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#0077B6] text-white rounded">{saving ? 'Saving...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditBusModal({ onClose, drivers, bus, onUpdated }: { onClose: () => void; drivers: any[]; bus: any; onUpdated?: () => void }) {
  const { updateBus } = useBusesStore();
  const [plate, setPlate] = useState(bus.plate_number || bus.plate || bus.plateNumber || '');
  const [model, setModel] = useState(bus.model || '');
  const [capacity, setCapacity] = useState(String(bus.capacity || '30'));
  const [driverId, setDriverId] = useState<string | null>(bus.driverId || bus.driver_id || (bus.driver && bus.driver.id) || null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const selectableDrivers = React.useMemo(() => drivers.filter(d => !(String(d.id || '').startsWith('legacy-'))), [drivers]);

  const submit = async (e: any) => {
    e.preventDefault();
    setError('');
    if (!plate) { setError('Plate number is required'); return; }
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (driverId && !uuidRegex.test(driverId)) { setError('Invalid driver selected'); return; }
    setSaving(true);
    try {
      await updateBus(bus.id, { plate_number: plate, model, capacity: parseInt(capacity, 10) || 30, driver_id: driverId });
      if (onUpdated) onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating bus');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl p-6 w-[520px] shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Bus</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Plate number</label>
            <input value={plate} onChange={e => setPlate(e.target.value)} type="text" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Model</label>
            <input value={model} onChange={e => setModel(e.target.value)} type="text" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Capacity</label>
            <input value={capacity} onChange={e => setCapacity(e.target.value)} type="number" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Assign Driver</label>
            {selectableDrivers.length === 0 ? (
              <div className="text-sm text-gray-500">No assignable drivers available. Create a driver first.</div>
            ) : (
              <select value={driverId || ''} onChange={e => setDriverId(e.target.value || null)} className="w-full border rounded px-3 py-2">
                <option value="">-- Select driver --</option>
                {selectableDrivers.map(d => (<option key={d.id} value={d.id}>{d.name || d.full_name || d.email || d.id}</option>))}
              </select>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#0077B6] text-white rounded">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditDriverModal({ onClose, driver, onUpdated }: { onClose: () => void; driver: any; onUpdated?: () => void }) {
  const { updateDriver } = useDriversStore();
  const [fullName, setFullName] = useState(driver.name || driver.full_name || '');
  const [email, setEmail] = useState(driver.email || driver.email || '');
  const [phone, setPhone] = useState(driver.phone || driver.phone_number || '');
  const [license, setLicense] = useState(driver.license || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    setError('');
    if (!fullName || !license) { setError('Name and license number are required'); return; }
    setSaving(true);
    try {
      await updateDriver(driver.id, { name: fullName, email, phone, license });
      if (onUpdated) onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating driver');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl p-6 w-[520px] shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Driver</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Full name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} type="text" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="text" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">License number</label>
            <input value={license} onChange={e => setLicense(e.target.value)} type="text" className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#0077B6] text-white rounded">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}