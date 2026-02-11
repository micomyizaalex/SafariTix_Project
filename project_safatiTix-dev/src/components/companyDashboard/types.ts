export interface DashboardStats {
  activeBuses: number;
  totalBuses: number;
  tripsToday: number;
  seatsBookedToday: number;
  revenueToday: number;
  revenueChange: number;
  pendingApprovals: number;
}

export interface UpcomingTrip {
  id: string;
  route: string;
  busNumber: string;
  departure: string;
  status: 'on-time' | 'delayed' | 'cancelled' | 'completed';
  seatsLeft: number;
  totalSeats: number;
}

export interface BusLocation {
  id: string;
  busNumber: string;
  driver: string;
  route: string;
  status: 'active' | 'delayed' | 'full' | 'empty';
  lat: number;
  lng: number;
  nextStop: string;
}

export interface NotificationItem {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
}

export interface TopRoute {
  route: string;
  revenue: number;
  trips: number;
  occupancy: number;
}
