// services/seats.ts
import api from '../api';

export interface Seat {
  id?: number | string;
  seat_number: string;
  row?: number;
  col?: number;
  side?: 'L' | 'R' | 'l' | 'r';
  state: 'AVAILABLE' | 'LOCKED' | 'BOOKED' | 'DRIVER';
  is_driver?: boolean;
  lock_expires_at?: string | null;
  price?: number;
}

export interface SeatsResponse {
  seats: Seat[];
  totalSeats?: number;
  capacity?: number;
}

export const getSeatsBySchedule = (scheduleId: string | number) => {
  return api.get<SeatsResponse>(`/seats/schedules/${scheduleId}`);
};

export const lockSeat = (scheduleId: string | number, seatNumber: string, price: number) => {
  return api.post(`/seats/schedules/${scheduleId}/lock`, {
    seat_number: seatNumber,
    price
  });
};

export const releaseSeat = (scheduleId: string | number, seatNumber: string) => {
  return api.post(`/seats/schedules/${scheduleId}/release`, {
    seat_number: seatNumber
  });
};