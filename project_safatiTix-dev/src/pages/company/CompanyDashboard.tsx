import React, { useState } from 'react';
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

// SafariTix Brand Colors
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

// Sample Data
const revenueData = [
  { month: 'Jan', revenue: 450000, tickets: 1200, occupancy: 85 },
  { month: 'Feb', revenue: 520000, tickets: 1450, occupancy: 92 },
  { month: 'Mar', revenue: 480000, tickets: 1350, occupancy: 88 },
  { month: 'Apr', revenue: 610000, tickets: 1600, occupancy: 95 },
  { month: 'May', revenue: 580000, tickets: 1520, occupancy: 91 },
  { month: 'Jun', revenue: 720000, tickets: 1850, occupancy: 97 },
];

const routePerformance = [
  { route: 'Kigali → Gisenyi', trips: 45, revenue: 1250000, occupancy: 92 },
  { route: 'Kigali → Butare', trips: 38, revenue: 980000, occupancy: 88 },
  { route: 'Kigali → Musanze', trips: 32, revenue: 720000, occupancy: 85 },
  { route: 'Butare → Huye', trips: 28, revenue: 520000, occupancy: 78 },
];

const busStatusData = [
  { name: 'Active', value: 24, color: COLORS.success },
  { name: 'In Maintenance', value: 3, color: COLORS.secondary },
  { name: 'Inactive', value: 2, color: COLORS.danger },
];

const recentTickets = [
  { id: 'TKT-1245', passenger: 'John Kamau', route: 'Kigali → Gisenyi', date: '2024-02-12', amount: 7500, status: 'confirmed' },
  { id: 'TKT-1244', passenger: 'Mary Uwase', route: 'Kigali → Butare', date: '2024-02-12', amount: 3500, status: 'confirmed' },
  { id: 'TKT-1243', passenger: 'Peter Mugabe', route: 'Kigali → Musanze', date: '2024-02-12', amount: 4500, status: 'cancelled' },
  { id: 'TKT-1242', passenger: 'Alice Nzabonimana', route: 'Butare → Huye', date: '2024-02-11', amount: 2800, status: 'confirmed' },
];

const activeBuses = [
  { id: 'RAB-101A', driver: 'John Kamau', route: 'Kigali → Gisenyi', status: 'on-route', eta: '30 min', occupancy: 92 },
  { id: 'RAB-202B', driver: 'Mary Uwase', route: 'Kigali → Butare', status: 'on-route', eta: '45 min', occupancy: 88 },
  { id: 'RAB-303C', driver: 'Peter Mugabe', route: 'Kigali → Musanze', status: 'boarding', eta: '15 min', occupancy: 75 },
];

const notifications = [
  { id: 1, type: 'alert', message: 'Bus RAB-202B scheduled for maintenance today', time: '10 min ago' },
  { id: 2, type: 'success', message: '3 new ticket bookings for Kigali → Gisenyi route', time: '25 min ago' },
  { id: 3, type: 'info', message: 'Driver James Mwangi completed trip RAB-101A', time: '1 hr ago' },
];

