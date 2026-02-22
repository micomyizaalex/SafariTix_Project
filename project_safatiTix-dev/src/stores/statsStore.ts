// stores/statsStore.ts
import { create } from 'zustand';
import { getTickets } from '../services/tickets';
import { getSchedules } from '../services/schedules';

interface Stats {
  totalTrips: number;
  activeTickets: number;
  favoriteRoutes: number;
  rewardsPoints: number;
}

interface StatsState {
  stats: Stats;
  loading: boolean;
  error: string | null;
  
  fetchStats: () => Promise<void>;
  clearError: () => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: { totalTrips: 0, activeTickets: 0, favoriteRoutes: 0, rewardsPoints: 0 },
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const ticketsResponse = await getTickets() as any;
      const tickets = ticketsResponse.tickets || [];
      const confirmed = tickets.filter((t: any) => t.status === 'CONFIRMED');
      
      set({ 
        stats: {
          totalTrips: tickets.length,
          activeTickets: confirmed.length,
          favoriteRoutes: 0, // You can implement this later
          rewardsPoints: 0, // You can implement this later
        },
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch stats', 
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));