import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { Award, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const registerSchema = z
  .object({
    email: z.string().email('Email inválido'),
    full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    password_confirm: z.string().min(8, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { register: registerUser, isRegistering, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: prefilledEmail,
      full_name: '',
      password: '',
      password_confirm: '',
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerUser(data);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

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
          <div className="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />
          <div className="p-8">
            <h2 className="text-xl font-bold text-secondary-900 mb-1 tracking-tight">Crear cuenta</h2>
            <p className="text-sm text-secondary-500 mb-6">Completa los datos para registrarte</p>

            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3.5 top-[13px] w-4 h-4 text-secondary-400 pointer-events-none z-10" />
                <Input
                  {...register('full_name')}
                  placeholder="Nombre completo"
                  className="pl-10"
                  error={errors.full_name?.message}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-[13px] w-4 h-4 text-secondary-400 pointer-events-none z-10" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="pl-10"
                  error={errors.email?.message}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-[13px] w-4 h-4 text-secondary-400 pointer-events-none z-10" />
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
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

              <div className="relative">
                <Lock className="absolute left-3.5 top-[13px] w-4 h-4 text-secondary-400 pointer-events-none z-10" />
                <Input
                  {...register('password_confirm')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repite la contraseña"
                  className="pl-10 pr-12"
                  error={errors.password_confirm?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-[13px] text-secondary-400 hover:text-secondary-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isRegistering}>
                Crear Cuenta
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-secondary-100 text-center">
              <p className="text-sm text-secondary-500">
                ¿Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  Inicia Sesión
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
