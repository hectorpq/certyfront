import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  BrainCircuit, Users, Calendar, ClipboardList, Percent, Sparkles,
  CheckCircle2, AlertTriangle, AlertCircle, Loader2, Database, RotateCcw,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from 'recharts';
import { useThemeContext } from '@/contexts/ThemeContext';
import {
  analyticsService, featureLabel, monthLabel, dayOfWeek, CATEGORY_LABELS,
  type PredictionInput, type PredictionResult, type RiskLevel,
} from '@/services/analyticsService';
import { extractApiError } from '@/utils/errorHandling';

// ─── Constantes ───────────────────────────────────────────────────────────────

const CATEGORIES = Object.keys(CATEGORY_LABELS);
const MODEL_LABELS: Record<string, string> = {
  logistic_regression: 'Regresión Logística',
  random_forest: 'Random Forest',
};
// Feriados nacionales fijos de Perú (mes, día) — mismos que usa el modelo.
const HOLIDAYS: [number, number][] = [
  [1, 1], [5, 1], [6, 29], [7, 28], [7, 29], [8, 30], [10, 8], [11, 1], [12, 8], [12, 25],
];

interface FormState {
  category: string;
  event_date: string;
  duration_hours: number;
  max_capacity: number;
  is_public: boolean;
  near_holiday: boolean;
  lead_time_days: number;
  was_invited: boolean;
  invitation_accepted: boolean;
  participant_prior_events: number;
  participant_prior_rate: number; // 0–100 en la UI
}

const isoInDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const isNearHoliday = (iso: string) => {
  const base = new Date(`${iso}T12:00:00`);
  return [-2, -1, 0, 1, 2].some(delta => {
    const d = new Date(base);
    d.setDate(d.getDate() + delta);
    return HOLIDAYS.some(([m, day]) => d.getMonth() + 1 === m && d.getDate() === day);
  });
};

const PRESETS: { label: string; hint: string; values: Partial<FormState> }[] = [
  {
    label: 'Participante comprometido',
    hint: 'Se inscribió con anticipación y suele asistir',
    values: {
      category: 'Gestion', duration_hours: 8, is_public: true, lead_time_days: 25,
      was_invited: true, invitation_accepted: true, participant_prior_events: 5, participant_prior_rate: 90,
    },
  },
  {
    label: 'Caso promedio',
    hint: 'Inscripción normal, sin historial',
    values: {
      category: 'Tecnologia', duration_hours: 16, is_public: false, lead_time_days: 7,
      was_invited: true, invitation_accepted: false, participant_prior_events: 0, participant_prior_rate: 50,
    },
  },
  {
    label: 'Riesgo de ausencia',
    hint: 'Último momento, evento largo, poco historial',
    values: {
      category: 'Educacion', duration_hours: 40, is_public: false, lead_time_days: 0,
      was_invited: false, invitation_accepted: false, participant_prior_events: 4, participant_prior_rate: 20,
    },
  },
];

const DEFAULT_FORM: FormState = {
  category: 'Tecnologia',
  event_date: isoInDays(14),
  duration_hours: 8,
  max_capacity: 50,
  is_public: true,
  near_holiday: isNearHoliday(isoInDays(14)),
  lead_time_days: 10,
  was_invited: true,
  invitation_accepted: true,
  participant_prior_events: 2,
  participant_prior_rate: 75,
};

const toInput = (f: FormState): PredictionInput => ({
  category: f.category,
  duration_hours: f.duration_hours,
  max_capacity: f.max_capacity,
  is_public: f.is_public ? 1 : 0,
  event_dow: dayOfWeek(f.event_date),
  event_month: Number(f.event_date.slice(5, 7)),
  lead_time_days: f.lead_time_days,
  near_holiday: f.near_holiday ? 1 : 0,
  was_invited: f.was_invited ? 1 : 0,
  invitation_accepted: f.was_invited && f.invitation_accepted ? 1 : 0,
  participant_prior_events: f.participant_prior_events,
  participant_prior_rate: f.participant_prior_rate / 100,
});

const pct = (v: number, digits = 0) => `${(v * 100).toFixed(digits)}%`;

