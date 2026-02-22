// stores/company/busesStore.ts
import { create } from 'zustand';
import api from '../api';

export interface Bus {
  id: string;
  plate_number?: string;
  plateNumber?: string;
  model?: string;
  capacity?: number;
  status?: string;
  driverId?: string;
  driver?: any;
}

interface BusesState {
  buses: Bus[];
  loading: boolean;
  error: string | null;
  
  fetchBuses: () => Promise<void>;
  addBus: (busData: any) => Promise<Bus>;
  updateBus: (id: string, busData: any) => Promise<Bus>;
  deleteBus: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useBusesStore = create<BusesState>((set, get) => ({
  buses: [],
  loading: false,
  error: null,

  fetchBuses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/company/buses') as any;
      set({ buses: response.buses || [], loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch buses', 
        loading: false 
      });
    }
  },

  addBus: async (busData: any) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/company/buses', busData) as any;
      const newBus = response.bus || response;
      set(state => ({ 
        buses: [...state.buses, newBus], 
        loading: false 
      }));
      return newBus;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to add bus', 
        loading: false 
      });
      throw error;
    }
  },

  updateBus: async (id: string, busData: any) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/company/buses/${id}`, busData) as any;
      const updatedBus = response.bus || response;
      set(state => ({
        buses: state.buses.map(b => b.id === id ? updatedBus : b),
        loading: false
      }));
      return updatedBus;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update bus', 
        loading: false 
      });
      throw error;
    }
  },

  deleteBus: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/company/buses/${id}`);
      set(state => ({
        buses: state.buses.filter(b => b.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete bus', 
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));