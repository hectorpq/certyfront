import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useParticipants,
  useParticipant,
  useCreateParticipant,
  useUpdateParticipant,
  useDeleteParticipant,
  useRestoreParticipant,
  useImportParticipants,
} from '@/hooks/useParticipants';
import { participantService } from '@/services/participantService';

vi.mock('@/services/participantService', () => ({
  participantService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    restore: vi.fn(),
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

const mockParticipant = {
  id: 1,
  document_id: '12345678',
  first_name: 'Juan',
  last_name: 'Pérez',
  full_name: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '999888777',
  is_active: true,
  is_deleted: false,
  deleted_at: null,
  deleted_by: null,
  deleted_by_detail: null,
  created_by: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('useParticipants hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all participants', async () => {
    const mockResponse = { count: 1, results: [mockParticipant] };
    const mockService = participantService as any;
    mockService.getAll.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useParticipants(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(mockService.getAll).toHaveBeenCalledWith(undefined);
  });

  it('fetches participants with params', async () => {
    const mockResponse = { count: 1, results: [mockParticipant] };
    const mockService = participantService as any;
    mockService.getAll.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useParticipants({ search: 'Juan', page: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockService.getAll).toHaveBeenCalledWith({ search: 'Juan', page: 1 });
  });

  it('shows error state on fetch failure', async () => {
    const mockService = participantService as any;
    mockService.getAll.mockRejectedValueOnce(new Error('Fetch failed'));

    const { result } = renderHook(() => useParticipants(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('shows loading state', () => {
    const mockService = participantService as any;
    mockService.getAll.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ results: [] }), 100))
    );

    const { result } = renderHook(() => useParticipants(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
  });
});

describe('useParticipant hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches single participant by id', async () => {
    const mockService = participantService as any;
    mockService.getById.mockResolvedValueOnce(mockParticipant);

    const { result } = renderHook(() => useParticipant(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockParticipant);
    expect(mockService.getById).toHaveBeenCalledWith(1);
  });

  it('does not fetch when id is falsy', () => {
    const mockService = participantService as any;

    const { result } = renderHook(() => useParticipant(0), {
      wrapper: createWrapper(),
    });

    expect(mockService.getById).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateParticipant hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new participant', async () => {
    const mockService = participantService as any;
    mockService.create.mockResolvedValueOnce(mockParticipant);

    const { result } = renderHook(() => useCreateParticipant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      document_id: '12345678',
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@example.com',
      phone: '999888777',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockService.create).toHaveBeenCalled();
  });

  it('shows error on create failure', async () => {
    const mockService = participantService as any;
    mockService.create.mockRejectedValueOnce(new Error('Create failed'));

    const { result } = renderHook(() => useCreateParticipant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      document_id: '12345678',
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@example.com',
      phone: '999888777',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useUpdateParticipant hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates an existing participant', async () => {
    const mockService = participantService as any;
    const updated = { ...mockParticipant, first_name: 'Pedro' };
    mockService.update.mockResolvedValueOnce(updated);

    const { result } = renderHook(() => useUpdateParticipant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 1, data: { first_name: 'Pedro' } });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockService.update).toHaveBeenCalledWith(1, { first_name: 'Pedro' });
  });

  it('shows error on update failure', async () => {
    const mockService = participantService as any;
    mockService.update.mockRejectedValueOnce(new Error('Update failed'));

    const { result } = renderHook(() => useUpdateParticipant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 1, data: { first_name: 'Test' } });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useDeleteParticipant hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a participant', async () => {
    const mockService = participantService as any;
    mockService.delete.mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteParticipant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockService.delete).toHaveBeenCalled();
  });

  it('shows error on delete failure', async () => {
    const mockService = participantService as any;
    mockService.delete.mockRejectedValueOnce(new Error('Delete failed'));

    const { result } = renderHook(() => useDeleteParticipant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useRestoreParticipant hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('restores a deleted participant', async () => {
    const mockService = participantService as any;
    mockService.restore.mockResolvedValueOnce({});

    const { result } = renderHook(() => useRestoreParticipant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockService.restore).toHaveBeenCalled();
  });

  it('shows error on restore failure', async () => {
    const mockService = participantService as any;
    mockService.restore.mockRejectedValueOnce(new Error('Restore failed'));

    const { result } = renderHook(() => useRestoreParticipant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useImportParticipants hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('imports participants from excel', async () => {
    const mockService = participantService as any;
    const importResult = { total_rows: 10, imported: 8, errors: [] };
    mockService.importExcel.mockResolvedValueOnce(importResult);

    const { result } = renderHook(() => useImportParticipants(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(new File([''], 'test.xlsx'));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockService.importExcel).toHaveBeenCalled();
  });

  it('shows error on import failure', async () => {
    const mockService = participantService as any;
    mockService.importExcel.mockRejectedValueOnce(new Error('Import failed'));

    const { result } = renderHook(() => useImportParticipants(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(new File([''], 'test.xlsx'));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
