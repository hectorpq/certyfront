import api from './api';

// ─── Tipos (contrato de /api/analytics/*) ─────────────────────────────────────

export interface AnalyticsDashboard {
  source: 'orm' | 'synthetic';
  total_enrollments: number;
  unique_participants: number;
  unique_events: number;
  global_attendance_rate: number;
  attendance_by_category: Record<string, number>;
  attendance_by_month: Record<string, number>;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  confusion_matrix: number[][];
  cv_roc_auc_mean: number;
  cv_roc_auc_std: number;
}

export interface ModelInfo {
  source: string;
  n_rows: number;
  target_rate: number;
  best_model_name: string;
  results: Record<string, ModelMetrics>;
  feature_importances: { feature: string; importance: number }[] | null;
}

export interface PredictionInput {
  category: string;
  duration_hours: number;
  max_capacity: number;
  is_public: 0 | 1;
  event_dow: number;
  event_month: number;
  lead_time_days: number;
  near_holiday: 0 | 1;
  was_invited: 0 | 1;
  invitation_accepted: 0 | 1;
  participant_prior_events: number;
  participant_prior_rate: number;
}

export type RiskLevel = 'alto' | 'medio' | 'bajo';

export interface PredictionResult {
  will_attend: boolean;
  attendance_probability: number;
  risk_level: RiskLevel;
  recommendation: string;
  features_used: Record<string, number | string>;
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

export const analyticsService = {
  getDashboard: async (): Promise<AnalyticsDashboard> => {
    const { data } = await api.get<AnalyticsDashboard>('/api/analytics/dashboard/');
    return data;
  },

  getModelInfo: async (): Promise<ModelInfo> => {
    const { data } = await api.get<ModelInfo>('/api/analytics/model-info/');
    return data;
  },

  predict: async (input: PredictionInput): Promise<PredictionResult> => {
    const { data } = await api.post<PredictionResult>('/api/analytics/predict-attendance/', input);
    return data;
  },
};

// ─── Utilidades de presentación ───────────────────────────────────────────────

const FEATURE_LABELS: Record<string, string> = {
  invitation_accepted: 'Aceptó la invitación',
  near_holiday: 'Cerca de feriado',
  is_public: 'Evento público',
  was_invited: 'Fue invitado',
  lead_time_days: 'Anticipación de inscripción',
  duration_hours: 'Duración del evento',
  max_capacity: 'Aforo máximo',
  participant_prior_events: 'Eventos previos del participante',
  participant_prior_rate: 'Asistencia previa del participante',
  event_dow: 'Día de la semana',
  event_month: 'Mes del evento',
};

export const CATEGORY_LABELS: Record<string, string> = {
  Tecnologia: 'Tecnología', Gestion: 'Gestión', Idiomas: 'Idiomas',
  Salud: 'Salud', Educacion: 'Educación', Finanzas: 'Finanzas',
};

/** Convierte "num__lead_time_days" o "cat__category_Salud" en una etiqueta legible. */
export const featureLabel = (raw: string): string => {
  const name = raw.replace(/^(num|cat|remainder)__/, '');
  if (name.startsWith('category_')) {
    const cat = name.slice('category_'.length);
    return `Categoría: ${CATEGORY_LABELS[cat] ?? cat}`;
  }
  return FEATURE_LABELS[name] ?? name;
};

/** Mes "2026-07" -> "Jul 2026". Devuelve null para meses futuros (aún sin asistencia). */
export const monthLabel = (key: string, now: Date = new Date()): string | null => {
  const [y, m] = key.split('-').map(Number);
  if (!y || !m) return null;
  if (y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth() + 1)) return null;
  const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${names[m - 1]} ${y}`;
};

/** Fecha ISO (yyyy-mm-dd) -> día de la semana con lunes = 0 (igual que pandas). */
export const dayOfWeek = (isoDate: string): number => {
  const d = new Date(`${isoDate}T12:00:00`);
  return (d.getDay() + 6) % 7;
};
