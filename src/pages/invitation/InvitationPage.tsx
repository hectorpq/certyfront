import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Alert } from '@/components/ui';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface InvitationDetail {
  id: number;
  event: number;
  event_name: string;
  event_date: string;
  event_location: string;
  event_description: string;
  email: string;
  status: string;
  expires_at: string;
  participant_exists: boolean;
  participant: number | null;
}

export const InvitationPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [invitation, setInvitation] = useState<InvitationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: '',
  });

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await api.get<InvitationDetail>(`/api/invitations/${token}/`);
        setInvitation(response.data);

        if (response.data.status === 'accepted') {
          setError('Esta invitación ya fue aceptada');
        } else if (response.data.status === 'expired') {
          setError('Esta invitación ha expirado');
        }
      } catch (err: unknown) {
        console.error('Error fetching invitation:', err);
        const error = err as { response?: { data?: { error?: string } } };
        const errorMsg = error.response?.data?.error || 'Invitación no encontrada o expirada';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchInvitation();
    }
  }, [token, isAuthenticated, user]);

  const handleAccept = async () => {
    if (!token) return;
    
    setIsRegistering(true);
    try {
      await api.post(`/api/invitations/${token}/accept/`);
      // Redirect to dashboard after accepting
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Error al aceptar invitación');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (!token) return;
    
    setIsRegistering(true);
    setError(null);
    
    try {
      await api.post(`/api/invitations/${token}/register/`, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        password: formData.password,
      });
      // Redirect to dashboard after registering
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; [key: string]: unknown } } };
      const errors = error.response?.data;
      if (errors && typeof errors === 'object') {
        const firstError = Object.values(errors).flat()[0];
        setError(String(firstError));
      } else {
        setError('Error al registrar');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/70"></div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 -mx-8 -mt-8 mb-8 rounded-t-2xl" />
          <Alert type="error">{error}</Alert>
          <Button onClick={() => navigate('/')} className="mt-4 w-full">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <p className="text-secondary-500 text-sm">Cargando invitación...</p>
        </div>
      </div>
    );
  }

  const isLoggedInUser = isAuthenticated && user?.email?.toLowerCase() === invitation.email.toLowerCase();

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Invitación al Evento</h1>
          <p className="text-primary-200 text-sm mt-1">Has recibido una invitación especial</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-primary-900/30 border border-white/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />
          <div className="p-8">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100/60 border border-primary-100 rounded-xl p-4 mb-6">
              <h2 className="text-lg font-bold text-primary-900 mb-2">{invitation.event_name}</h2>
              <div className="text-sm text-primary-700 space-y-1">
                <p><span className="font-semibold">Fecha:</span> {new Date(invitation.event_date).toLocaleDateString('es-ES')}</p>
                {invitation.event_location && <p><span className="font-semibold">Ubicación:</span> {invitation.event_location}</p>}
                {invitation.event_description && <p><span className="font-semibold">Descripción:</span> {invitation.event_description}</p>}
              </div>
            </div>

            {error && (
              <Alert type="error" className="mb-4">{error}</Alert>
            )}

            {invitation.status === 'accepted' ? (
              <div className="text-center">
                <Alert type="info">Esta invitación ya fue aceptada. Ya estás inscrito en el evento.</Alert>
                <Button onClick={() => navigate('/dashboard')} className="mt-4 w-full" size="lg">
                  Ir a Mis Eventos
                </Button>
              </div>
            ) : invitation.status === 'expired' ? (
              <div className="text-center">
                <Alert type="error">Esta invitación ha expirado.</Alert>
              </div>
            ) : invitation.participant_exists && isLoggedInUser ? (
              <div className="text-center">
                <p className="text-secondary-600 text-sm mb-5">
                  ¡Bienvenido! Has sido invitado a este evento. Haz clic en aceptar para inscribirte.
                </p>
                <Button onClick={handleAccept} isLoading={isRegistering} className="w-full" size="lg">
                  Aceptar Invitación
                </Button>
              </div>
            ) : invitation.participant_exists ? (
              <div className="text-center">
                <p className="text-secondary-600 text-sm mb-5">
                  Has sido invitado a este evento. Haz clic en aceptar para inscribirte.
                </p>
                <Button onClick={handleAccept} isLoading={isRegistering} className="w-full" size="lg">
                  Aceptar Invitación
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <p className="text-secondary-600 text-sm mb-2">
                  Para aceptar esta invitación, completa tu registro:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                  <Input
                    label="Apellido"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Teléfono"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <Input
                  label="Confirmar Contraseña"
                  type="password"
                  value={formData.password_confirm}
                  onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                  required
                  minLength={8}
                />
                <Button type="submit" className="w-full" size="lg" isLoading={isRegistering}>
                  Registrarme y Aceptar Invitación
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-primary-200/70 text-xs mt-6">
          © 2026 CertyPro · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default InvitationPage;