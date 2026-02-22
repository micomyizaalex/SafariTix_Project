// stores/trackingStore.ts
import { create } from 'zustand';
import { getLiveLocations, DriverLocation } from '../services/tracking';

interface TrackingState {
  driverLocations: DriverLocation[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  fetchLocations: () => Promise<void>;
  clearError: () => void;
}

export const useTrackingStore = create<TrackingState>((set) => ({
  driverLocations: [],
  loading: false,
  error: null,
  lastUpdated: null,

  fetchLocations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getLiveLocations() as any;
      set({ 
        driverLocations: response.locations || [], 
        loading: false,
        lastUpdated: new Date()
      });
    } catch (error: any) {
      // Don't show error for 404/403 - just empty locations
      if (error.status === 404 || error.status === 403) {
        set({ driverLocations: [], loading: false, lastUpdated: new Date() });
      } else {
        set({ 
          error: error.message || 'Failed to fetch locations', 
          loading: false 
        });
      }
    }
  },

  clearError: () => set({ error: null }),
}));