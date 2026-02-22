// stores/company/kpiStore.ts
import { create } from 'zustand';
import api from '../api';

interface KPIState {
  totalBuses: number;
  activeBuses: number;
  activeRoutes: number;
  activeDrivers: number;
  todaysRevenue: number;
  todaysTickets: number;
  activeTripsCount: number;
  activeBusesList: any[];
  revenueData: any[];
  busStatusData: any[];
  recentTickets: any[];
  loading: boolean;
  error: string | null;
  
  fetchDashboardData: () => Promise<void>;
  clearError: () => void;
}

export const useKPIStore = create<KPIState>((set) => ({
  totalBuses: 0,
  activeBuses: 0,
  activeRoutes: 0,
  activeDrivers: 0,
  todaysRevenue: 0,
  todaysTickets: 0,
  activeTripsCount: 0,
  activeBusesList: [],
  revenueData: [],
  busStatusData: [],
  recentTickets: [],
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const [busesRes, driversRes, schedulesRes, ticketsRes, activeTripsRes] = await Promise.all([
        api.get('/company/buses'),
        api.get('/company/drivers'),
        api.get('/company/schedules'),
        api.get('/company/tickets'),
        api.get('/company/active-trips')
      ]);

      const buses = (busesRes as any).buses || [];
      const drivers = (driversRes as any).drivers || [];
      const schedules = (schedulesRes as any).schedules || [];
      const tickets = (ticketsRes as any).tickets || [];
      const activeTrips = (activeTripsRes as any).activeTrips || [];

      const totalBuses = buses.length;
      const activeBuses = activeTrips.length;

      // Count unique routes
      const routeSet = new Set();
      schedules.forEach((s: any) => routeSet.add(`${s.routeFrom || ''}::${s.routeTo || ''}`));
      const activeRoutes = routeSet.size;

      const activeDrivers = drivers.length;

      // Today's revenue
      const today = new Date().toISOString().split('T')[0];
      let todaysRevenue = 0;
      let todaysTickets = 0;

      schedules.forEach((s: any) => {
        const scheduleDate = s.scheduleDate || s.date || s.schedule_date;
        if (scheduleDate && scheduleDate.startsWith(today)) {
          const totalSeats = s.totalSeats || s.total_seats || 0;
          const availableSeats = (s.seatsAvailable != null ? s.seatsAvailable : s.seats_available) || 0;
          const soldSeats = totalSeats - availableSeats;
          const price = s.price || 0;
          todaysRevenue += soldSeats * price;
          todaysTickets += soldSeats;
        }
      });

      // Bus status data
      const statusCounts = { active: 0, maintenance: 0, inactive: 0 };
      buses.forEach((b: any) => {
        const status = String(b.status || '').toLowerCase();
        if (status === 'active') statusCounts.active++;
        else if (status.includes('maintenance') || status === 'maintenance') statusCounts.maintenance++;
        else statusCounts.inactive++;
      });

      const busStatusData = [
        { name: 'Active', value: statusCounts.active, color: '#27AE60' },
        { name: 'In Maintenance', value: statusCounts.maintenance, color: '#F4A261' },
        { name: 'Inactive', value: statusCounts.inactive, color: '#E63946' },
      ];

      // Recent tickets
      const recentTickets = [...tickets]
        .sort((a, b) => {
          const dateA = new Date(a.bookedAt || a.booked_at || a.created_at || 0);
          const dateB = new Date(b.bookedAt || b.booked_at || b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5)
        .map((t: any) => ({
          id: t.bookingReference || t.booking_reference || t.id || '—',
          passenger: t.passengerName || t.passenger_name || (t.user && (t.user.full_name || t.user.name)) || '—',
          route: (t.routeFrom || t.route_from || '—') + ' → ' + (t.routeTo || t.route_to || '—'),
          date: t.bookedAt || t.booked_at || t.created_at ? new Date(t.bookedAt || t.booked_at || t.created_at).toISOString().split('T')[0] : '—',
          amount: parseFloat(t.price || t.totalPrice || t.total_price || 0),
          status: t.status || 'confirmed'
        }));

      // Active buses list
      const activeBusesList = activeTrips.map((trip: any) => ({
        id: trip.busPlate,
        plate: trip.busPlate,
        driver: trip.driverName || '—',
        route: `${trip.routeFrom || ''} → ${trip.routeTo || ''}`,
        occupancy: '—',
        eta: trip.tripStartTime ? `${Math.floor((Date.now() - new Date(trip.tripStartTime).getTime()) / 60000)} min ago` : '—',
        status: 'in_progress'
      }));

      // Revenue chart data
      const monthlyRevenue = new Map();
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toISOString().slice(0, 7);
        const monthName = d.toLocaleString('default', { month: 'short' });
        last6Months.push({ key, monthName });
        monthlyRevenue.set(key, { revenue: 0, tickets: 0 });
      }

      schedules.forEach((s: any) => {
        const scheduleDate = s.scheduleDate || s.date || s.schedule_date;
        if (scheduleDate) {
          const monthKey = scheduleDate.slice(0, 7);
          if (monthlyRevenue.has(monthKey)) {
            const totalSeats = s.totalSeats || s.total_seats || 0;
            const availableSeats = (s.seatsAvailable != null ? s.seatsAvailable : s.seats_available) || 0;
            const soldSeats = totalSeats - availableSeats;
            const price = s.price || 0;
            const current = monthlyRevenue.get(monthKey);
            current.revenue += soldSeats * price;
            current.tickets += soldSeats;
          }
        }
      });

      const revenueData = last6Months.map(m => ({
        month: m.monthName,
        revenue: monthlyRevenue.get(m.key)?.revenue || 0,
        tickets: monthlyRevenue.get(m.key)?.tickets || 0
      }));

      set({
        totalBuses,
        activeBuses,
        activeRoutes,
        activeDrivers,
        todaysRevenue,
        todaysTickets,
        activeTripsCount: activeTrips.length,
        activeBusesList,
        busStatusData,
        recentTickets,
        revenueData,
        loading: false
      });

    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch dashboard data', 
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));