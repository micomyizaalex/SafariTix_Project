import React, { useState, useEffect } from 'react';
import {
  Home, Bus, Calendar, Users, MapPin, Bell, User, LogOut, Menu, X,
  Clock, DollarSign, CheckCircle, Navigation, Scan, QrCode, ChevronRight,
  Search, TrendingUp, AlertCircle, Package, Phone, Mail, Settings,
  ArrowRight, Star, Award, Activity,
} from 'lucide-react';

// ==================== SAMPLE DATA ====================
const driverData = {
  name: 'John Kamau',
  id: 'DRV-001',
  rating: 4.8,
  totalTrips: 156,
  photo: null,
};

const todayStats = {
  tripsCompleted: 2,
  activeTrips: 1,
  totalPassengers: 53,
  revenue: 397500,
};

const activeTrip = {
  id: 'TRIP-001',
  route: 'Kigali → Gisenyi',
  bus: 'RAB-101A',
  departure: '08:00 AM',
  arrival: '11:30 AM',
  progress: 65,
  eta: '45 min',
  passengers: 24,
  totalSeats: 29,
};

const upcomingTrips = [
  { id: 1, route: 'Gisenyi → Kigali', time: '2:00 PM', bus: 'RAB-101A', passengers: 18, total: 29 },
  { id: 2, route: 'Kigali → Butare', time: '4:30 PM', bus: 'RAB-202B', passengers: 22, total: 29 },
];

const recentPassengers = [
  { id: 1, name: 'Alice Nzabonimana', seat: '5', ticket: 'TKT-1245', checked: true, time: '07:45 AM' },
  { id: 2, name: 'Peter Mugabe', seat: '8', ticket: 'TKT-1246', checked: true, time: '07:48 AM' },
  { id: 3, name: 'Mary Uwase', seat: '12', ticket: 'TKT-1247', checked: false, time: null },
  { id: 4, name: 'James Habimana', seat: '15', ticket: 'TKT-1248', checked: true, time: '07:52 AM' },
  { id: 5, name: 'Grace Mukamana', seat: '18', ticket: 'TKT-1249', checked: false, time: null },
];

