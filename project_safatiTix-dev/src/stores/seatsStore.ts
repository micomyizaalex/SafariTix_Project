// stores/seatsStore.ts
import { create } from 'zustand';
import { getSeatsBySchedule, lockSeat, Seat } from '../services/seats';

interface SeatsState {
  seats: Seat[];
  loading: boolean;
  error: string | null;
  locking: boolean;
  
  fetchSeats: (scheduleId: string) => Promise<void>;
  lockSeats: (scheduleId: string, seatNumbers: string[], price: number, userId?: string) => Promise<boolean>;
  clearError: () => void;
}

export const useSeatsStore = create<SeatsState>((set, get) => ({
  seats: [],
  loading: false,
  error: null,
  locking: false,

  fetchSeats: async (scheduleId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getSeatsBySchedule(scheduleId) as any;
      set({ 
        seats: response.seats || [], 
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load seats', 
        loading: false 
      });
    }
  },

  lockSeats: async (scheduleId: string, seatNumbers: string[], price: number, userId?: string) => {
    set({ locking: true, error: null });
    try {
      for (const seatNum of seatNumbers) {
        await lockSeat(scheduleId, seatNum, price);
      }
      set({ locking: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to lock seats', 
        locking: false 
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));