// ─── Piezas de UI ─────────────────────────────────────────────────────────────

const cardStyle = (isDark: boolean): CSSProperties => ({
  background: 'var(--bg-card)',
  borderRadius: 20,
  padding: '24px 26px',
  border: '1px solid var(--border)',
  boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 24px rgba(37,99,235,0.08)',
  minWidth: 0,
});

const SectionTitle = ({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
    <div>
      <h3 style={{ fontFamily: 'Poppins, Inter', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
        {title}
      </h3>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0' }}>{subtitle}</p>}
    </div>
    {right}
  </div>
);

const fieldLabel: CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6,
};
const inputStyle: CSSProperties = {
  width: '100%', height: 42, borderRadius: 11, padding: '0 12px',
  border: '1px solid var(--border)', background: 'var(--bg-secondary)',
  color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'Inter, system-ui',
};

const NumberField = ({ label, value, onChange, min = 0, max, suffix, help }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; suffix?: string; help?: string;
}) => (
  <label style={{ display: 'block' }}>
    <span style={fieldLabel}>{label}{suffix && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}> ({suffix})</span>}</span>
    <input
      type="number" min={min} max={max} value={value}
      onChange={e => {
        const n = Number(e.target.value);
        onChange(Number.isFinite(n) ? Math.max(min, max !== undefined ? Math.min(max, n) : n) : min);
      }}
      style={inputStyle}
    />
    {help && <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{help}</span>}
  </label>
);

const Toggle = ({ label, checked, onChange, disabled, help }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; help?: string;
}) => (
  <label style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border)',
    background: 'var(--bg-secondary)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
  }}>
    <span>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
      {help && <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{help}</span>}
    </span>
    <input
      type="checkbox" checked={checked} disabled={disabled}
      onChange={e => onChange(e.target.checked)}
      style={{ width: 18, height: 18, accentColor: '#2563EB', flexShrink: 0 }}
    />
  </label>
);

const RISK_STYLE: Record<RiskLevel, {
  label: string; icon: typeof CheckCircle2; light: string; dark: string; softLight: string; softDark: string;
}> = {
  bajo:  { label: 'Riesgo bajo',  icon: CheckCircle2,  light: '#059669', dark: '#34D399', softLight: '#D1FAE5', softDark: 'rgba(52,211,153,0.14)' },
  medio: { label: 'Riesgo medio', icon: AlertCircle,   light: '#D97706', dark: '#FBBF24', softLight: '#FEF3C7', softDark: 'rgba(251,191,36,0.14)' },
  alto:  { label: 'Riesgo alto',  icon: AlertTriangle, light: '#DC2626', dark: '#F87171', softLight: '#FEE2E2', softDark: 'rgba(248,113,113,0.14)' },
};

const ResultPanel = ({ result, isDark }: { result: PredictionResult; isDark: boolean }) => {
  const risk = RISK_STYLE[result.risk_level];
  const RiskIcon = risk.icon;
  const color = isDark ? risk.dark : risk.light;
  const prob = result.attendance_probability;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Probabilidad de asistencia</p>
        <p style={{
          fontFamily: 'Montserrat, Inter, monospace', fontSize: 56, fontWeight: 800, lineHeight: 1.05,
          color: 'var(--text-primary)', margin: '4px 0 0',
        }}>
          {pct(prob, 1)}
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '6px 0 0' }}>
          El modelo predice que el participante <strong style={{ color: 'var(--text-primary)' }}>
            {result.will_attend ? 'SÍ asistirá' : 'NO asistirá'}
          </strong>.
        </p>
      </div>

      {/* Medidor con umbrales de riesgo (40% y 70%) */}
      <div role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(prob * 100)} aria-label="Probabilidad de asistencia">
        <div style={{ position: 'relative', height: 12, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0, width: `${prob * 100}%`, background: color,
            borderRadius: 999, transition: 'width 600ms ease',
          }} />
          {[40, 70].map(t => (
            <div key={t} style={{ position: 'absolute', top: 0, bottom: 0, left: `${t}%`, width: 2, background: 'var(--bg-card)' }} />
          ))}
        </div>
        <div style={{ position: 'relative', height: 16, marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
          <span style={{ position: 'absolute', left: 0 }}>0%</span>
          <span style={{ position: 'absolute', left: '40%', transform: 'translateX(-50%)' }}>40%</span>
          <span style={{ position: 'absolute', left: '70%', transform: 'translateX(-50%)' }}>70%</span>
          <span style={{ position: 'absolute', right: 0 }}>100%</span>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 14,
        background: isDark ? risk.softDark : risk.softLight, border: `1px solid ${color}40`,
      }}>
        <RiskIcon style={{ width: 22, height: 22, color, flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{risk.label}</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0 0' }}>
            Recomendación: <strong style={{ color: 'var(--text-primary)' }}>{result.recommendation}</strong>
          </p>
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
        Umbrales: menos de 40% = riesgo alto · 40–70% = medio · más de 70% = bajo.
      </p>
    </div>
  );
};

