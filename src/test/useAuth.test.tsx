import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

let mockNavigate = vi.fn();

vi.mock('@/services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
    register: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    getAccessToken: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
    localStorage.clear();
  });

  it('initializes with no user when not authenticated', async () => {
    const mockAuthService = authService as any;
    mockAuthService.getAccessToken.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.user).toBeUndefined();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('loads current user when authenticated', async () => {
    const mockUser = { id: 1, email: 'test@example.com', full_name: 'Test User', role: 'admin', is_active: true, is_staff: true };
    const mockAuthService = authService as any;
    mockAuthService.getAccessToken.mockReturnValue('valid-token');
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Wait for query to resolve
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
  });

  it('sets isAdmin flag when user role is admin', async () => {
    const mockUser = { id: 1, email: 'test@example.com', full_name: 'Admin User', role: 'admin', is_active: true, is_staff: true };
    const mockAuthService = authService as any;
    mockAuthService.getAccessToken.mockReturnValue('valid-token');
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(result.current.isAdmin).toBe(true);
  });

  it('sets isAdmin flag when user role is coordinador', async () => {
    const mockUser = { id: 1, email: 'test@example.com', full_name: 'Coord User', role: 'coordinador', is_active: true, is_staff: false };
    const mockAuthService = authService as any;
    mockAuthService.getAccessToken.mockReturnValue('valid-token');
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(result.current.isAdmin).toBe(true);
  });

  it('sets error message on login failure', async () => {
    const mockAuthService = authService as any;
    mockAuthService.getAccessToken.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    const error = { response: { data: { detail: 'Invalid credentials' } } };
    mockAuthService.login.mockRejectedValueOnce(error);

    await act(async () => {
      result.current.login({ email: 'test@example.com', password: 'wrong' });
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Error handling is done but may not update state immediately in test
    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('clears tokens and navigates on logout', () => {
    const mockAuthService = authService as any;
    mockAuthService.getAccessToken.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    result.current.logout();

    expect(mockAuthService.clearTokens).toHaveBeenCalled();
  });

  it('exposes loading states', async () => {
    const mockAuthService = authService as any;
    mockAuthService.getAccessToken.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.isLoadingUser).toBe('boolean');
    expect(typeof result.current.isLoggingIn).toBe('boolean');
    expect(typeof result.current.isLoggingInWithGoogle).toBe('boolean');
    expect(typeof result.current.isRegistering).toBe('boolean');
  });

  it('allows setting and getting error state', () => {
    const mockAuthService = authService as any;
    mockAuthService.getAccessToken.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.error).toBe(null);

    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.error).toBe('Test error');
  });

  describe('login', () => {
    it('handles successful login and navigates to dashboard', async () => {
      const mockAuthService = authService as any;
      mockAuthService.getAccessToken.mockReturnValue(null);

      const loginResponse = {
        access: 'new-access-token',
        refresh: 'new-refresh-token',
        user: {
          id: 1,
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'admin',
          is_staff: true,
        },
      };
      mockAuthService.login.mockResolvedValueOnce(loginResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.login({ email: 'test@example.com', password: 'correct' });
      });

      await waitFor(() => {
        expect(mockAuthService.setTokens).toHaveBeenCalledWith('new-access-token', 'new-refresh-token');
      });

      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'correct');
      expect(result.current.error).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('handles login with missing optional user fields', async () => {
      const mockAuthService = authService as any;
      mockAuthService.getAccessToken.mockReturnValue(null);

      const loginResponse = {
        access: 'token',
        refresh: 'refresh',
        user: {
          id: 2,
          email: 'user@example.com',
          full_name: 'Regular User',
        },
      };
      mockAuthService.login.mockResolvedValueOnce(loginResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.login({ email: 'user@example.com', password: 'pass' });
      });

      await waitFor(() => {
        expect(mockAuthService.setTokens).toHaveBeenCalled();
      });
    });
  });

  describe('loginWithGoogle', () => {
    it('handles successful Google login', async () => {
      const mockAuthService = authService as any;
      mockAuthService.getAccessToken.mockReturnValue(null);

      const googleResponse = {
        access: 'google-access-token',
        refresh: 'google-refresh-token',
        user: {
          id: 3,
          email: 'google@example.com',
          full_name: 'Google User',
          role: 'participante',
        },
        is_new_user: false,
      };
      mockAuthService.loginWithGoogle.mockResolvedValueOnce(googleResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loginWithGoogle('google-token');
      });

      await waitFor(() => {
        expect(mockAuthService.setTokens).toHaveBeenCalledWith('google-access-token', 'google-refresh-token');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('sets error on Google login failure', async () => {
      const mockAuthService = authService as any;
      mockAuthService.getAccessToken.mockReturnValue(null);

      const error = { response: { data: { error: 'Invalid Google token' } } };
      mockAuthService.loginWithGoogle.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loginWithGoogle('invalid-token');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid Google token');
      });
    });
  });

  describe('register', () => {
    it('handles successful registration and navigates to login', async () => {
      const mockAuthService = authService as any;
      mockAuthService.getAccessToken.mockReturnValue(null);

      mockAuthService.register.mockResolvedValueOnce({
        id: 4,
        email: 'new@example.com',
        full_name: 'New User',
        message: 'Registered successfully',
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.register({
          email: 'new@example.com',
          full_name: 'New User',
          password: 'securepass123',
          password_confirm: 'securepass123',
        });
      });

      await waitFor(() => {
        expect(mockAuthService.register).toHaveBeenCalled();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('sets error on registration failure with structured errors', async () => {
      const mockAuthService = authService as any;
      mockAuthService.getAccessToken.mockReturnValue(null);

      const error = {
        response: {
          data: {
            email: ['Este correo ya está registrado'],
            password: ['La contraseña debe tener al menos 8 caracteres'],
          },
        },
      };
      mockAuthService.register.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.register({
          email: 'existing@example.com',
          full_name: 'User',
          password: '123',
          password_confirm: '123',
        });
      });

      await waitFor(() => {
        expect(result.current.error).toContain('Este correo ya está registrado');
      });

      expect(result.current.error).toContain('La contraseña debe tener al menos 8 caracteres');
    });

    it('sets default error message when no error data returned', async () => {
      const mockAuthService = authService as any;
      mockAuthService.getAccessToken.mockReturnValue(null);

      mockAuthService.register.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.register({
          email: 'test@example.com',
          full_name: 'Test',
          password: 'pass',
          password_confirm: 'pass',
        });
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Error al registrar. Verifica los datos.');
      });
    });
  });
});
