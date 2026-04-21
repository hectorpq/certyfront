import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Award, Mail, Lock, User } from 'lucide-react';
import { Button, Input, Alert } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  password_confirm: z.string().min(8, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.password_confirm, {
  message: "Las contraseñas no coinciden",
  path: ["password_confirm"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { register: registerUser, isRegistering, error } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterForm) => {
    registerUser(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CertyPro</h1>
          <p className="text-primary-100">Crea tu cuenta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6 text-center">
            Registro de Usuario
          </h2>

          {error && (
            <Alert type="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <Input
                {...register('full_name')}
                placeholder="Nombre completo"
                className="pl-10"
                error={errors.full_name?.message}
              />
            </div>

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
                type="password"
                placeholder="Contraseña"
                className="pl-10"
                error={errors.password?.message}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <Input
                {...register('password_confirm')}
                type="password"
                placeholder="Confirmar contraseña"
                className="pl-10"
                error={errors.password_confirm?.message}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isRegistering}
            >
              Crear Cuenta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-secondary-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
