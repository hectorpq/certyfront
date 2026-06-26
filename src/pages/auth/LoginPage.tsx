import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Award, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

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
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: prefilledEmail,
      password: '',
    },
  });

  const onSubmit = (data: LoginForm) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="relative">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" style={{ marginTop: error || errors.email ? '-10px' : '0' }} />
        <Input
          {...register('email')}
          type="email"
          placeholder="correo@ejemplo.com"
          className="pl-10"
          error={errors.email?.message}
        />
        {/* reposition icon manually since label changes height */}
      </div>

      <div className="relative">
        <Lock className="absolute left-3.5 top-[13px] w-4 h-4 text-secondary-400 pointer-events-none z-10" />
        <Input
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          className="pl-10 pr-12"
          error={errors.password?.message}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-[13px] text-secondary-400 hover:text-secondary-600 transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <Button type="submit" className="w-full" size="lg" isLoading={isLoggingIn}>
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
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="flex justify-center">
        {loginWithGoogleMutation.isPending ? (
          <div className="w-[300px] h-[44px] bg-secondary-100 rounded-lg animate-pulse flex items-center justify-center">
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
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500">
      {/* Decorative background circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-800/20 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-xl mb-4">
            <Award className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">CertyPro</h1>
          <p className="text-primary-200 text-sm">Sistema de Gestión de Certificados</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-primary-900/30 border border-white/50 overflow-hidden">
          {/* Card top accent */}
          <div className="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />

          <div className="p-8">
            <h2 className="text-xl font-bold text-secondary-900 mb-1 tracking-tight">
              Bienvenido
            </h2>
            <p className="text-sm text-secondary-500 mb-6">Inicia sesión para continuar</p>

            {loginMethod === 'choice' && (
              <div className="space-y-4">
                {GOOGLE_CLIENT_ID ? (
                  <>
                    <GoogleLoginButton />
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-secondary-200" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-white text-secondary-400 font-medium uppercase tracking-widest">
                          o continúa con
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center">
                    Google login no está configurado. Contacta al administrador.
                  </div>
                )}

                <Button
                  variant="secondary"
                  className="w-full"
                  size="lg"
                  onClick={() => setLoginMethod('email')}
                >
                  <Mail className="w-4 h-4" />
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
                  className="w-full text-sm text-secondary-500 hover:text-secondary-700 transition-colors py-1"
                >
                  ← Volver a opciones de acceso
                </button>
              </div>
            )}

            {loginMethod === 'email' && (
              <div className="space-y-4">
                <EmailLoginForm />
                <button
                  type="button"
                  onClick={() => setLoginMethod('choice')}
                  className="w-full text-sm text-secondary-500 hover:text-secondary-700 transition-colors py-1"
                >
                  ← Volver a opciones de acceso
                </button>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-secondary-100 text-center">
              <p className="text-sm text-secondary-500">
                ¿No tienes cuenta?{' '}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-primary-200/70 text-xs mt-6">
          © 2026 CertyPro · Todos los derechos reservados
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
