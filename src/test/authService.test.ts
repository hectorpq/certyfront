import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '@/services/authService';
import api from '@/services/api';

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockApi = api as { post: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn> };

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('setTokens / getAccessToken / clearTokens', () => {
    it('stores tokens in localStorage', () => {
      authService.setTokens('access123', 'refresh456');
      expect(localStorage.getItem('access_token')).toBe('access123');
      expect(localStorage.getItem('refresh_token')).toBe('refresh456');
    });

    it('getAccessToken returns stored token', () => {
      localStorage.setItem('access_token', 'mytoken');
      expect(authService.getAccessToken()).toBe('mytoken');
    });

    it('getAccessToken returns null when not set', () => {
      expect(authService.getAccessToken()).toBeNull();
    });

    it('clearTokens removes tokens from localStorage', () => {
      authService.setTokens('a', 'b');
      authService.clearTokens();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('login', () => {
    it('calls POST /api/login/ and returns data', async () => {
      const mockData = { access: 'tok', refresh: 'ref', user: { id: 1, email: 'a@b.com' } };
      mockApi.post.mockResolvedValueOnce({ data: mockData });

      const result = await authService.login('a@b.com', 'pass');
      expect(mockApi.post).toHaveBeenCalledWith('/api/login/', { email: 'a@b.com', password: 'pass' });
      expect(result).toEqual(mockData);
    });

    it('propagates error when API fails', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));
      await expect(authService.login('x@x.com', 'wrong')).rejects.toThrow('Network error');
    });
  });

  describe('loginWithGoogle', () => {
    it('calls POST /api/auth/google/ with token', async () => {
      const mockData = { access: 'tok', refresh: 'ref', is_new_user: false };
      mockApi.post.mockResolvedValueOnce({ data: mockData });

      const result = await authService.loginWithGoogle('google-token-xyz');
      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/google/', { token: 'google-token-xyz' });
      expect(result).toEqual(mockData);
    });
  });

  describe('register', () => {
    it('calls POST /api/register/ with registration data', async () => {
      const payload = { email: 'new@test.com', full_name: 'Nuevo', password: 'pass', password_confirm: 'pass' };
      const mockData = { id: 1, email: 'new@test.com', full_name: 'Nuevo', message: 'ok' };
      mockApi.post.mockResolvedValueOnce({ data: mockData });

      const result = await authService.register(payload);
      expect(mockApi.post).toHaveBeenCalledWith('/api/register/', payload);
      expect(result).toEqual(mockData);
    });
  });

  describe('getCurrentUser', () => {
    it('calls GET /api/me/ and returns user', async () => {
      const mockUser = { id: 1, email: 'a@b.com', full_name: 'Ana', role: 'admin' };
      mockApi.get.mockResolvedValueOnce({ data: mockUser });

      const result = await authService.getCurrentUser();
      expect(mockApi.get).toHaveBeenCalledWith('/api/me/');
      expect(result).toEqual(mockUser);
    });
  });
});
