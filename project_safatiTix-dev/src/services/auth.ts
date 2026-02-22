// services/auth.ts
import api from '../api';

export const login = (email: string, password: string) => {
  return api.post('/auth/login', { email, password });
};

export const register = (userData: any) => {
  return api.post('/auth/register', userData);
};

export const logout = () => {
  return api.post('/auth/logout');
};

export const getCurrentUser = () => {
  return api.get('/auth/me');
};