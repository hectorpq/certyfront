import { Award, Users, Calendar, Clock, CheckCircle, XCircle, FileSpreadsheet, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '@/components/ui';
import { useCertificates } from '@/hooks/useCertificates';
import { useEvents } from '@/hooks/useEvents';
import { useStudents } from '@/hooks/useStudents';

export const DashboardPage = () => {
  const { data: certificatesData } = useCertificates();
  const { data: eventsData } = useEvents({ status: 'active' });
  const { data: studentsData } = useStudents();

  const stats = [
    {
      label: 'Total Certificados',
      value: certificatesData?.count || 0,
      icon: Award,
      color: 'bg-blue-500',
    },
    {
      label: 'Estudiantes',
      value: studentsData?.count || 0,
      icon: Users,
      color: 'bg-emerald-500',
    },
    {
      label: 'Eventos Activos',
      value: eventsData?.count || 0,
      icon: Calendar,
      color: 'bg-purple-500',
    },
  ];

  const statusStats = certificatesData?.results?.reduce(
    (acc, cert) => {
      if (cert.status === 'pending') acc.pending++;
      else if (cert.status === 'generated') acc.generated++;
      else if (cert.status === 'sent') acc.sent++;
      else if (cert.status === 'failed') acc.failed++;
      return acc;
    },
    { pending: 0, generated: 0, sent: 0, failed: 0 }
  ) || { pending: 0, generated: 0, sent: 0, failed: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600">Resumen de tu sistema de certificados</p>
        </div>
        <Link to="/bulk-generate">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Generar Certificados
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="!p-0">
            <div className="flex items-center p-6">
              <div className={`${color} p-3 rounded-xl mr-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900">{value}</p>
                <p className="text-sm text-secondary-500">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Estado de Certificados" subtitle="Distribución por estado">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-secondary-700">Pendientes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-secondary-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${certificatesData?.count ? (statusStats.pending / certificatesData.count) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-secondary-900">{statusStats.pending}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium text-secondary-700">Generados</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-secondary-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${certificatesData?.count ? (statusStats.generated / certificatesData.count) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-secondary-900">{statusStats.generated}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-secondary-700">Enviados</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-secondary-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${certificatesData?.count ? (statusStats.sent / certificatesData.count) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-secondary-900">{statusStats.sent}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-secondary-700">Fallidos</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-secondary-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${certificatesData?.count ? (statusStats.failed / certificatesData.count) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-secondary-900">{statusStats.failed}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Eventos Recientes"
          subtitle="Eventos activos y próximos"
          action={
            <Link to="/events">
              <Button variant="ghost" size="sm">Ver todos</Button>
            </Link>
          }
        >
          <div className="space-y-3">
            {eventsData?.results?.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary-50"
              >
                <div>
                  <p className="font-medium text-secondary-900">{event.name}</p>
                  <p className="text-sm text-secondary-500">
                    {new Date(event.event_date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <Badge
                  variant={
                    event.status === 'active' ? 'success' :
                    event.status === 'draft' ? 'warning' :
                    event.status === 'finished' ? 'default' : 'error'
                  }
                >
                  {event.status}
                </Badge>
              </div>
            ))}
            {(!eventsData?.results || eventsData.results.length === 0) && (
              <p className="text-center text-secondary-500 py-4">No hay eventos activos</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
