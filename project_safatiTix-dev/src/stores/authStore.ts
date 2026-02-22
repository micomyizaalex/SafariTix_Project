// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser } from '../services/auth';

interface User {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  companyId?: string;
  companyName?: string;
  role?: string;
  homePath?: string;
  rewardsPoints?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
  updateUser: (userData: Partial<User>) => {
        set({ 
          user: { ...get().user, ...userData } as User 
        });
      },
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginApi(email, password) as any;
          const { token, user } = response;
          
          localStorage.setItem('token', token);
          set({ token, user, isLoading: false });
          return user
        } catch (error: any) {
          set({ 
            error: error.message || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (userData: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await registerApi(userData) as any;
          const { token, user } = response;
          
          localStorage.setItem('token', token);
          set({ token, user, isLoading: false });
          return user
        } catch (error: any) {
          set({ 
            error: error.message || 'Registration failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await logoutApi();
        } catch (error) {
          // ignore logout errors
        } finally {
          localStorage.removeItem('token');
          set({ 
            user: null, 
            token: null, 
            isLoading: false,
            error: null 
          });
        }
      },

      fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        set({ isLoading: true });
        try {
          const user = await getCurrentUser() as any;
          set({ user, token, isLoading: false });
        } catch (error: any) {
          localStorage.removeItem('token');
          set({ 
            user: null, 
            token: null, 
            isLoading: false,
            error: error.message || 'Failed to fetch user' 
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        token: state.token 
      }),
    }
  )
);

// Initialize auth state on app load
export const initAuth = () => {
  const { fetchUser } = useAuthStore.getState();
  fetchUser();
};