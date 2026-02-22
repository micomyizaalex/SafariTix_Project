// stores/company/driversStore.ts
import { create } from 'zustand';
import api from '../api';

export interface Driver {
  id: string;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  license?: string;
  available?: boolean;
  buses?: any[];
}

interface DriversState {
  drivers: Driver[];
  loading: boolean;
  error: string | null;
  
  fetchDrivers: () => Promise<void>;
  addDriver: (driverData: any) => Promise<{ driver: Driver; temporaryPassword?: string }>;
  updateDriver: (id: string, driverData: any) => Promise<Driver>;
  deleteDriver: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDriversStore = create<DriversState>((set, get) => ({
  drivers: [],
  loading: false,
  error: null,

  fetchDrivers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/company/drivers') as any;
      set({ drivers: response.drivers || [], loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch drivers', 
        loading: false 
      });
    }
  },

  addDriver: async (driverData: any) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/company/drivers', driverData) as any;
      const newDriver = response.driver || response;
      set(state => ({ 
        drivers: [...state.drivers, newDriver], 
        loading: false 
      }));
      return { driver: newDriver, temporaryPassword: response.temporaryPassword };
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to add driver', 
        loading: false 
      });
      throw error;
    }
  },

  updateDriver: async (id: string, driverData: any) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/company/drivers/${id}`, driverData) as any;
      const updatedDriver = response.driver || response;
      set(state => ({
        drivers: state.drivers.map(d => d.id === id ? updatedDriver : d),
        loading: false
      }));
      return updatedDriver;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update driver', 
        loading: false 
      });
      throw error;
    }
  },

  deleteDriver: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/company/drivers/${id}`);
      set(state => ({
        drivers: state.drivers.filter(d => d.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete driver', 
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));