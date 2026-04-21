import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import type { User, LoginResponse } from '@/types';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    enabled: !!authService.getAccessToken(),
  });

  const isAdmin = user?.role === 'admin';

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data: LoginResponse) => {
      authService.setTokens(data.access, data.refresh);
      
      const userRole = data.user.role || 'participante';
      const userIsStaff = data.user.is_staff ?? false;
      
      queryClient.setQueryData(['currentUser'], {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.first_name,
        role: userRole,
        is_active: true,
        is_staff: userIsStaff,
      });
      setError(null);
      navigate('/dashboard');
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    },
  });

  const loginWithGoogleMutation = useMutation({
    mutationFn: authService.loginWithGoogle,
    onSuccess: (data) => {
      authService.setTokens(data.access, data.refresh);
      const userData = data.user as { id: number; email: string; full_name?: string; first_name?: string; role?: string };
      const userRole = userData.role || 'participante';
      queryClient.setQueryData(['currentUser'], {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name || userData.first_name || '',
        role: userRole,
        is_active: true,
        is_staff: false,
      });
      setError(null);
      navigate('/dashboard');
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      setError(err.response?.data?.error || 'Error al iniciar sesión con Google');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      setError(null);
      navigate('/login');
    },
    onError: (err: { response?: { data?: unknown } }) => {
      const errors = err.response?.data as Record<string, unknown> | undefined;
      if (errors) {
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages || 'Error al registrar');
      } else {
        setError('Error al registrar. Verifica los datos.');
      }
    },
  });

  const logout = useCallback(() => {
    authService.clearTokens();
    queryClient.clear();
    sessionStorage.clear();
    navigate('/login');
  }, [navigate, queryClient]);

  return {
    user: user as User | undefined,
    isAdmin,
    isAuthenticated: !!authService.getAccessToken() && !!user,
    isLoadingUser: isLoadingUser,
    login: loginMutation.mutate,
    loginWithGoogle: loginWithGoogleMutation.mutate,
    register: registerMutation.mutate,
    logout,
    error,
    setError,
    isLoggingIn: loginMutation.isPending,
    isLoggingInWithGoogle: loginWithGoogleMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};