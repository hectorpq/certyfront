import { Award, Users, Calendar, Clock, CheckCircle, XCircle, FileSpreadsheet, Plus, TrendingUp } from 'lucide-react';
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
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      label: 'Estudiantes',
      value: studentsData?.count || 0,
      icon: Users,
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    {
      label: 'Eventos Activos',
      value: eventsData?.count || 0,
      icon: Calendar,
      gradient: 'from-violet-500 to-violet-600',
      bg: 'bg-violet-50',
      text: 'text-violet-600',
    },
    {
      label: 'Tasa de Éxito',
      value: certificatesData?.count
        ? `${Math.round(((certificatesData.results?.filter(c => c.status === 'sent').length || 0) / certificatesData.count) * 100)}%`
        : '—',
      icon: TrendingUp,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
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

  const total = certificatesData?.count || 0;

  const statusRows = [
    { label: 'Pendientes', icon: Clock, color: 'bg-amber-500', count: statusStats.pending },
    { label: 'Generados', icon: CheckCircle, color: 'bg-emerald-500', count: statusStats.generated },
    { label: 'Enviados', icon: FileSpreadsheet, color: 'bg-blue-500', count: statusStats.sent },
    { label: 'Fallidos', icon: XCircle, color: 'bg-red-500', count: statusStats.failed },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-secondary-500 mt-0.5">Resumen de tu sistema de certificados</p>
        </div>
        <Link to="/bulk-generate">
          <Button size="md">
            <Plus className="w-4 h-4" />
            Generar Certificados
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, gradient }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-[0_1px_4px_0_rgba(0,0,0,0.06),0_4px_16px_0_rgba(0,0,0,0.06)] flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900 leading-none">{value}</p>
              <p className="text-xs font-medium text-secondary-500 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Certificate status */}
        <Card title="Estado de Certificados" subtitle="Distribución por estado actual">
          <div className="space-y-4">
            {statusRows.map(({ label, icon: Icon, color, count }) => {
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-secondary-700">{label}</span>
                      <span className="text-sm font-bold text-secondary-900 tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent events */}
        <Card
          title="Eventos Recientes"
          subtitle="Eventos activos y próximos"
          action={
            <Link to="/events">
              <Button variant="ghost" size="sm">Ver todos</Button>
            </Link>
          }
        >
          <div className="space-y-2">
            {eventsData?.results?.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-secondary-50 hover:bg-secondary-100 transition-colors"
              >
                <div className="min-w-0 mr-3">
                  <p className="text-sm font-semibold text-secondary-900 truncate">{event.name}</p>
                  <p className="text-xs text-secondary-500 mt-0.5">
                    {new Date(event.event_date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <Badge
                  dot
                  variant={
                    event.status === 'active'
                      ? 'success'
                      : event.status === 'draft'
                      ? 'warning'
                      : event.status === 'finished'
                      ? 'default'
                      : 'error'
                  }
                >
                  {event.status === 'active'
                    ? 'Activo'
                    : event.status === 'draft'
                    ? 'Borrador'
                    : event.status === 'finished'
                    ? 'Finalizado'
                    : 'Cancelado'}
                </Badge>
              </div>
            ))}
            {(!eventsData?.results || eventsData.results.length === 0) && (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-secondary-300 mx-auto mb-2" />
                <p className="text-sm text-secondary-500">No hay eventos activos</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
