import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input, Alert } from '@/components/ui';
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
  student_exists: boolean;
  student: number | null;
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
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <Alert type="error">{error}</Alert>
          <Button onClick={() => navigate('/')} className="mt-4">
            Volver al inicio
          </Button>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <Alert type="error">Cargando invitación...</Alert>
        </Card>
      </div>
    );
  }

  // Check if user is logged in and matches the invitation email
  const isLoggedInUser = isAuthenticated && user?.email?.toLowerCase() === invitation.email.toLowerCase();

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">Invitación al Evento</h1>
        </div>

        <div className="bg-primary-50 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-primary-900">{invitation.event_name}</h2>
          <div className="mt-2 text-sm text-primary-700 space-y-1">
            <p><strong>Fecha:</strong> {new Date(invitation.event_date).toLocaleDateString('es-ES')}</p>
            {invitation.event_location && <p><strong>Ubicación:</strong> {invitation.event_location}</p>}
            {invitation.event_description && <p><strong>Descripción:</strong> {invitation.event_description}</p>}
          </div>
        </div>

        {error && (
          <Alert type="error" className="mb-4">{error}</Alert>
        )}

        {invitation.status === 'accepted' ? (
          <div className="text-center">
            <Alert type="info">Esta invitación ya fue aceptada. Ya estás inscrito en el evento.</Alert>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Ir a Mis Eventos
            </Button>
          </div>
        ) : invitation.status === 'expired' ? (
          <div className="text-center">
            <Alert type="error">Esta invitación ha expirado.</Alert>
          </div>
        ) : invitation.student_exists && isLoggedInUser ? (
          <div className="text-center">
            <p className="text-secondary-600 mb-4">
              ¡Bienvenido! Has sido invitado a este evento. Haz clic en aceptar para inscribirte.
            </p>
            <Button onClick={handleAccept} isLoading={isRegistering}>
              Aceptar Invitación
            </Button>
          </div>
        ) : invitation.student_exists ? (
              <div className="text-center">
                <p className="text-secondary-600 mb-4">
                  Has sido invitado a este evento. Haz clic en aceptar para inscribirte.
                </p>
                <Button onClick={handleAccept} isLoading={isRegistering}>
                  Aceptar Invitación
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <p className="text-secondary-600 mb-4">
                  Para aceptar esta invitación, por favor completa tu registro:
                </p>
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
                <Button type="submit" className="w-full" isLoading={isRegistering}>
                  Registrarme y Aceptar Invitación
                </Button>
              </form>
            )}
      </Card>
    </div>
  );
};

export default InvitationPage;