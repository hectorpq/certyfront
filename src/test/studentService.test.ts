import { describe, it, expect, beforeEach, vi } from 'vitest';
import { studentService } from '@/services/studentService';
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

const mockStudent = {
  id: 1,
  document_id: '12345',
  first_name: 'Juan',
  last_name: 'Perez',
  email: 'juan@test.com',
  phone: '999888777',
  is_active: true,
};

describe('studentService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getAll calls GET /api/students/ and returns paginated data', async () => {
    const mockResponse = { count: 1, results: [mockStudent] };
    mockApi.get.mockResolvedValueOnce({ data: mockResponse });

    const result = await studentService.getAll();
    expect(mockApi.get).toHaveBeenCalledWith('/api/students/', { params: undefined });
    expect(result).toEqual(mockResponse);
  });

  it('getAll passes search params', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });
    await studentService.getAll({ search: 'Juan', page: 2 });
    expect(mockApi.get).toHaveBeenCalledWith('/api/students/', { params: { search: 'Juan', page: 2 } });
  });

  it('getById calls GET /api/students/:id/', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockStudent });
    const result = await studentService.getById(1);
    expect(mockApi.get).toHaveBeenCalledWith('/api/students/1/');
    expect(result).toEqual(mockStudent);
  });

  it('create calls POST /api/students/ with data', async () => {
    const payload = { document_id: '99', first_name: 'Ana', last_name: 'Torres', email: 'ana@t.com', phone: '' };
    mockApi.post.mockResolvedValueOnce({ data: { ...mockStudent, ...payload } });
    const result = await studentService.create(payload);
    expect(mockApi.post).toHaveBeenCalledWith('/api/students/', payload);
    expect(result.first_name).toBe('Ana');
  });

  it('update calls PATCH /api/students/:id/ with partial data', async () => {
    const updated = { ...mockStudent, first_name: 'Carlos' };
    mockApi.patch.mockResolvedValueOnce({ data: updated });
    const result = await studentService.update(1, { first_name: 'Carlos' });
    expect(mockApi.patch).toHaveBeenCalledWith('/api/students/1/', { first_name: 'Carlos' });
    expect(result.first_name).toBe('Carlos');
  });

  it('delete calls DELETE /api/students/:id/', async () => {
    mockApi.delete.mockResolvedValueOnce({});
    await studentService.delete(1);
    expect(mockApi.delete).toHaveBeenCalledWith('/api/students/1/');
  });

  it('importExcel calls POST with FormData', async () => {
    const mockResult = { total_rows: 5, imported: 5, errors: [] };
    mockApi.post.mockResolvedValueOnce({ data: mockResult });
    const file = new File(['col1,col2'], 'students.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const result = await studentService.importExcel(file);
    expect(mockApi.post).toHaveBeenCalledWith('/api/students/import/', expect.any(FormData), expect.any(Object));
    expect(result.imported).toBe(5);
  });
});
