import { Award, Users, Clock, CheckCircle, XCircle, FileSpreadsheet, Plus, TrendingUp, Bell, Search, ChevronDown, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCertificates } from '@/hooks/useCertificates';
import { useStudents } from '@/hooks/useStudents';
import { useThemeContext } from '@/App';
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const KPI_CONFIG = [
  {
    label: 'Certificados Emitidos',
    icon: FileSpreadsheet,
    gradient: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)',
    iconBg: 'rgba(255,255,255,0.20)',
    darkGradient: 'linear-gradient(135deg, #1565C0 0%, #2962FF 50%, #448AFF 100%)',
    trend: '+18.5%',
    glowLight: 'rgba(37,99,235,0.28)',
    glowDark: 'rgba(41,98,255,0.35)',
  },
  {
    label: 'Destinatarios Únicos',
    icon: Users,
    gradient: 'linear-gradient(135deg, #065F46 0%, #059669 50%, #34D399 100%)',
    iconBg: 'rgba(255,255,255,0.20)',
    darkGradient: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #34D399 100%)',
    trend: '+12.3%',
    glowLight: 'rgba(5,150,105,0.28)',
    glowDark: 'rgba(52,211,153,0.30)',
  },
  {
    label: 'Plantillas Activas',
    icon: Award,
    gradient: 'linear-gradient(135deg, #92400E 0%, #D97706 50%, #F59E0B 100%)',
    iconBg: 'rgba(255,255,255,0.20)',
    darkGradient: 'linear-gradient(135deg, #78350F 0%, #D97706 50%, #FF9F43 100%)',
    trend: '+7.2%',
    glowLight: 'rgba(217,119,6,0.28)',
    glowDark: 'rgba(255,159,67,0.32)',
  },
];

const PROGRESS_COLORS = [
  { bar: 'linear-gradient(90deg, #F59E0B, #FBBF24)', dot: '#F59E0B' },
  { bar: 'linear-gradient(90deg, #059669, #34D399)', dot: '#059669' },
  { bar: 'linear-gradient(90deg, #2563EB, #60A5FA)', dot: '#2563EB' },
  { bar: 'linear-gradient(90deg, #DC2626, #F87171)', dot: '#DC2626' },
];