export default function CompanyDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Read logged-in user (stored by login/signup) from localStorage
  let storedUser = null;
  try {
    storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  } catch (e) {
    storedUser = null;
  }

  const displayName = storedUser ? (storedUser.full_name || storedUser.name || storedUser.fullName || storedUser.email) : 'Admin User';
  const displayRole = storedUser
    ? (storedUser.role === 'company_admin' ? 'Company Admin' : (storedUser.role || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    : 'Company Admin';

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

  // KPI state from backend
  const [kpis, setKpis] = React.useState({
    totalBuses: 0,
    activeBuses: 0,
    activeRoutes: 0,
    activeDrivers: 0,
    todaysRevenue: 0,
    todaysTickets: 0
  });

  React.useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

    async function fetchKpis() {
      try {
        const [busesRes, driversRes, schedulesRes, ticketsRes] = await Promise.all([
          fetch('/api/companies/buses', { headers }),
          fetch('/api/companies/drivers', { headers }),
          fetch('/api/companies/schedules', { headers }),
          fetch('/api/companies/tickets', { headers })
        ]);

        const busesJson = busesRes.ok ? await busesRes.json() : { buses: [] };
        const driversJson = driversRes.ok ? await driversRes.json() : { drivers: [] };
        const schedulesJson = schedulesRes.ok ? await schedulesRes.json() : { schedules: [] };
        const ticketsJson = ticketsRes.ok ? await ticketsRes.json() : { tickets: [] };

        const buses = busesJson.buses || [];
        const drivers = driversJson.drivers || [];
        const schedules = schedulesJson.schedules || [];
        const tickets = ticketsJson.tickets || [];

        const totalBuses = buses.length;
        const activeBuses = buses.filter(b => b.status === 'active').length;

        // Count unique routes from schedules
        const routeSet = new Set();
        schedules.forEach(s => routeSet.add(`${s.routeFrom || ''}::${s.routeTo || ''}`));
        const activeRoutes = routeSet.size;

        const activeDrivers = drivers.length;

        // Today's revenue and tickets (local date)
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let todaysRevenue = 0;
        let todaysTickets = 0;
        tickets.forEach(t => {
          const dt = t.bookedAt ? new Date(t.bookedAt) : (t.bookedAt || t.booked_at ? new Date(t.booked_at) : null);
          if (!dt) return;
          if (dt >= today && dt < tomorrow) {
            todaysRevenue += parseFloat(t.price || 0);
            todaysTickets += 1;
          }
        });

        setKpis({ totalBuses, activeBuses, activeRoutes, activeDrivers, todaysRevenue, todaysTickets });
      } catch (err) {
        console.warn('Failed to load KPI data', err);
      }
    }

    fetchKpis();
  }, []);

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
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 font-medium text-sm">
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
          {activeSection === 'dashboard' && <DashboardOverview kpis={kpis} />}
          {activeSection === 'buses' && <BusesSection />}
          {activeSection === 'drivers' && <DriversSection />}
          {activeSection === 'schedules' && <SchedulesSection />}
          {activeSection === 'tickets' && <TicketsSection />}
          {activeSection === 'revenue' && <RevenueSection />}
          {activeSection === 'tracking' && <TrackingSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview({ kpis }: { kpis: any }) {
  kpis = kpis || { totalBuses: 0, activeBuses: 0, activeRoutes: 0, activeDrivers: 0, todaysRevenue: 0, todaysTickets: 0 };
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
                {busStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {busStatusData.map((item, index) => (
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

      {/* Recent Activity */}
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
            {activeBuses.map((bus) => (
              <div key={bus.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-xl flex items-center justify-center">
                    <Bus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{bus.id}</div>
                    <div className="text-sm text-gray-600">{bus.driver}</div>
                    <div className="text-xs text-gray-500 mt-1">{bus.route}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#27AE60]">{bus.occupancy}%</div>
                  <div className="text-xs text-gray-500 mt-1">ETA: {bus.eta}</div>
                </div>
              </div>
            ))}
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
            {recentTickets.map((ticket) => (
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
                  <div className="text-sm font-bold text-gray-900">RWF {ticket.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">{ticket.date}</div>
                </div>
              </div>
            ))}
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
function KPICard({ title, value, change, trend, icon: Icon, color, subtitle }) {
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

// Placeholder sections - to be implemented
function BusesSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-['Montserrat'] font-bold text-[#2B2D42] mb-4">Buses Management</h2>
      <p className="text-gray-600">Bus fleet management interface coming soon...</p>
    </div>
  );
}

function DriversSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-['Montserrat'] font-bold text-[#2B2D42] mb-4">Drivers Management</h2>
      <p className="text-gray-600">Driver management interface coming soon...</p>
    </div>
  );
}

function SchedulesSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-['Montserrat'] font-bold text-[#2B2D42] mb-4">Schedules Management</h2>
      <p className="text-gray-600">Schedule management interface coming soon...</p>
    </div>
  );
}

function TicketsSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-['Montserrat'] font-bold text-[#2B2D42] mb-4">Tickets Management</h2>
      <p className="text-gray-600">Ticket management interface coming soon...</p>
    </div>
  );
}

function RevenueSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-['Montserrat'] font-bold text-[#2B2D42] mb-4">Revenue & Reports</h2>
      <p className="text-gray-600">Revenue analytics interface coming soon...</p>
    </div>
  );
}

function TrackingSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-['Montserrat'] font-bold text-[#2B2D42] mb-4">Live Fleet Tracking</h2>
      <p className="text-gray-600">Live tracking map interface coming soon...</p>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-['Montserrat'] font-bold text-[#2B2D42] mb-4">Settings</h2>
      <p className="text-gray-600">Settings interface coming soon...</p>
    </div>
  );
}