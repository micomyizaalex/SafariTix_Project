// stores/notificationsStore.ts
import { create } from 'zustand';
import { getNotifications, markAsRead, markAllAsRead, Notification } from '../services/notifications';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const notifications = await getNotifications() as any;
      const list = Array.isArray(notifications) ? notifications : notifications.notifications || [];
      const unread = list.filter((n: Notification) => !n.read).length;
      
      set({ 
        notifications: list, 
        unreadCount: unread,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch notifications', 
        loading: false 
      });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await markAsRead(id);
      const notifications = get().notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      const unread = notifications.filter(n => !n.read).length;
      set({ notifications, unreadCount: unread });
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark as read' });
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllAsRead();
      const notifications = get().notifications.map(n => ({ ...n, read: true }));
      set({ notifications, unreadCount: 0 });
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark all as read' });
    }
  },

  clearError: () => set({ error: null }),
}));