import { describe, it, expect, beforeEach, vi } from 'vitest';
import { participantService } from '@/services/participantService';
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

const mockParticipant = {
  id: 1,
  document_id: '12345',
  first_name: 'Juan',
  last_name: 'Perez',
  email: 'juan@test.com',
  phone: '999888777',
  is_active: true,
};

describe('participantService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getAll calls GET /api/participants/ and returns paginated data', async () => {
    const mockResponse = { count: 1, results: [mockParticipant] };
    mockApi.get.mockResolvedValueOnce({ data: mockResponse });

    const result = await participantService.getAll();
    expect(mockApi.get).toHaveBeenCalledWith('/api/participants/', { params: undefined });
    expect(result).toEqual(mockResponse);
  });

  it('getAll passes search params', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });
    await participantService.getAll({ search: 'Juan', page: 2 });
    expect(mockApi.get).toHaveBeenCalledWith('/api/participants/', { params: { search: 'Juan', page: 2 } });
  });

  it('getById calls GET /api/participants/:id/', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockParticipant });
    const result = await participantService.getById(1);
    expect(mockApi.get).toHaveBeenCalledWith('/api/participants/1/');
    expect(result).toEqual(mockParticipant);
  });

  it('create calls POST /api/participants/ with data', async () => {
    const payload = { document_id: '99', first_name: 'Ana', last_name: 'Torres', email: 'ana@t.com', phone: '' };
    mockApi.post.mockResolvedValueOnce({ data: { ...mockParticipant, ...payload } });
    const result = await participantService.create(payload);
    expect(mockApi.post).toHaveBeenCalledWith('/api/participants/', payload);
    expect(result.first_name).toBe('Ana');
  });

  it('update calls PATCH /api/participants/:id/ with partial data', async () => {
    const updated = { ...mockParticipant, first_name: 'Carlos' };
    mockApi.patch.mockResolvedValueOnce({ data: updated });
    const result = await participantService.update(1, { first_name: 'Carlos' });
    expect(mockApi.patch).toHaveBeenCalledWith('/api/participants/1/', { first_name: 'Carlos' });
    expect(result.first_name).toBe('Carlos');
  });

  it('delete calls DELETE /api/participants/:id/', async () => {
    mockApi.delete.mockResolvedValueOnce({});
    await participantService.delete(1);
    expect(mockApi.delete).toHaveBeenCalledWith('/api/participants/1/');
  });

  it('importExcel calls POST with FormData', async () => {
    const mockResult = { total_rows: 5, imported: 5, errors: [] };
    mockApi.post.mockResolvedValueOnce({ data: mockResult });
    const file = new File(['col1,col2'], 'participants.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const result = await participantService.importExcel(file);
    expect(mockApi.post).toHaveBeenCalledWith('/api/participants/import_participants/', expect.any(FormData), expect.any(Object));
    expect(result.imported).toBe(5);
  });
});