// ==================== MAIN COMPONENT ====================
import { useAuth } from '../../components/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DriverDashboard() {
  const { accessToken, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [showScanner, setShowScanner] = useState(false);
  const [driverName, setDriverName] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [driverContext, setDriverContext] = useState(null);
  const [companyName, setCompanyName] = useState(null);

  useEffect(() => {
    if (!accessToken) return;
    let mounted = true;
    const fetchData = async () => {
      try {
        const [meRes, schedRes, ctxRes, compRes] = await Promise.all([
          fetch('/api/driver/me', { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch('/api/driver/today-schedule', { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch('/api/driver/context', { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch('/api/company', { headers: { Authorization: `Bearer ${accessToken}` } }),
        ]);

        if (meRes.ok) {
          const j = await meRes.json();
          if (mounted) setDriverName(j.user?.full_name || j.user?.name || j.driver?.name || j.name || null);
        }

        if (schedRes.ok) {
          const j2 = await schedRes.json();
          if (mounted) setSchedules(j2.schedules || j2.data || []);
        }

        if (ctxRes && ctxRes.ok) {
          const j3 = await ctxRes.json();
          if (mounted) setDriverContext(j3.driver || null);
        }

        if (compRes && compRes.ok) {
          const jc = await compRes.json();
          if (mounted) setCompanyName(jc.company?.name || jc.name || null);
        }
      } catch (e) {
        // ignore
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      
      {/* ========== SIDEBAR ========== */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200
        transition-transform duration-300 ease-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0077B6] to-[#00A8E8] flex items-center justify-center shadow-lg">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-black text-lg text-slate-900">SafariTix</div>
              <div className="text-[10px] text-slate-500 font-medium -mt-1">DRIVER PORTAL</div>
            </div>
          </div>
        </div>

        {/* Driver Profile Card */}
        <div className="p-4 border-b border-slate-200">
          <div className="bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate">{(driverContext?.name || driverName || user?.full_name || driverData.name)}</div>
                <div className="text-xs text-white/70">{(companyName || driverContext?.id || user?.companyName || driverData.id)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-white/90">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                <span className="font-bold">{driverData.rating}</span>
              </div>
              <div className="h-3 w-px bg-white/30"></div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span className="font-bold">{driverData.totalTrips} trips</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {[
            { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
            { id: 'trips', icon: Calendar, label: 'My Trips', badge: '3' },
            { id: 'passengers', icon: Users, label: 'Passengers', badge: null },
            { id: 'tracking', icon: MapPin, label: 'Live Tracking', badge: null },
            { id: 'profile', icon: User, label: 'Profile', badge: null },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 text-sm font-semibold
                ${activeView === item.id 
                  ? 'bg-[#0077B6] text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className={`
                  px-2 py-0.5 rounded-full text-[10px] font-bold
                  ${activeView === item.id ? 'bg-white/20 text-white' : 'bg-[#0077B6] text-white'}
                `}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <button onClick={() => { signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-semibold">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ========== MOBILE HEADER ========== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100">
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0077B6] to-[#00A8E8] flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-slate-900">SafariTix</span>
          </div>
          <button className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100">
            <Bell className="w-5 h-5 text-slate-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ========== MAIN CONTENT ========== */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-6 xl:p-8">
          {activeView === 'dashboard' && <DashboardView setShowScanner={setShowScanner} driverName={driverName} schedules={schedules} user={user} />}
          {activeView === 'trips' && <TripsView />}
          {activeView === 'passengers' && <PassengersView setShowScanner={setShowScanner} />}
          {activeView === 'tracking' && <TrackingView />}
          {activeView === 'profile' && <ProfileView />}
        </div>
      </main>

      {/* ========== SCANNER MODAL ========== */}
      {showScanner && <ScannerModal onClose={() => setShowScanner(false)} />}
    </div>
  );
}

// ==================== DASHBOARD VIEW ====================
function DashboardView({ setShowScanner, driverName, schedules, user }) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 mb-1">
            Good morning, {((driverName || user?.full_name || user?.name || driverData.name) + '').split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-600">Here's your schedule for today</p>
          {schedules && schedules.length > 0 && (
            <div className="mt-4 grid gap-3">
              {schedules.map((s, idx) => {
                const title = s.route || s.name || `${s.from || s.origin || s.start || ''} → ${s.to || s.destination || s.end || ''}`.replace(/(^\s+|\s+$|\s+→\s+$)/g, '')|| 'Schedule';
                const time = s.departure_time || s.time || s.start_time || (s.schedule_date ? new Date(s.schedule_date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '—');
                const bus = s.bus_registration || s.bus_reg || s.bus || s.busId || '';
                return (
                  <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-900">{title}</div>
                      {bus && <div className="text-xs text-slate-500">{bus}</div>}
                    </div>
                    <div className="text-sm font-bold text-[#0077B6]">{time}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <button 
          onClick={() => setShowScanner(true)}
          className="w-full lg:w-auto bg-gradient-to-r from-[#0077B6] to-[#00A8E8] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <Scan className="w-5 h-5" />
          Scan Ticket
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle} label="Completed" value={todayStats.tripsCompleted} color="#27AE60" />
        <StatCard icon={Activity} label="Active Trips" value={todayStats.activeTrips} color="#0077B6" />
        <StatCard icon={Users} label="Passengers" value={todayStats.totalPassengers} color="#F4A261" />
        <StatCard icon={DollarSign} label="Revenue" value={`${(todayStats.revenue / 1000).toFixed(0)}K`} color="#2B2D42" />
      </div>

      {/* Active Trip - Hero Section */}
      {activeTrip && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0077B6] via-[#0088CC] to-[#00A8E8] rounded-2xl p-6 lg:p-8 text-white shadow-2xl">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-3">
                  <Activity className="w-3 h-3 animate-pulse" />
                  ACTIVE TRIP
                </div>
                <h2 className="text-2xl lg:text-3xl font-black mb-2">{activeTrip.route}</h2>
                <p className="text-white/80 text-sm">{activeTrip.bus} • {activeTrip.departure}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/70 mb-1">ETA</div>
                <div className="text-3xl font-black">{activeTrip.eta}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Trip Progress</span>
                <span className="font-bold">{activeTrip.progress}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${activeTrip.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="text-xs text-white/70 mb-1">Passengers</div>
                <div className="text-2xl font-black">{activeTrip.passengers}/{activeTrip.totalSeats}</div>
              </div>
              <button className="bg-white text-[#0077B6] rounded-xl p-4 font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                End Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Upcoming Trips */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-slate-900">Upcoming Trips</h3>
            <button className="text-[#0077B6] font-bold text-sm hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingTrips.map(trip => (
              <div key={trip.id} className="group border-2 border-slate-100 hover:border-[#0077B6] rounded-xl p-4 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-[#0077B6] transition-colors">{trip.route}</div>
                    <div className="text-sm text-slate-500">{trip.bus}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#0077B6]">{trip.time}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    <span className="font-semibold">{trip.passengers}/{trip.total}</span> seats
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-1.5 h-4 rounded-full ${i < Math.floor((trip.passengers / trip.total) * 5) ? 'bg-[#0077B6]' : 'bg-slate-200'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-slate-900">Recent Check-ins</h3>
            <button 
              onClick={() => setShowScanner(true)}
              className="text-[#0077B6] font-bold text-sm hover:underline flex items-center gap-1"
            >
              Scan <QrCode className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {recentPassengers.slice(0, 5).map(passenger => (
              <div key={passenger.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0077B6] to-[#00A8E8] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {passenger.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">{passenger.name}</div>
                  <div className="text-xs text-slate-500">Seat {passenger.seat}</div>
                </div>
                {passenger.checked ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== STAT CARD ====================
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-all group">
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <div className="text-xs text-slate-600 font-medium mt-1">{label}</div>
    </div>
  );
}

// ==================== TRIPS VIEW ====================
function TripsView() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900">My Trips</h1>
        <button className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 hover:border-[#0077B6] transition-all text-sm font-semibold">
          <Calendar className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="space-y-4">
        {upcomingTrips.map(trip => (
          <div key={trip.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0077B6] to-[#00A8E8] flex items-center justify-center shadow-lg">
                  <Bus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 mb-1">{trip.route}</div>
                  <div className="text-sm text-slate-600">{trip.bus}</div>
                </div>
              </div>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">UPCOMING</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Time</div>
                <div className="font-bold text-slate-900">{trip.time}</div>
              </div>
              <div className="text-center bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Passengers</div>
                <div className="font-bold text-[#0077B6]">{trip.passengers}/{trip.total}</div>
              </div>
              <div className="text-center bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Occupancy</div>
                <div className="font-bold text-slate-900">{Math.round((trip.passengers / trip.total) * 100)}%</div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-[#27AE60] to-[#229954] text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Navigation className="w-5 h-5" />
              Start Trip
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== PASSENGERS VIEW ====================
function PassengersView({ setShowScanner }) {
  const [search, setSearch] = useState('');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900">Passengers</h1>
        <button 
          onClick={() => setShowScanner(true)}
          className="bg-gradient-to-r from-[#0077B6] to-[#00A8E8] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Scan className="w-5 h-5" />
          Scan
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border-2 border-slate-200 focus-within:border-[#0077B6] transition-all p-3 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search passengers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none text-sm font-medium"
        />
      </div>

      {/* Passenger List */}
      <div className="space-y-3">
        {recentPassengers.map(passenger => (
          <div key={passenger.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0077B6] to-[#00A8E8] flex items-center justify-center text-white font-bold">
                {passenger.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900">{passenger.name}</div>
                <div className="text-sm text-slate-600">{passenger.ticket}</div>
              </div>
              {passenger.checked ? (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Checked
                </div>
              ) : (
                <button className="bg-[#0077B6] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#005F8E] transition-all">
                  Check In
                </button>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <strong className="text-slate-900">Seat:</strong> #{passenger.seat}
              </span>
              {passenger.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {passenger.time}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== TRACKING VIEW ====================
function TrackingView() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-black text-slate-900">Live Tracking</h1>
      
      <div className="bg-white rounded-2xl border border-slate-200 p-8 aspect-video flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-[#0077B6] mx-auto mb-4" />
          <div className="text-xl font-bold text-slate-900 mb-2">GPS Map View</div>
          <p className="text-slate-600">Live tracking coming soon</p>
        </div>
      </div>
    </div>
  );
}

// ==================== PROFILE VIEW ====================
function ProfileView() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-black text-slate-900">Profile</h1>
      
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-[#0077B6] to-[#00A8E8] rounded-2xl p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-4 border-white/30">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-black mb-1">{(driverContext?.name || driverName || user?.full_name || driverData.name)}</div>
            <div className="text-white/80 text-sm">{(companyName || driverContext?.id || user?.companyName || driverData.id)}</div>
          </div>
          <button className="bg-white/20 border-2 border-white/30 text-white px-6 py-2 rounded-lg font-bold hover:bg-white/30 transition-all">
            Edit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-black text-slate-900">{driverData.rating}</div>
          <div className="text-sm text-slate-600">Rating</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <Package className="w-8 h-8 text-[#0077B6] mx-auto mb-2" />
          <div className="text-2xl font-black text-slate-900">{driverData.totalTrips}</div>
          <div className="text-sm text-slate-600">Total Trips</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-black text-slate-900">98%</div>
          <div className="text-sm text-slate-600">On-Time Rate</div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-black text-slate-900 mb-4">Contact Information</h3>
        <div className="space-y-3">
          {[
            { icon: Phone, label: 'Phone', value: '+250 788 123 456' },
            { icon: Mail, label: 'Email', value: 'john.kamau@safaritix.com' },
            { icon: MapPin, label: 'Location', value: 'Kigali, Rwanda' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-[#0077B6]/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-[#0077B6]" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                <div className="font-semibold text-slate-900">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== SCANNER MODAL ====================
function ScannerModal({ onClose }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      setResult({ success: true, passenger: recentPassengers[2] });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all">
          <X className="w-5 h-5 text-slate-700" />
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0077B6] to-[#00A8E8] flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Scan className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            {scanning ? 'Scanning...' : result ? 'Verified!' : 'Scan QR Code'}
          </h3>
          <p className="text-slate-600 text-sm">
            {scanning ? 'Hold the code steady' : result ? 'Ticket is valid' : 'Position QR code in frame'}
          </p>
        </div>

        <div className={`rounded-2xl p-8 mb-6 border-4 ${
          scanning ? 'bg-blue-50 border-blue-300 animate-pulse' :
          result ? 'bg-green-50 border-green-300' :
          'bg-slate-50 border-slate-300 border-dashed'
        }`}>
          <div className="w-48 h-48 mx-auto flex items-center justify-center">
            {scanning ? (
              <div className="relative">
                <div className="w-32 h-32 border-4 border-[#0077B6] border-t-transparent rounded-full animate-spin"></div>
                <QrCode className="w-16 h-16 text-[#0077B6] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            ) : result ? (
              <div className="text-center">
                <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-3" />
                <div className="font-bold text-slate-900">{result.passenger.name}</div>
                <div className="text-sm text-slate-600">Seat {result.passenger.seat}</div>
              </div>
            ) : (
              <QrCode className="w-20 h-20 text-slate-400" />
            )}
          </div>
        </div>

        {result ? (
          <div className="space-y-3">
            <button onClick={onClose} className="w-full bg-gradient-to-r from-[#27AE60] to-[#229954] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Confirm Check-In
            </button>
            <button onClick={handleScan} className="w-full bg-slate-100 text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">
              Scan Another
            </button>
          </div>
        ) : (
          <button onClick={handleScan} className="w-full bg-gradient-to-r from-[#0077B6] to-[#00A8E8] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <Scan className="w-5 h-5" />
            Start Scanning
          </button>
        )}
      </div>
    </div>
  );
}