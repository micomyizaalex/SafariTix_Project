import { useState, useEffect, CSSProperties } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../utils/supabase-client';
import {
  TrendingUp,
  DollarSign,
  Bus,
  Calendar,
  Users,
  AlertCircle,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  FileText,
  Phone,
  Ticket,
  BarChart3,
} from 'lucide-react';
import { DashboardStats, UpcomingTrip, BusLocation, NotificationItem, TopRoute } from './companyDashboard/types';
import { StatsGrid, UpcomingTrips, LiveFleetMap, RevenueTrends, TopRoutes, NotificationsPanel, QuickActions } from './companyDashboard';

export function CompanyHome() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Dashboard stats
  const [stats, setStats] = useState<DashboardStats>({
    activeBuses: 0,
    totalBuses: 0,
    tripsToday: 0,
    seatsBookedToday: 0,
    revenueToday: 0,
    revenueChange: 0,
    pendingApprovals: 0,
  });

  // Real data from API
  const [buses, setBuses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<UpcomingTrip[]>([]);
  
  // Mock data for features not yet implemented
  const [busLocations] = useState<BusLocation[]>([
    { id: '1', busNumber: 'RAB-101A', driver: 'John Kamau', route: 'Kigali → Butare', status: 'active', lat: -1.9441, lng: 30.0619, nextStop: 'Nyanza' },
    { id: '2', busNumber: 'RAB-202B', driver: 'Mary Uwase', route: 'Kigali → Gisenyi', status: 'delayed', lat: -1.6789, lng: 29.2561, nextStop: 'Ruhango' },
    { id: '3', busNumber: 'RAB-303C', driver: 'Peter Mugabe', route: 'Butare → Kigali', status: 'full', lat: -2.5971, lng: 29.7431, nextStop: 'Huye' },
  ]);

  const [notifications] = useState<NotificationItem[]>([
    { id: '1', type: 'urgent', title: 'Bus Breakdown', message: 'RAB-202B reported engine issue near Ruhango', time: '5 min ago' },
    { id: '2', type: 'warning', title: 'Low Driver Availability', message: 'Only 3 drivers available for tomorrow', time: '15 min ago' },
    { id: '3', type: 'info', title: 'Customer Inquiry', message: 'Route change request for tomorrow 8 AM trip', time: '1 hr ago' },
  ]);

  // Revenue trends (last 7 days)
  const [revenueData] = useState([
    { day: 'Mon', revenue: 450000, occupancy: 85 },
    { day: 'Tue', revenue: 520000, occupancy: 92 },
    { day: 'Wed', revenue: 380000, occupancy: 78 },
    { day: 'Thu', revenue: 610000, occupancy: 95 },
    { day: 'Fri', revenue: 580000, occupancy: 89 },
    { day: 'Sat', revenue: 720000, occupancy: 98 },
    { day: 'Sun', revenue: 490000, occupancy: 82 },
  ]);

  const [topRoutes] = useState<TopRoute[]>([
    { route: 'Kigali → Butare', revenue: 1250000, trips: 42, occupancy: 89 },
    { route: 'Kigali → Gisenyi', revenue: 980000, trips: 35, occupancy: 85 },
    { route: 'Butare → Huye', revenue: 520000, trips: 28, occupancy: 78 },
  ]);

  useEffect(() => {
    if (!accessToken) return;
    fetchDashboardData();
  }, [accessToken]);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      const [busesRes, schedulesRes, ticketsRes] = await Promise.all([
        fetch(`${API_URL}/company/buses`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`${API_URL}/company/schedules`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`${API_URL}/company/tickets`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      ]);

      let fetchedBuses: any[] = [];
      let fetchedSchedules: any[] = [];
      let fetchedTickets: any[] = [];

      if (busesRes.ok) {
        const data = await busesRes.json();
        fetchedBuses = data.buses || [];
        setBuses(fetchedBuses);
      }

      if (schedulesRes.ok) {
        const data = await schedulesRes.json();
        fetchedSchedules = data.schedules || [];
        setSchedules(fetchedSchedules);
      }

      if (ticketsRes.ok) {
        const data = await ticketsRes.json();
        fetchedTickets = data.tickets || [];
        setTickets(fetchedTickets);
      }

      // Calculate stats from fetched data
      calculateStatsFromData(fetchedBuses, fetchedSchedules, fetchedTickets);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStatsFromData(busesData: any[], schedulesData: any[], ticketsData: any[]) {
    // Active buses (status = 'active')
    const activeBusCount = busesData.filter(b => b.status === 'active').length;
    
    // Trips today
    const today = new Date().toISOString().split('T')[0];
    const todaySchedules = schedulesData.filter(s => s.scheduleDate?.startsWith(today));
    
    // Seats booked today
    const todayTickets = ticketsData.filter(t => {
      if (!t.bookedAt) return false;
      const bookedDate = new Date(t.bookedAt).toISOString().split('T')[0];
      return bookedDate === today && (t.status === 'CONFIRMED' || t.status === 'CHECKED_IN');
    });
    
    // Revenue today
    const todayRevenue = todayTickets.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0);
    
    // Yesterday revenue for comparison
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayTickets = ticketsData.filter(t => {
      if (!t.bookedAt) return false;
      const bookedDate = new Date(t.bookedAt).toISOString().split('T')[0];
      return bookedDate === yesterdayStr && (t.status === 'CONFIRMED' || t.status === 'CHECKED_IN');
    });
    const yesterdayRevenue = yesterdayTickets.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0);
    const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : 0;

    setStats({
      activeBuses: activeBusCount,
      totalBuses: busesData.length,
      tripsToday: todaySchedules.length,
      seatsBookedToday: todayTickets.length,
      revenueToday: todayRevenue,
      revenueChange: Math.round(revenueChange),
      pendingApprovals: 3, // Mock for now
    });

    // Prepare upcoming trips
    const upcoming = todaySchedules.slice(0, 10).map(s => ({
      id: s.id,
      route: `${s.routeFrom} → ${s.routeTo}`,
      busNumber: s.busPlateNumber || 'N/A',
      departure: s.departureTime ? new Date(s.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      status: s.status === 'completed' ? 'completed' : s.status === 'cancelled' ? 'cancelled' : 'on-time' as any,
      seatsLeft: s.seatsAvailable || 0,
      totalSeats: s.totalSeats || 30,
    }));
    setUpcomingTrips(upcoming);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0077B6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <UpcomingTrips upcomingTrips={upcomingTrips} />
          <LiveFleetMap busLocations={busLocations} />
        </div>

        <div className="space-y-6">
          <RevenueTrends revenueData={revenueData as any} />
          <TopRoutes topRoutes={topRoutes} />
          <NotificationsPanel notifications={notifications} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}