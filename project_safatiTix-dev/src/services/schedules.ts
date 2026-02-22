// services/schedules.ts
import api from '../api';

export interface Schedule {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  company: string;
  bus?: string;
  duration?: string;
}

export const getSchedules = () => {
  return api.get<{ schedules: Schedule[] }>('/schedules');
};

export const searchSchedules = (from: string, to: string, date?: string) => {
  const params = new URLSearchParams({ from, to });
  if (date) params.append('date', date);
  return api.get<Schedule[]>(`/schedules/search?${params}`);
};

export const getScheduleById = (id: string) => {
  return api.get<Schedule>(`/schedules/${id}`);
};