// services/notifications.ts
import api from '../api';

export interface Notification {
  id: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

export const getNotifications = () => {
  return api.get<Notification[]>('/notifications');
};

export const markAsRead = (id: string) => {
  return api.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
  return api.patch('/notifications/read-all');
};