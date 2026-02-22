// services/tracking.ts
import api from '../api';

export interface DriverLocation {
  id: string;
  plateNumber: string;
  model: string;
  driverName: string;
  status: 'active' | 'idle';
  latitude: number;
  longitude: number;
  speed: number;
  lastUpdate: string;
}

export const getLiveLocations = () => {
  return api.get<{ locations: DriverLocation[] }>('/tracking/company/live-locations');
};