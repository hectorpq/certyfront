import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, Users, FileText, Send, Check, X, Mail } from 'lucide-react';
import { Card, Button, Badge, Alert, Modal, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import type { Event } from '@/types';

interface EventStats {
  event_id: number;
  event_name: string;
  total_enrollments: number;
  attendees: number;
  absent: number;
  total_certificates: number;
  generated_certificates: number;
  sent_certificates: number;
  pending_certificates: number;
  failed_certificates: number;
}

interface Participant {
  enrollment_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  student_phone: string;
  attendance: boolean;
  certificate_id: number | null;
  certificate_status: string | null;
  certificate_status_display: string | null;
  verification_code: string | null;
  has_certificate: boolean;
}

interface DeliveryLog {
  id: number;
  certificate: number;
  delivery_method: string;
  delivery_method_display: string;
  recipient: string;
  status: string;
  status_display: string;
  error_message: string;
  sent_at: string;
  sent_by: number;
  is_successful: boolean;
  is_failed: boolean;
  is_pending: boolean;
}

interface Invitation {
  id: number;
  event: number;
  event_name: string;
  student: number | null;
  student_name: string | null;
  email: string;
  token: string;
  status: string;
  status_display: string;
  expires_at: string | null;
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
}

type TabType = 'participants' | 'certificates' | 'deliveries' | 'invitations';

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('participants');
  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryLog[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [isSendingInvites, setIsSendingInvites] = useState(false);
const [inviteResult, setInviteResult] = useState<{ total: number; created: number; errors: string[] } | null>(null);

  const fetchEventData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [eventRes, statsRes, participantsRes] = await Promise.all([
        api.get<Event>(`/api/events/${id}/`, { headers }),
        api.get<EventStats>(`/api/events/${id}/stats/`, { headers }),
        api.get<Participant[]>(`/api/events/${id}/participants/`, { headers }),
      ]);

      setEvent(eventRes.data);
      setStats(statsRes.data);
      setParticipants(participantsRes.data);
    } catch (error) {
      console.error('Error fetching event data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useState(() => {
    fetchEventData();
  });

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get<DeliveryLog[]>(`/api/events/${id}/deliveries/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveries(response.data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'deliveries' && deliveries.length === 0) {
      fetchDeliveries();
    }
    if (activeTab === 'invitations' && invitations.length === 0) {
      loadInvitations();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const handleSelectAll = () => {
    if (selectedParticipants.length === participants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(participants.map(p => p.enrollment_id));
    }
  };

  const handleSelectParticipant = (enrollmentId: number) => {
    setSelectedParticipants(prev =>
      prev.includes(enrollmentId)
        ? prev.filter(id => id !== enrollmentId)
        : [...prev, enrollmentId]
    );
  };

  const handleSendSelected = async (method: 'email' | 'whatsapp' | 'link') => {
    setIsSending(true);
    setSendResult(null);
    try {
      const token = localStorage.getItem('access_token');
      const studentIds = participants
        .filter(p => selectedParticipants.includes(p.enrollment_id) && p.certificate_id)
        .map(p => p.student_id);

      const response = await api.post(
        `/api/events/${id}/certificates/send/`,
        { method, student_ids: studentIds.length > 0 ? studentIds : undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSendResult({
        sent: response.data.total_sent,
        failed: response.data.total_failed,
      });
      fetchEventData();
      setSelectedParticipants([]);
    } catch (error) {
      console.error('Error sending certificates:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendAll = async (method: 'email' | 'whatsapp' | 'link') => {
    setIsSending(true);
    setSendResult(null);
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.post(
        `/api/events/${id}/certificates/send/`,
        { method },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSendResult({
        sent: response.data.total_sent,
        failed: response.data.total_failed,
      });
      fetchEventData();
    } catch (error) {
      console.error('Error sending all certificates:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateCertificates = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await api.post(
        `/api/events/${id}/certificates/generate/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEventData();
    } catch (error) {
      console.error('Error generating certificates:', error);
    }
  };

  const handleEnrollStudent = async () => {
    if (!newStudentEmail) return;
    try {
      const token = localStorage.getItem('access_token');
      await api.post(
        `/api/events/${id}/enroll/`,
        { student_email: newStudentEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEnrollModalOpen(false);
      setNewStudentEmail('');
      fetchEventData();
    } catch (error) {
      console.error('Error enrolling student:', error);
    }
  };

  const handleToggleAttendance = async (enrollmentId: number, currentAttendance: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      await api.patch(
        `/api/events/${id}/enroll/`,
        { enrollment_id: enrollmentId, attendance: !currentAttendance },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEventData();
    } catch (error) {
      console.error('Error toggling attendance:', error);
    }
  };

  const handleSendInvitations = async () => {
    if (!inviteEmails.trim()) return;
    setIsSendingInvites(true);
    setInviteResult(null);
    
    try {
      const token = localStorage.getItem('access_token');
      const emails = inviteEmails.split(',').map(e => e.trim()).filter(e => e);
      
      const formData = new FormData();
      formData.append('emails', JSON.stringify(emails));
      
      const response = await api.post(
        `/api/events/${id}/invitations/send/`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setInviteResult(response.data);
      if (response.data.created > 0) {
        fetchEventData();
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
    } finally {
      setIsSendingInvites(false);
    }
  };

  const handleSendAllInvitations = async () => {
    setIsSendingInvites(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.post(
        `/api/events/${id}/invitations/send-all/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInviteResult({ total: response.data.sent, created: response.data.sent, errors: response.data.errors || [] });
      fetchEventData();
    } catch (error) {
      console.error('Error sending all invitations:', error);
    } finally {
      setIsSendingInvites(false);
    }
  };

  const loadInvitations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get<Invitation[]>(
        `/api/events/${id}/invitations/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInvitations(response.data);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const handleFinalizeEvent = async (sendCertificates: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.post(
        `/api/events/${id}/finalize/`,
        { send_certificates: sendCertificates },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Evento finalizado. Certificados enviados: ${response.data.certificates_sent}`);
      fetchEventData();
    } catch (error) {
      console.error('Error finalizing event:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!event || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600">Evento no encontrado</p>
        <Link to="/events" className="text-primary-600 hover:underline mt-2 inline-block">
          Volver a eventos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/events"
          className="p-2 rounded-lg hover:bg-secondary-100 text-secondary-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-secondary-900">{event.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-secondary-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(event.event_date).toLocaleDateString('es-ES')}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {event.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {event.duration_hours}h
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {stats.total_enrollments} participantes
            </span>
          </div>
        </div>
        <Badge variant={event.status === 'active' ? 'success' : 'default'}>
          {event.status_display}
        </Badge>
        {isAdmin && event.status !== 'finished' && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleFinalizeEvent(false)}>
              Finalizar Evento
            </Button>
            <Button size="sm" onClick={() => handleFinalizeEvent(true)}>
              Finalizar y Enviar Certificados
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.total_enrollments}</div>
          <div className="text-sm text-secondary-600">Inscripciones</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.attendees}</div>
          <div className="text-sm text-secondary-600">Asistentes</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total_certificates}</div>
          <div className="text-sm text-secondary-600">Certificados</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.generated_certificates}</div>
          <div className="text-sm text-secondary-600">Generados</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.sent_certificates}</div>
          <div className="text-sm text-secondary-600">Enviados</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.pending_certificates}</div>
          <div className="text-sm text-secondary-600">Pendientes</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.failed_certificates}</div>
          <div className="text-sm text-secondary-600">Fallidos</div>
        </Card>
      </div>

      {sendResult && (
        <Alert type={sendResult.failed === 0 ? 'success' : 'warning'}>
          {sendResult.failed === 0
            ? `Se enviaron ${sendResult.sent} certificados exitosamente`
            : `Enviados: ${sendResult.sent}, Fallidos: ${sendResult.failed}`}
        </Alert>
      )}

      <Card>
        <div className="border-b border-secondary-200">
          <nav className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('participants')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'participants'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Participantes ({stats.total_enrollments})
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'invitations'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Invitaciones
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'certificates'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Certificados ({stats.total_certificates})
            </button>
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'deliveries'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Envíos
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'participants' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={handleSelectAll}
                  disabled={participants.length === 0}
                >
                  {selectedParticipants.length === participants.length ? 'Deseleccionar' : 'Seleccionar'} Todos
                </Button>
                {isAdmin && (
                  <Button variant="secondary" onClick={() => setIsEnrollModalOpen(true)}>
                    + Agregar Participante
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={handleGenerateCertificates}
                  disabled={stats.attendees === 0}
                >
                  Generar Certificados
                </Button>
                <div className="flex-1" />
                <Button
                  onClick={() => handleSendSelected('email')}
                  disabled={selectedParticipants.length === 0 || isSending}
                  isLoading={isSending}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Seleccionados
                </Button>
                <Button
                  onClick={() => handleSendAll('email')}
                  disabled={stats.total_certificates === 0 || isSending}
                  isLoading={isSending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Todos
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-secondary-200">
                      <th className="text-left py-3 px-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.length === participants.length && participants.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-secondary-300"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Nombre</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Teléfono</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">Asistencia</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-secondary-700">Certificado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-secondary-500">
                          No hay participantes inscritos
                        </td>
                      </tr>
                    ) : (
                      participants.map((participant) => (
                        <tr key={participant.enrollment_id} className="border-b border-secondary-100 hover:bg-secondary-50">
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedParticipants.includes(participant.enrollment_id)}
                              onChange={() => handleSelectParticipant(participant.enrollment_id)}
                              className="rounded border-secondary-300"
                            />
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-secondary-900">
                            {participant.student_name}
                          </td>
                          <td className="py-3 px-4 text-sm text-secondary-600">
                            {participant.student_email}
                          </td>
                          <td className="py-3 px-4 text-sm text-secondary-600">
                            {participant.student_phone || '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isAdmin ? (
                              <button
                                onClick={() => handleToggleAttendance(participant.enrollment_id, participant.attendance)}
                                className={`p-1.5 rounded-full ${
                                  participant.attendance
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-red-100 text-red-600'
                                }`}
                              >
                                {participant.attendance ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                              </button>
                            ) : (
                              <span className={`inline-flex items-center gap-1 ${
                                participant.attendance ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {participant.attendance ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {participant.certificate_status ? (
                              <Badge
                                variant={
                                  participant.certificate_status === 'sent' ? 'success' :
                                  participant.certificate_status === 'generated' ? 'warning' :
                                  participant.certificate_status === 'failed' ? 'error' : 'default'
                                }
                              >
                                {participant.certificate_status_display}
                              </Badge>
                            ) : (
                              <span className="text-secondary-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-secondary-600">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Pendientes: {stats.pending_certificates}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span> Generados: {stats.generated_certificates}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span> Enviados: {stats.sent_certificates}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span> Fallidos: {stats.failed_certificates}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-secondary-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Participante</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Estado</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Código</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.filter(p => p.has_certificate).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-secondary-500">
                          No hay certificados generados
                        </td>
                      </tr>
                    ) : (
                      participants.filter(p => p.has_certificate).map((participant) => (
                        <tr key={participant.certificate_id} className="border-b border-secondary-100">
                          <td className="py-3 px-4 text-sm font-medium text-secondary-900">
                            {participant.student_name}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                participant.certificate_status === 'sent' ? 'success' :
                                participant.certificate_status === 'generated' ? 'warning' :
                                participant.certificate_status === 'failed' ? 'error' : 'default'
                              }
                            >
                              {participant.certificate_status_display}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm font-mono text-secondary-600">
                            {participant.verification_code}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleSendSelected('email')}
                                disabled={isSending}
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'deliveries' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-secondary-600">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span> Exitosos: {deliveries.filter(d => d.is_successful).length}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span> Fallidos: {deliveries.filter(d => d.is_failed).length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-secondary-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Fecha</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Destinatario</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Método</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Estado</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-secondary-500">
                          No hay envíos registrados
                        </td>
                      </tr>
                    ) : (
                      deliveries.map((delivery) => (
                        <tr key={delivery.id} className="border-b border-secondary-100">
                          <td className="py-3 px-4 text-sm text-secondary-600">
                            {new Date(delivery.sent_at).toLocaleString('es-ES')}
                          </td>
                          <td className="py-3 px-4 text-sm text-secondary-900">
                            {delivery.recipient}
                          </td>
                          <td className="py-3 px-4 text-sm text-secondary-600">
                            {delivery.delivery_method_display}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                delivery.is_successful ? 'success' :
                                delivery.is_failed ? 'error' : 'warning'
                              }
                            >
                              {delivery.status_display}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-red-600">
                            {delivery.error_message || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'invitations' && (
            <div className="space-y-4">
              {isAdmin && (
                <div className="flex gap-3 mb-4">
                  <Button onClick={() => setIsInviteModalOpen(true)}>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Invitaciones
                  </Button>
                  <Button variant="secondary" onClick={handleSendAllInvitations} disabled={isSendingInvites}>
                    Enviar Pendientes
                  </Button>
                </div>
              )}

              {inviteResult && (
                <Alert type={inviteResult.errors.length === 0 ? 'success' : 'warning'}>
                  Invitaciones creadas: {inviteResult.created} de {inviteResult.total}
                  {inviteResult.errors.length > 0 && (
                    <div className="mt-2 text-sm">
                      Errores: {inviteResult.errors.slice(0, 3).join(', ')}
                      {inviteResult.errors.length > 3 && ` y ${inviteResult.errors.length - 3} más`}
                    </div>
                  )}
                </Alert>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-secondary-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Estudiante</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Estado</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Enviado</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">Expira</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-secondary-500">
                          No hay invitaciones
                        </td>
                      </tr>
                    ) : (
                      invitations.map((inv) => (
                        <tr key={inv.id} className="border-b border-secondary-100">
                          <td className="py-3 px-4 text-sm text-secondary-900">{inv.email}</td>
                          <td className="py-3 px-4 text-sm text-secondary-600">{inv.student_name || '-'}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                inv.status === 'accepted' ? 'success' :
                                inv.status === 'sent' ? 'info' :
                                inv.status === 'expired' ? 'error' : 'warning'
                              }
                            >
                              {inv.status_display}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-secondary-600">
                            {inv.sent_at ? new Date(inv.sent_at).toLocaleDateString('es-ES') : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-secondary-600">
                            {inv.expires_at ? new Date(inv.expires_at).toLocaleDateString('es-ES') : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Agregar Participante"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Email del estudiante"
            type="email"
            value={newStudentEmail}
            onChange={(e) => setNewStudentEmail(e.target.value)}
            placeholder="estudiante@ejemplo.com"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsEnrollModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEnrollStudent}>
              Agregar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => { setIsInviteModalOpen(false); setInviteResult(null); }}
        title="Enviar Invitaciones"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Emails de invitados (separados por coma)
            </label>
            <textarea
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
              placeholder="email1@test.com, email2@test.com, email3@test.com"
              className="w-full h-32 p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-secondary-500 mt-1">
              Ingresa los emails separados por comas
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => { setIsInviteModalOpen(false); setInviteResult(null); }}>
              Cancelar
            </Button>
            <Button onClick={handleSendInvitations} disabled={isSendingInvites || !inviteEmails.trim()} isLoading={isSendingInvites}>
              Enviar Invitaciones
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
