import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyticsService, featureLabel, monthLabel, dayOfWeek } from '@/services/analyticsService';
import type { PredictionInput } from '@/services/analyticsService';
import api from '@/services/api';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

const input: PredictionInput = {
  category: 'Tecnologia',
  duration_hours: 8,
  max_capacity: 50,
  is_public: 1,
  event_dow: 2,
  event_month: 7,
  lead_time_days: 10,
  near_holiday: 0,
  was_invited: 1,
  invitation_accepted: 1,
  participant_prior_events: 3,
  participant_prior_rate: 0.8,
};

describe('analyticsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getDashboard llama al endpoint de dashboard', async () => {
    mockApi.get.mockResolvedValue({ data: { source: 'orm', total_enrollments: 10 } });
    const res = await analyticsService.getDashboard();
    expect(mockApi.get).toHaveBeenCalledWith('/api/analytics/dashboard/');
    expect(res.total_enrollments).toBe(10);
  });

  it('getModelInfo llama al endpoint de model-info', async () => {
    mockApi.get.mockResolvedValue({ data: { best_model_name: 'random_forest' } });
    const res = await analyticsService.getModelInfo();
    expect(mockApi.get).toHaveBeenCalledWith('/api/analytics/model-info/');
    expect(res.best_model_name).toBe('random_forest');
  });

  it('predict envia las caracteristicas y devuelve la prediccion', async () => {
    mockApi.post.mockResolvedValue({ data: { will_attend: true, attendance_probability: 0.81, risk_level: 'bajo' } });
    const res = await analyticsService.predict(input);
    expect(mockApi.post).toHaveBeenCalledWith('/api/analytics/predict-attendance/', input);
    expect(res.risk_level).toBe('bajo');
  });
});

describe('utilidades de analytics', () => {
  it('featureLabel traduce nombres del modelo', () => {
    expect(featureLabel('num__lead_time_days')).toBe('Anticipación de inscripción');
    expect(featureLabel('remainder__near_holiday')).toBe('Cerca de feriado');
    expect(featureLabel('cat__category_Salud')).toBe('Categoría: Salud');
    expect(featureLabel('cat__category_Educacion')).toBe('Categoría: Educación');
    expect(featureLabel('desconocida')).toBe('desconocida');
  });

  it('monthLabel formatea meses y descarta los futuros o invalidos', () => {
    const now = new Date(2026, 10, 15); // nov 2026
    expect(monthLabel('2026-07', now)).toBe('Jul 2026');
    expect(monthLabel('2026-11', now)).toBe('Nov 2026');
    expect(monthLabel('2026-12', now)).toBeNull();
    expect(monthLabel('2027-01', now)).toBeNull();
    expect(monthLabel('basura', now)).toBeNull();
  });

  it('dayOfWeek usa lunes = 0', () => {
    expect(dayOfWeek('2026-11-23')).toBe(0); // lunes
    expect(dayOfWeek('2026-11-29')).toBe(6); // domingo
  });
});