export const DashboardPage = () => {
  const { isDark, toggle } = useThemeContext();
  const { data: certificatesData } = useCertificates();
  const { data: studentsData } = useStudents();

  const total = certificatesData?.count || 0;
  const sentCount = certificatesData?.results?.filter(c => c.status === 'sent').length || 0;
  const successRate = total ? Math.round((sentCount / total) * 100) : 0;
  const kpiValues = [total, studentsData?.count || 0, 0];

  const monthlyData = (() => {
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const now = new Date();
    const buckets: Record<string, { mes: string; emitidos: number; enviados: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      buckets[key] = { mes: months[d.getMonth()], emitidos: 0, enviados: 0 };
    }
    certificatesData?.results?.forEach(c => {
      if (!c.created_at) return;
      const d = new Date(c.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (buckets[key]) {
        buckets[key].emitidos++;
        if (c.status === 'sent') buckets[key].enviados++;
      }
    });
    return Object.values(buckets);
  })();

  const statusStats = certificatesData?.results?.reduce(
    (acc, cert) => {
      if (cert.status === 'pending') acc.pending++;
      if (cert.status === 'generated') acc.generated++;
      if (cert.status === 'sent') acc.sent++;
      if (cert.status === 'failed') acc.failed++;
      return acc;
    },
    { pending: 0, generated: 0, sent: 0, failed: 0 }
  ) || { pending: 0, generated: 0, sent: 0, failed: 0 };

  const statusRows = [
    { label: 'Pendientes', icon: Clock, color: PROGRESS_COLORS[0], count: statusStats.pending },
    { label: 'Generados', icon: CheckCircle, color: PROGRESS_COLORS[1], count: statusStats.generated },
    { label: 'Enviados', icon: FileSpreadsheet, color: PROGRESS_COLORS[2], count: statusStats.sent },
    { label: 'Fallidos', icon: XCircle, color: PROGRESS_COLORS[3], count: statusStats.failed },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Topbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{
          flex: 1, maxWidth: 380,
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14, padding: '0 16px', height: 44,
          boxShadow: '0 2px 12px rgba(37,99,235,0.07)',
        }}>
          <Search style={{ width: 15, height: 15, color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            placeholder="Buscar certificados, destinatarios..."
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Inter, system-ui',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={toggle}
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(37,99,235,0.07)',
              transition: 'all 200ms ease',
            }}
          >
            {isDark
              ? <Sun style={{ width: 17, height: 17, color: '#F4B400' }} />
              : <Moon style={{ width: 17, height: 17, color: '#475569' }} />
            }
          </button>

          <button style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position: 'relative',
            boxShadow: '0 2px 10px rgba(37,99,235,0.07)',
          }}>
            <Bell style={{ width: 17, height: 17, color: 'var(--text-secondary)' }} />
            <span style={{
              position: 'absolute', top: 9, right: 9,
              width: 7, height: 7, borderRadius: '50%',
              background: '#EF4444',
              border: '2px solid var(--bg-card)',
            }} />
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '6px 12px 6px 6px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(37,99,235,0.07)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #1E40AF, #2563EB, #60A5FA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>AD</span>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>Admin</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>Administrador</p>
            </div>
            <ChevronDown style={{ width: 13, height: 13, color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* ── Hero banner ── */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, #0D1117 0%, #0F1729 40%, #111C3A 70%, #162040 100%)'
          : 'linear-gradient(135deg, #1E3A5F 0%, #1E40AF 45%, #2563EB 75%, #3B82F6 100%)',
        borderRadius: 22,
        padding: '34px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
        boxShadow: isDark
          ? '0 8px 40px rgba(41,98,255,0.20)'
          : '0 8px 40px rgba(37,99,235,0.32)',
      }}>
        {/* Círculos decorativos */}
        <div style={{
          position: 'absolute', right: -60, top: -60,
          width: 260, height: 260, borderRadius: '50%',
          background: isDark ? 'rgba(41,98,255,0.08)' : 'rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 100, bottom: -80,
          width: 200, height: 200, borderRadius: '50%',
          background: isDark ? 'rgba(96,165,250,0.06)' : 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: '40%', top: -30,
          width: 120, height: 120, borderRadius: '50%',
          background: isDark ? 'rgba(244,180,0,0.05)' : 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: 'Poppins, Inter, system-ui',
            fontSize: 28, fontWeight: 700, color: '#fff',
            margin: '0 0 8px', lineHeight: 1.2,
          }}>
            ¡Bienvenido, Admin! 👋
          </h1>
          <p style={{ fontSize: 14, color: isDark ? 'rgba(160,174,192,0.90)' : 'rgba(186,216,255,0.88)', margin: 0, maxWidth: 380 }}>
            Gestiona y protege tus certificaciones con{' '}
            <strong style={{ color: isDark ? '#FF9F43' : '#F4B400' }}>CertyPro.</strong>
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 76, height: 76, borderRadius: 22,
            background: isDark ? 'rgba(41,98,255,0.25)' : 'rgba(255,255,255,0.16)',
            border: `1px solid ${isDark ? 'rgba(41,98,255,0.40)' : 'rgba(255,255,255,0.28)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isDark ? '0 8px 28px rgba(41,98,255,0.30)' : '0 8px 28px rgba(0,0,0,0.22)',
          }}>
            <Award style={{ width: 34, height: 34, color: isDark ? '#FF9F43' : '#F4B400' }} />
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: isDark ? '#059669' : '#059669',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(5,150,105,0.50)',
            marginTop: -18,
          }}>
            <CheckCircle style={{ width: 26, height: 26, color: '#fff' }} />
          </div>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {KPI_CONFIG.map((kpi, idx) => {
          const Icon = kpi.icon;
          const value = kpiValues[idx] ?? 0;
          return (
            <div
              key={kpi.label}
              style={{
                background: isDark ? kpi.darkGradient : kpi.gradient,
                borderRadius: 20,
                padding: '24px 26px',
                display: 'flex', flexDirection: 'column', gap: 16,
                boxShadow: isDark
                  ? `0 8px 32px ${kpi.glowDark}`
                  : `0 8px 32px ${kpi.glowLight}`,
                position: 'relative', overflow: 'hidden',
                transition: 'transform 250ms ease, box-shadow 250ms ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = isDark
                  ? `0 16px 48px ${kpi.glowDark}`
                  : `0 16px 48px ${kpi.glowLight}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = isDark
                  ? `0 8px 32px ${kpi.glowDark}`
                  : `0 8px 32px ${kpi.glowLight}`;
              }}
            >
              {/* Círculo decorativo */}
              <div style={{
                position: 'absolute', right: -20, bottom: -20,
                width: 100, height: 100, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', right: 30, top: -30,
                width: 70, height: 70, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                pointerEvents: 'none',
              }} />

              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 1,
              }}>
                <Icon style={{ width: 22, height: 22, color: '#fff' }} />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{
                  fontFamily: 'Montserrat, Inter, monospace',
                  fontSize: 36, fontWeight: 800,
                  color: '#fff', lineHeight: 1, margin: 0,
                  textShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  {value}
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 5, fontWeight: 500, margin: '5px 0 0' }}>
                  {kpi.label}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5, position: 'relative', zIndex: 1 }}>
                <TrendingUp style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.80)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                  {kpi.trend}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
                  vs mes anterior
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Gráfico + Estadísticas en la misma fila ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Tendencia de Certificados */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 20, padding: '26px 28px',
          boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 24px rgba(37,99,235,0.08)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Poppins, Inter', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Tendencia de Certificados
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0' }}>
              Últimos 6 meses — emitidos vs enviados
            </p>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#1E293B' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: 12, fontSize: 13,
                  color: 'var(--text-primary)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
              />
              <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 13, paddingTop: 16 }} />
              <Line type="monotone" dataKey="emitidos" name="Emitidos" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 5, fill: '#2563EB', strokeWidth: 0 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="enviados" name="Enviados" stroke="#059669" strokeWidth={2.5} dot={{ r: 5, fill: '#059669', strokeWidth: 0 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Estadísticas de Emisiones */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 20, padding: '26px 28px',
          boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 24px rgba(37,99,235,0.08)',
          border: '1px solid var(--border)',
        }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'Poppins, Inter', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Estadísticas de Emisiones
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3, margin: '3px 0 0' }}>
              Distribución por estado actual
            </p>
          </div>
          <button style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: '7px 14px',
            fontSize: 12, color: 'var(--text-secondary)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            Este mes <ChevronDown style={{ width: 12, height: 12 }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {statusRows.map(({ label, icon: Icon, color, count }) => {
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={label}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9,
                      background: isDark ? 'var(--bg-secondary)' : `${color.dot}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${color.dot}30`,
                    }}>
                      <Icon style={{ width: 14, height: 14, color: color.dot }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct}%</span>
                    <span style={{
                      fontFamily: 'Montserrat, monospace',
                      fontSize: 16, fontWeight: 700,
                      color: 'var(--text-primary)',
                      minWidth: 24, textAlign: 'right',
                    }}>
                      {count}
                    </span>
                  </div>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: color.bar,
                    borderRadius: 999,
                    transition: 'width 600ms ease',
                    boxShadow: `0 2px 6px ${color.dot}50`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'flex', gap: 24, marginTop: 28,
          paddingTop: 22, borderTop: '1px solid var(--border)',
        }}>
          {[
            { label: 'Emitidos', value: total, color: isDark ? '#60A5FA' : '#2563EB' },
            { label: 'Enviados', value: sentCount, color: isDark ? '#34D399' : '#059669' },
            { label: 'Tasa de éxito', value: `${successRate}%`, color: isDark ? '#BB8CF6' : '#7C3AED' },
          ].map(item => (
            <div key={item.label}>
              <p style={{ fontFamily: 'Montserrat, monospace', fontSize: 24, fontWeight: 800, color: item.color, margin: 0 }}>
                {item.value}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '3px 0 0' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* ── Emisiones Recientes ── */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 20, padding: '26px 28px',
        boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 24px rgba(37,99,235,0.08)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Poppins, Inter', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Emisiones Recientes
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3, margin: '3px 0 0' }}>
              Últimos certificados emitidos
            </p>
          </div>
          <Link to="/certificates" style={{ fontSize: 13, color: isDark ? '#60A5FA' : '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
            Ver todos →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {certificatesData?.results?.slice(0, 5).map((cert, i) => {
            const avatarGrads = [
              { bg: 'linear-gradient(135deg, #1E40AF, #3B82F6)', text: '#fff' },
              { bg: 'linear-gradient(135deg, #065F46, #10B981)', text: '#fff' },
              { bg: 'linear-gradient(135deg, #6D28D9, #A78BFA)', text: '#fff' },
              { bg: 'linear-gradient(135deg, #92400E, #F59E0B)', text: '#fff' },
              { bg: 'linear-gradient(135deg, #991B1B, #F87171)', text: '#fff' },
            ];
            const av = avatarGrads[i % 5];
            return (
              <div key={cert.id ?? i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px', borderRadius: 14,
                background: 'transparent',
                border: '1px solid transparent',
                transition: 'all 150ms ease', cursor: 'pointer',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-secondary)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
              }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                  background: av.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: av.text,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  {cert.recipient_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') ?? '??'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cert.recipient_name ?? 'Desconocido'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {cert.template_name ?? 'Certificado'}
                  </p>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                    {cert.created_at ? new Date(cert.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </p>
                  <span style={{
                    display: 'inline-block', marginTop: 4,
                    fontSize: 10, fontWeight: 700,
                    padding: '3px 10px', borderRadius: 8,
                    background: cert.status === 'sent'
                      ? isDark ? 'rgba(52,211,153,0.15)' : '#D1FAE5'
                      : cert.status === 'pending'
                        ? isDark ? 'rgba(251,191,36,0.15)' : '#FEF3C7'
                        : isDark ? 'rgba(248,113,113,0.15)' : '#FEE2E2',
                    color: cert.status === 'sent'
                      ? isDark ? '#34D399' : '#065F46'
                      : cert.status === 'pending'
                        ? isDark ? '#FBBF24' : '#92400E'
                        : isDark ? '#F87171' : '#991B1B',
                  }}>
                    {cert.status === 'sent' ? '+Emitido' : cert.status === 'pending' ? 'Pendiente' : 'Error'}
                  </span>
                </div>
              </div>
            );
          })}

          {(!certificatesData?.results || certificatesData.results.length === 0) && (
            <div style={{ textAlign: 'center', padding: '36px 0' }}>
              <Award style={{ width: 38, height: 38, color: 'var(--border)', margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No hay certificados emitidos aún</p>
            </div>
          )}
        </div>
      </div>

      {/* ── FAB ── */}
      <Link to="/bulk-generate" style={{ position: 'fixed', bottom: 28, right: 28, textDecoration: 'none', zIndex: 30 }}>
        <button style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1E40AF, #2563EB, #3B82F6)',
          border: 'none', cursor: 'pointer', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 28px rgba(37,99,235,0.50)',
          transition: 'all 200ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.10)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(37,99,235,0.60)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.50)'; }}
        >
          <Plus style={{ width: 24, height: 24 }} />
        </button>
      </Link>

    </div>
  );
};