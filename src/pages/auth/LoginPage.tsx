import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Award, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Google OAuth Client ID - Must be configured in .env file
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.warn('VITE_GOOGLE_CLIENT_ID is not configured. Google login will not work.');
}

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

const EmailLoginForm = () => {
  const { login, isLoggingIn, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
        <Input
          {...register('email')}
          type="email"
          placeholder="Email"
          className="pl-10"
          error={errors.email?.message}
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
        <Input
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          placeholder="Contraseña"
          className="pl-10 pr-16"
          error={errors.password?.message}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary-500 hover:text-secondary-700"
        >
          {showPassword ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      <Button
        type="submit"
        className="w-full"
        isLoading={isLoggingIn}
      >
        Iniciar Sesión
      </Button>
    </form>
  );
};

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { error, setError } = useAuth();

  const loginWithGoogleMutation = useMutation({
    mutationFn: authService.loginWithGoogle,
    onSuccess: (data) => {
      authService.setTokens(data.access, data.refresh);
      const userData = data.user as { id: number; email: string; full_name?: string; first_name?: string; role?: string };
      queryClient.setQueryData(['currentUser'], {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name || userData.first_name || '',
        role: userData.role || 'admin',
        is_active: true,
        is_staff: true,
      });
      setError(null);
      navigate('/dashboard');
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      setError(err.response?.data?.error || 'Error al iniciar sesión con Google');
    },
  });

  const handleSuccess = (credentialResponse: { credential?: string }) => {
    if (credentialResponse.credential) {
      loginWithGoogleMutation.mutate(credentialResponse.credential);
    }
  };

  const handleError = () => {
    setError('Error al iniciar sesión con Google');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      
      <div className="flex justify-center">
        {loginWithGoogleMutation.isPending ? (
          <div className="w-[300px] h-[44px] bg-secondary-100 rounded animate-pulse flex items-center justify-center">
            <span className="text-secondary-500 text-sm">Cargando...</span>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
            shape="rectangular"
            size="large"
            width="300"
          />
        )}
      </div>
    </div>
  );
};

const LoginPageContent = () => {
  const [loginMethod, setLoginMethod] = useState<'choice' | 'google' | 'email'>('choice');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CertyPro</h1>
          <p className="text-primary-100">Sistema de Gestión de Certificados</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6 text-center">
            Iniciar Sesión
          </h2>

          {loginMethod === 'choice' && (
            <div className="space-y-4">
              {GOOGLE_CLIENT_ID ? (
                <>
                  <GoogleLoginButton />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-secondary-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-secondary-500">o</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm text-center">
                  Google login no está configurado. Contacta al administrador.
                </div>
              )}

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setLoginMethod('email')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Iniciar con Email
              </Button>
            </div>
          )}

          {loginMethod === 'google' && GOOGLE_CLIENT_ID && (
            <div className="space-y-4">
              <GoogleLoginButton />

              <button
                type="button"
                onClick={() => setLoginMethod('choice')}
                className="w-full text-sm text-secondary-500 hover:text-secondary-700"
              >
                ← Volver a elegir método de inicio
              </button>
            </div>
          )}

          {loginMethod === 'email' && (
            <div className="space-y-4">
              <EmailLoginForm />
              
              <button
                type="button"
                onClick={() => setLoginMethod('choice')}
                className="w-full text-sm text-secondary-500 hover:text-secondary-700"
              >
                ← Volver a elegir método de inicio
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-secondary-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">
                Regístrate
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-primary-100 text-sm mt-6">
          © 2026 CertyPro. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export const LoginPageWrapper = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginPageContent />
    </GoogleOAuthProvider>
  );
};

export default LoginPageWrapper;
