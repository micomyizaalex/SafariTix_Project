// stores/ticketsStore.ts
import { create } from 'zustand';
import { getTickets, cancelTicket, Ticket } from '../services/tickets';

interface TicketsState {
  upcomingTrips: Ticket[];
  recentBookings: Ticket[];
  loading: boolean;
  error: string | null;
  
  fetchTickets: () => Promise<void>;
  cancelTicket: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTicketsStore = create<TicketsState>((set, get) => ({
  upcomingTrips: [],
  recentBookings: [],
  loading: false,
  error: null,

  fetchTickets: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getTickets() as any;
      const tickets = response.tickets || [];
      
      const confirmed = tickets.filter((t: Ticket) => t.status === 'CONFIRMED');
      const recent = [...tickets].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      set({ 
        upcomingTrips: confirmed, 
        recentBookings: recent,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch tickets', 
        loading: false 
      });
    }
  },

  cancelTicket: async (id: string) => {
    try {
      await cancelTicket(id);
      // Refresh tickets after cancellation
      await get().fetchTickets();
    } catch (error: any) {
      set({ error: error.message || 'Failed to cancel ticket' });
    }
  },

  clearError: () => set({ error: null }),
}));