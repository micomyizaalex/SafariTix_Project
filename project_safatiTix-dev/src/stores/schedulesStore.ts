// stores/schedulesStore.ts
import { create } from 'zustand';
import { getSchedules, searchSchedules, Schedule } from '../services/schedules';

interface SchedulesState {
  popularRoutes: Schedule[];
  searchResults: Schedule[];
  loading: boolean;
  error: string | null;
  
  fetchSchedules: () => Promise<void>;
  search: (from: string, to: string, date?: string) => Promise<void>;
  clearSearch: () => void;
  clearError: () => void;
}

export const useSchedulesStore = create<SchedulesState>((set) => ({
  popularRoutes: [],
  searchResults: [],
  loading: false,
  error: null,

  fetchSchedules: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getSchedules() as any;
      set({ 
        popularRoutes: response.schedules || [], 
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch schedules', 
        loading: false 
      });
    }
  },

  search: async (from: string, to: string, date?: string) => {
    set({ loading: true, error: null });
    try {
      const results = await searchSchedules(from, to, date) as any;
      set({ 
        searchResults: Array.isArray(results) ? results : results.schedules || [], 
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Search failed', 
        searchResults: [],
        loading: false 
      });
    }
  },

  clearSearch: () => set({ searchResults: [] }),
  clearError: () => set({ error: null }),
}));