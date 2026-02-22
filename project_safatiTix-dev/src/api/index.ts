// api/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const apiError: ApiError = {
      message: (error.response?.data as any)?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      errors: (error.response?.data as any)?.errors,
    };

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return Promise.reject(apiError);
  }
);

export default api;