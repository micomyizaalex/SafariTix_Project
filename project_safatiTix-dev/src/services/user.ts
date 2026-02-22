// services/user.ts
import api from '../api';

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export const updateProfile = (data: Partial<UserProfile>) => {
  return api.put('/auth/me', data);
};