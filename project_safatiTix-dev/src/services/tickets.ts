// services/tickets.ts
import api from '../api';

export interface Ticket {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seat?: string;
  bus?: string;
  price: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'CHECKED_IN';
  qrCode?: string;
  qrData?: string;
  reference?: string;
  createdAt: string;
  passengerName?: string;
  passengerEmail?: string;
  passengerPhone?: string;
}

export const getTickets = () => {
  return api.get<{ tickets: Ticket[] }>('/tickets');
};

export const getTicketById = (id: string) => {
  return api.get<Ticket>(`/tickets/${id}`);
};

export const cancelTicket = (id: string) => {
  return api.patch(`/tickets/${id}/cancel`);
};