const ChartTooltipStyle = (isDark: boolean): CSSProperties => ({
  background: isDark ? '#1E293B' : '#fff',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
  borderRadius: 12, fontSize: 13, color: 'var(--text-primary)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
});

const EmptyState = ({ icon: Icon, text }: { icon: typeof Database; text: string }) => (
  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
    <Icon style={{ width: 36, height: 36, margin: '0 auto 10px', opacity: 0.5 }} />
    <p style={{ fontSize: 13, margin: 0 }}>{text}</p>
  </div>
);

// ─── Página ───────────────────────────────────────────────────────────────────

export const PredictionsPage = () => {
  const { isDark } = useThemeContext();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(f => ({ ...f, [key]: value }));

  const dashboardQ = useQuery({ queryKey: ['analytics', 'dashboard'], queryFn: analyticsService.getDashboard });
  const modelQ = useQuery({ queryKey: ['analytics', 'model-info'], queryFn: analyticsService.getModelInfo, retry: false });
  const predictM = useMutation({ mutationFn: analyticsService.predict });

  const series = isDark ? '#60A5FA' : '#2563EB';
  const gridStroke = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const axisTick = { fontSize: 12, fill: 'var(--text-muted)' };

  const dash = dashboardQ.data;
  const byCategory = useMemo(() =>
    Object.entries(dash?.attendance_by_category ?? {})
      .map(([cat, rate]) => ({ name: CATEGORY_LABELS[cat] ?? cat, rate: Math.round(rate * 1000) / 10 }))
      .sort((a, b) => b.rate - a.rate),
  [dash]);
  const byMonth = useMemo(() =>
    Object.entries(dash?.attendance_by_month ?? {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, rate]) => ({ name: monthLabel(key), rate: Math.round(rate * 1000) / 10 }))
      .filter((d): d is { name: string; rate: number } => d.name !== null),
  [dash]);

  const model = modelQ.data;
  const importances = useMemo(() =>
    (model?.feature_importances ?? []).slice(0, 8).map(f => ({ name: featureLabel(f.feature), value: f.importance })),
  [model]);

  const applyPreset = (values: Partial<FormState>) => {
    setForm(f => ({ ...f, ...values }));
    predictM.reset();
  };

  const kpis = [
    { label: 'Inscripciones analizadas', value: dash?.total_enrollments, icon: ClipboardList },
    { label: 'Participantes', value: dash?.unique_participants, icon: Users },
    { label: 'Eventos', value: dash?.unique_events, icon: Calendar },
    { label: 'Tasa de asistencia', value: dash ? pct(dash.global_attendance_rate, 1) : undefined, icon: Percent },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Encabezado ── */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, #0D1117 0%, #0F1729 40%, #111C3A 70%, #162040 100%)'
          : 'linear-gradient(135deg, #1E3A5F 0%, #1E40AF 45%, #2563EB 75%, #3B82F6 100%)',
        borderRadius: 22, padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        boxShadow: isDark ? '0 8px 40px rgba(41,98,255,0.20)' : '0 8px 40px rgba(37,99,235,0.32)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, flexShrink: 0,
            background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BrainCircuit style={{ width: 28, height: 28, color: '#F4B400' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Poppins, Inter, system-ui', fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>
              Predicción de Asistencia
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(186,216,255,0.90)', margin: '4px 0 0', maxWidth: 560 }}>
              Modelo de Machine Learning (CRISP-DM) que estima si un participante inscrito asistirá al evento,
              para enviar recordatorios a tiempo.
            </p>
          </div>
        </div>
        {model && (
          <div style={{
            padding: '10px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.22)', color: '#fff',
          }}>
            <p style={{ fontSize: 11, opacity: 0.8, margin: 0 }}>Modelo en producción</p>
            <p style={{ fontSize: 15, fontWeight: 700, margin: '2px 0 0' }}>
              {MODEL_LABELS[model.best_model_name] ?? model.best_model_name}
              <span style={{ fontWeight: 500, opacity: 0.85 }}> · ROC-AUC {model.results[model.best_model_name]?.roc_auc.toFixed(2)}</span>
            </p>
          </div>
        )}
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4" style={{ gap: 16 }}>
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} style={{ ...cardStyle(isDark), padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: isDark ? 'rgba(96,165,250,0.12)' : '#EFF6FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon style={{ width: 20, height: 20, color: series }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: 'Montserrat, Inter, monospace', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {dashboardQ.isLoading ? '…' : value ?? '—'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>
      {dash?.source === 'synthetic' && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '-12px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Database style={{ width: 13, height: 13 }} />
          Aún hay pocas inscripciones reales (menos de 200): las estadísticas usan datos sintéticos de referencia.
        </p>
      )}

      {/* ── Formulario + Resultado ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5" style={{ gap: 20 }}>
        <div className="xl:col-span-3" style={cardStyle(isDark)}>
          <SectionTitle title="Datos de la inscripción" subtitle="Completa los datos y pulsa “Predecir asistencia”" />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {PRESETS.map(p => (
              <button
                key={p.label} type="button" title={p.hint}
                onClick={() => applyPreset(p.values)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Sparkles style={{ width: 13, height: 13, color: series }} /> {p.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={e => { e.preventDefault(); predictM.mutate(toInput(form)); }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: series, marginBottom: 12 }}>
                Evento
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 14 }}>
                <label style={{ display: 'block' }}>
                  <span style={fieldLabel}>Categoría</span>
                  <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </label>
                <label style={{ display: 'block' }}>
                  <span style={fieldLabel}>Fecha del evento</span>
                  <input
                    type="date" value={form.event_date} style={inputStyle}
                    onChange={e => {
                      const v = e.target.value;
                      if (v) setForm(f => ({ ...f, event_date: v, near_holiday: isNearHoliday(v) }));
                    }}
                  />
                </label>
                <NumberField label="Duración" suffix="horas" value={form.duration_hours} min={1} max={200} onChange={v => set('duration_hours', v)} />
                <NumberField label="Aforo máximo" suffix="personas" value={form.max_capacity} min={1} max={5000} onChange={v => set('max_capacity', v)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10, marginTop: 14 }}>
                <Toggle label="Evento público" checked={form.is_public} onChange={v => set('is_public', v)} />
                <Toggle
                  label="Cerca de un feriado" checked={form.near_holiday} onChange={v => set('near_holiday', v)}
                  help="Se marca solo según la fecha (±2 días)"
                />
              </div>
            </fieldset>

            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: series, marginBottom: 12 }}>
                Participante
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 14 }}>
                <NumberField
                  label="Anticipación de inscripción" suffix="días" value={form.lead_time_days} min={0} max={365}
                  onChange={v => set('lead_time_days', v)} help="Días entre la inscripción y el evento"
                />
                <NumberField
                  label="Eventos anteriores" value={form.participant_prior_events} min={0} max={200}
                  onChange={v => set('participant_prior_events', v)} help="En cuántos eventos se inscribió antes"
                />
              </div>
              <label style={{ display: 'block', marginTop: 14 }}>
                <span style={{ ...fieldLabel, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Asistencia en eventos anteriores</span>
                  <span style={{ color: 'var(--text-primary)' }}>{form.participant_prior_rate}%</span>
                </span>
                <input
                  type="range" min={0} max={100} step={5} value={form.participant_prior_rate}
                  onChange={e => set('participant_prior_rate', Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#2563EB' }}
                  disabled={form.participant_prior_events === 0}
                />
                {form.participant_prior_events === 0 && (
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>
                    Sin historial: el modelo asume 50%.
                  </span>
                )}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10, marginTop: 14 }}>
                <Toggle
                  label="Fue invitado" checked={form.was_invited}
                  onChange={v => setForm(f => ({ ...f, was_invited: v, invitation_accepted: v ? f.invitation_accepted : false }))}
                />
                <Toggle
                  label="Aceptó la invitación" checked={form.invitation_accepted} disabled={!form.was_invited}
                  onChange={v => set('invitation_accepted', v)}
                />
              </div>
            </fieldset>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="submit" disabled={predictM.isPending}
                style={{
                  flex: 1, minWidth: 200, height: 48, borderRadius: 13, border: 'none',
                  background: 'linear-gradient(135deg, #1E40AF, #2563EB, #3B82F6)', color: '#fff',
                  fontSize: 15, fontWeight: 700, cursor: predictM.isPending ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
                }}
              >
                {predictM.isPending
                  ? <><Loader2 className="animate-spin" style={{ width: 18, height: 18 }} /> Calculando…</>
                  : <><BrainCircuit style={{ width: 18, height: 18 }} /> Predecir asistencia</>}
              </button>
              <button
                type="button" onClick={() => { setForm(DEFAULT_FORM); predictM.reset(); }}
                style={{
                  height: 48, padding: '0 16px', borderRadius: 13, border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <RotateCcw style={{ width: 15, height: 15 }} /> Limpiar
              </button>
            </div>
          </form>
        </div>

        <div className="xl:col-span-2" style={cardStyle(isDark)}>
          <SectionTitle title="Resultado" subtitle="Predicción del modelo" />
          {predictM.isError && (
            <div style={{
              display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 12, marginBottom: 16,
              background: isDark ? 'rgba(248,113,113,0.12)' : '#FEE2E2', color: 'var(--text-primary)', fontSize: 13,
            }}>
              <AlertTriangle style={{ width: 18, height: 18, color: isDark ? '#F87171' : '#DC2626', flexShrink: 0 }} />
              <span>
                No se pudo calcular la predicción: {extractApiError(predictM.error) ?? 'el servidor no respondió'}.
                Si el servidor estaba dormido, espera unos segundos y vuelve a intentar.
              </span>
            </div>
          )}
          {predictM.data
            ? <ResultPanel result={predictM.data} isDark={isDark} />
            : !predictM.isError && <EmptyState icon={BrainCircuit} text="Completa el formulario y pulsa “Predecir asistencia”." />}
        </div>
      </div>

      {/* ── Gráficos de asistencia ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2" style={{ gap: 20 }}>
        <div style={cardStyle(isDark)}>
          <SectionTitle title="Asistencia por categoría" subtitle="Porcentaje de inscritos que asistieron" />
          {byCategory.length === 0
            ? <EmptyState icon={Database} text={dashboardQ.isLoading ? 'Cargando…' : 'Sin datos todavía'} />
            : (
              <ResponsiveContainer width="100%" height={Math.max(220, byCategory.length * 44)}>
                <BarChart data={byCategory} layout="vertical" margin={{ top: 0, right: 48, left: 8, bottom: 0 }} barCategoryGap={10}>
                  <CartesianGrid horizontal={false} stroke={gridStroke} />
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={92} tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(37,99,235,0.05)' }}
                    contentStyle={ChartTooltipStyle(isDark)}
                    formatter={(v) => [`${v}%`, 'Asistencia']}
                  />
                  <Bar dataKey="rate" fill={series} radius={[0, 4, 4, 0]} barSize={16}>
                    <LabelList dataKey="rate" position="right" formatter={(v: unknown) => `${v}%`} style={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>

        <div style={cardStyle(isDark)}>
          <SectionTitle title="Asistencia por mes" subtitle="Eventos ya realizados" />
          {byMonth.length === 0
            ? <EmptyState icon={Database} text={dashboardQ.isLoading ? 'Cargando…' : 'Sin datos todavía'} />
            : (
              <ResponsiveContainer width="100%" height={264}>
                <LineChart data={byMonth} margin={{ top: 8, right: 32, left: -12, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} unit="%" tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={ChartTooltipStyle(isDark)} formatter={(v) => [`${v}%`, 'Asistencia']} />
                  <Line
                    type="monotone" dataKey="rate" stroke={series} strokeWidth={2}
                    dot={{ r: 4, fill: series, stroke: 'var(--bg-card)', strokeWidth: 2 }} activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>

      {/* ── Modelo ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5" style={{ gap: 20 }}>
        <div className="xl:col-span-3" style={cardStyle(isDark)}>
          <SectionTitle
            title="¿Qué tan bueno es el modelo?"
            subtitle={model ? `Entrenado con ${model.n_rows.toLocaleString('es-PE')} inscripciones · comparación de 2 algoritmos` : 'Métricas de evaluación'}
          />
          {!model
            ? <EmptyState icon={BrainCircuit} text={modelQ.isLoading ? 'Cargando…' : 'Métricas del modelo no disponibles'} />
            : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 6px', fontWeight: 600 }}>Algoritmo</th>
                      {['ROC-AUC', 'Exactitud', 'Precisión', 'Recall', 'F1'].map(h => (
                        <th key={h} style={{ padding: '8px 6px', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(model.results).map(([name, m]) => {
                      const best = name === model.best_model_name;
                      return (
                        <tr key={name} style={{ borderTop: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: best ? 700 : 400 }}>
                          <td style={{ padding: '10px 6px' }}>
                            {MODEL_LABELS[name] ?? name}
                            {best && (
                              <span style={{
                                marginLeft: 8, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                                background: isDark ? 'rgba(96,165,250,0.15)' : '#DBEAFE', color: isDark ? '#93C5FD' : '#1E40AF',
                              }}>ELEGIDO</span>
                            )}
                          </td>
                          {[m.roc_auc, m.accuracy, m.precision, m.recall, m.f1].map((v, i) => (
                            <td key={i} style={{ padding: '10px 6px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{pct(v, 1)}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <ul style={{ margin: '18px 0 0', paddingLeft: 18, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  <li><strong style={{ color: 'var(--text-secondary)' }}>ROC-AUC</strong>: capacidad de distinguir entre quien asiste y quien no (1 = perfecto, 0.5 = azar).</li>
                  <li><strong style={{ color: 'var(--text-secondary)' }}>Precisión</strong>: de los que el modelo dice que asistirán, cuántos realmente asisten.</li>
                  <li><strong style={{ color: 'var(--text-secondary)' }}>Recall</strong>: de los que asisten, cuántos detecta el modelo.</li>
                </ul>
              </div>
            )}
        </div>

        <div className="xl:col-span-2" style={cardStyle(isDark)}>
          <SectionTitle title="Factores que más influyen" subtitle="Importancia de cada variable en el modelo elegido" />
          {importances.length === 0
            ? <EmptyState icon={BrainCircuit} text={modelQ.isLoading ? 'Cargando…' : 'Sin datos de importancia'} />
            : (
              <ResponsiveContainer width="100%" height={importances.length * 38 + 20}>
                <BarChart data={importances} layout="vertical" margin={{ top: 0, right: 48, left: 8, bottom: 0 }} barCategoryGap={8}>
                  <CartesianGrid horizontal={false} stroke={gridStroke} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={170} tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(37,99,235,0.05)' }}
                    contentStyle={ChartTooltipStyle(isDark)}
                    formatter={(v) => [Number(v).toFixed(3), 'Importancia']}
                  />
                  <Bar dataKey="value" fill={series} radius={[0, 4, 4, 0]} barSize={14}>
                    <LabelList dataKey="value" position="right" formatter={(v: unknown) => Number(v).toFixed(2)} style={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>
    </div>
  );
};
