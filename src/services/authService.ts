import api from './api';
import type { User, LoginResponse } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/login/', {
      email,
      password,
    });
    return response.data;
  },

  async loginWithGoogle(token: string): Promise<LoginResponse & { is_new_user?: boolean }> {
    const response = await api.post<LoginResponse & { is_new_user?: boolean }>('/api/auth/google/', {
      token,
    });
    return response.data;
  },

  async register(data: {
    email: string;
    full_name: string;
    password: string;
    password_confirm: string;
  }): Promise<{ id: number; email: string; full_name: string; message: string }> {
    const response = await api.post('/api/register/', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/api/me/');
    return response.data;
  },

  setTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },
};