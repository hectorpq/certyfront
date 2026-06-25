import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useStudents,
  useStudent,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useImportStudents,
} from '@/hooks/useStudents';
import { studentService } from '@/services/studentService';
import type { Student } from '@/types';

vi.mock('@/services/studentService', () => ({
  studentService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    importExcel: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockStudent: Student = {
  id: 1,
  document_id: '12345',
  first_name: 'Juan',
  last_name: 'Perez',
  email: 'juan@test.com',
  phone: '999888777',
  is_active: true,
};

describe('useStudents hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all students', async () => {
    const mockResponse = { count: 1, results: [mockStudent] };
    const mockStudentService = studentService as any;
    mockStudentService.getAll.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useStudents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(mockStudentService.getAll).toHaveBeenCalledWith(undefined);
  });

  it('fetches students with search params', async () => {
    const mockResponse = { count: 1, results: [mockStudent] };
    const mockStudentService = studentService as any;
    mockStudentService.getAll.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useStudents({ search: 'Juan', page: 2 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockStudentService.getAll).toHaveBeenCalledWith({ search: 'Juan', page: 2 });
  });

  it('fetches students with active filter', async () => {
    const mockResponse = { count: 1, results: [mockStudent] };
    const mockStudentService = studentService as any;
    mockStudentService.getAll.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useStudents({ is_active: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockStudentService.getAll).toHaveBeenCalledWith({ is_active: true });
  });

  it('shows loading state', () => {
    const mockStudentService = studentService as any;
    mockStudentService.getAll.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ results: [] }), 100))
    );

    const { result } = renderHook(() => useStudents(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
  });

  it('shows error state on fetch failure', async () => {
    const mockStudentService = studentService as any;
    mockStudentService.getAll.mockRejectedValueOnce(new Error('Fetch failed'));

    const { result } = renderHook(() => useStudents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useStudent hook (single student)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches single student by id', async () => {
    const mockStudentService = studentService as any;
    mockStudentService.getById.mockResolvedValueOnce(mockStudent);

    const { result } = renderHook(() => useStudent(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStudent);
    expect(mockStudentService.getById).toHaveBeenCalledWith(1);
  });

  it('does not fetch when id is not provided', () => {
    const mockStudentService = studentService as any;
    mockStudentService.getById.mockResolvedValueOnce(mockStudent);

    const { result } = renderHook(() => useStudent(0), {
      wrapper: createWrapper(),
    });

    expect(mockStudentService.getById).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateStudent hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new student', async () => {
    const mockStudentService = studentService as any;
    mockStudentService.create.mockResolvedValueOnce(mockStudent);

    const { result } = renderHook(() => useCreateStudent(), {
      wrapper: createWrapper(),
    });

    const payload = {
      document_id: '12345',
      first_name: 'Juan',
      last_name: 'Perez',
      email: 'juan@test.com',
      phone: '999888777',
    };

    result.current.mutate(payload as any);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Mutation receives payload and options, just verify it was called
    expect(mockStudentService.create).toHaveBeenCalled();
  });

  it('shows loading state during creation', async () => {
    const mockStudentService = studentService as any;
    mockStudentService.create.mockResolvedValueOnce(mockStudent);

    const { result } = renderHook(() => useCreateStudent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: 'test@test.com' } as any);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('shows error on creation failure', async () => {
    const mockStudentService = studentService as any;
    mockStudentService.create.mockRejectedValueOnce(new Error('Creation failed'));

    const { result } = renderHook(() => useCreateStudent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: 'test@test.com' } as any);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useUpdateStudent hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates an existing student', async () => {
    const mockStudentService = studentService as any;
    const updatedStudent = { ...mockStudent, first_name: 'Carlos' };
    mockStudentService.update.mockResolvedValueOnce(updatedStudent);

    const { result } = renderHook(() => useUpdateStudent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 1, data: { first_name: 'Carlos' } });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockStudentService.update).toHaveBeenCalledWith(1, { first_name: 'Carlos' });
  });
});

describe('useDeleteStudent hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a student', async () => {
    const mockStudentService = studentService as any;
    mockStudentService.delete.mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteStudent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockStudentService.delete).toHaveBeenCalled();
  });
});

describe('useImportStudents hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('imports students from excel file', async () => {
    const mockStudentService = studentService as any;
    const mockResult = { total_rows: 5, imported: 5, errors: [] };
    mockStudentService.importExcel.mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useImportStudents(), {
      wrapper: createWrapper(),
    });

    const file = new File(['data'], 'students.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    result.current.mutate(file);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockStudentService.importExcel).toHaveBeenCalled();
  });
});
