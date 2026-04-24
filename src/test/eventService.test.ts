import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eventService } from '@/services/eventService';
import api from '@/services/api';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const mockEvent = {
  id: 1,
  name: 'Taller Python',
  event_date: '2026-06-15',
  status: 'active',
  is_active: true,
};

describe('eventService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getAll calls GET /api/events/', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { count: 1, results: [mockEvent] } });
    const result = await eventService.getAll();
    expect(mockApi.get).toHaveBeenCalledWith('/api/events/', { params: undefined });
    expect(result.results[0].name).toBe('Taller Python');
  });

  it('getAll passes status filter', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });
    await eventService.getAll({ status: 'finished' });
    expect(mockApi.get).toHaveBeenCalledWith('/api/events/', { params: { status: 'finished' } });
  });

  it('getById calls GET /api/events/:id/', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockEvent });
    const result = await eventService.getById(1);
    expect(mockApi.get).toHaveBeenCalledWith('/api/events/1/');
    expect(result).toEqual(mockEvent);
  });

  it('create calls POST /api/events/', async () => {
    mockApi.post.mockResolvedValueOnce({ data: mockEvent });
    const result = await eventService.create({ name: 'Taller Python', event_date: '2026-06-15' });
    expect(mockApi.post).toHaveBeenCalledWith('/api/events/', { name: 'Taller Python', event_date: '2026-06-15' });
    expect(result.id).toBe(1);
  });

  it('update calls PATCH /api/events/:id/', async () => {
    const updated = { ...mockEvent, name: 'Taller Actualizado' };
    mockApi.patch.mockResolvedValueOnce({ data: updated });
    const result = await eventService.update(1, { name: 'Taller Actualizado' });
    expect(mockApi.patch).toHaveBeenCalledWith('/api/events/1/', { name: 'Taller Actualizado' });
    expect(result.name).toBe('Taller Actualizado');
  });

  it('delete calls DELETE /api/events/:id/', async () => {
    mockApi.delete.mockResolvedValueOnce({});
    await eventService.delete(1);
    expect(mockApi.delete).toHaveBeenCalledWith('/api/events/1/');
  });

  it('propagates error on failed request', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('500'));
    await expect(eventService.getById(999)).rejects.toThrow('500');
  });
});
