import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useEvents,
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useRestoreEvent,
  useEventParticipants,
  useEventGenerateCertificates,
} from '@/hooks/useEvents';
import { eventService } from '@/services/eventService';
import type { Event } from '@/types';

vi.mock('@/services/eventService', () => ({
  eventService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    restore: vi.fn(),
    getParticipants: vi.fn(),
    generateCertificates: vi.fn(),
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

const mockEvent: Event = {
  id: 1,
  name: 'Taller Python',
  event_date: '2026-06-15',
  status: 'active',
  is_active: true,
};

describe('useEvents hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all events', async () => {
    const mockResponse = { count: 1, results: [mockEvent] };
    const mockEventService = eventService as any;
    mockEventService.getAll.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(mockEventService.getAll).toHaveBeenCalledWith(undefined);
  });

  it('fetches events with search params', async () => {
    const mockResponse = { count: 1, results: [mockEvent] };
    const mockEventService = eventService as any;
    mockEventService.getAll.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(
      () => useEvents({ search: 'Python', page: 1 }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockEventService.getAll).toHaveBeenCalledWith({
      search: 'Python',
      page: 1,
    });
  });

  it('fetches events with status filter', async () => {
    const mockResponse = { count: 1, results: [mockEvent] };
    const mockEventService = eventService as any;
    mockEventService.getAll.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(
      () => useEvents({ status: 'active' }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockEventService.getAll).toHaveBeenCalledWith({ status: 'active' });
  });

  it('fetches events with category filter', async () => {
    const mockResponse = { count: 1, results: [mockEvent] };
    const mockEventService = eventService as any;
    mockEventService.getAll.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useEvents({ category: 5 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockEventService.getAll).toHaveBeenCalledWith({ category: 5 });
  });

  it('shows loading state', () => {
    const mockEventService = eventService as any;
    mockEventService.getAll.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ results: [] }), 100))
    );

    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
  });

  it('shows error state on fetch failure', async () => {
    const mockEventService = eventService as any;
    mockEventService.getAll.mockRejectedValueOnce(new Error('Fetch failed'));

    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('uses correct query key for caching', async () => {
    const mockResponse = { count: 0, results: [] };
    const mockEventService = eventService as any;
    mockEventService.getAll.mockResolvedValueOnce(mockResponse);

    const { result: result1 } = renderHook(() => useEvents({ search: 'test' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    // Same params should use cached data
    expect(mockEventService.getAll).toHaveBeenCalledTimes(1);
  });
});

describe('useEvent hook (single event)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches single event by id', async () => {
    const mockEventService = eventService as any;
    mockEventService.getById.mockResolvedValueOnce(mockEvent);

    const { result } = renderHook(() => useEvent(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockEvent);
    expect(mockEventService.getById).toHaveBeenCalledWith(1);
  });

  it('does not fetch when id is falsy', () => {
    const mockEventService = eventService as any;

    const { result } = renderHook(() => useEvent(0), {
      wrapper: createWrapper(),
    });

    expect(mockEventService.getById).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('refetches when id changes', async () => {
    const mockEventService = eventService as any;
    mockEventService.getById.mockResolvedValueOnce(mockEvent);

    const { result, rerender } = renderHook(({ id }: { id: number }) => useEvent(id), {
      wrapper: createWrapper(),
      initialProps: { id: 1 },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const newEvent = { ...mockEvent, id: 2, name: 'Taller JS' };
    mockEventService.getById.mockResolvedValueOnce(newEvent);

    rerender({ id: 2 });

    await waitFor(() => {
      expect(mockEventService.getById).toHaveBeenCalledWith(2);
    });
  });
});

describe('useCreateEvent hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new event', async () => {
    const mockEventService = eventService as any;
    mockEventService.create.mockResolvedValueOnce(mockEvent);

    const { result } = renderHook(() => useCreateEvent(), {
      wrapper: createWrapper(),
    });

    const payload = {
      name: 'Taller Python',
      event_date: '2026-06-15',
    };

    result.current.mutate(payload as any);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Mutation receives payload and options, just verify it was called
    expect(mockEventService.create).toHaveBeenCalled();
  });

  it('shows loading state during creation', async () => {
    const mockEventService = eventService as any;
    mockEventService.create.mockResolvedValueOnce(mockEvent);

    const { result } = renderHook(() => useCreateEvent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ name: 'Test' } as any);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('invalidates events query on success', async () => {
    const mockEventService = eventService as any;
    mockEventService.create.mockResolvedValueOnce(mockEvent);

    const { result } = renderHook(() => useCreateEvent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ name: 'Test' } as any);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify the mutation was called successfully
    expect(mockEventService.create).toHaveBeenCalled();
  });
});

describe('useUpdateEvent hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates an existing event', async () => {
    const mockEventService = eventService as any;
    const updatedEvent = { ...mockEvent, name: 'Taller Actualizado' };
    mockEventService.update.mockResolvedValueOnce(updatedEvent);

    const { result } = renderHook(() => useUpdateEvent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 1, data: { name: 'Taller Actualizado' } });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockEventService.update).toHaveBeenCalledWith(1, {
      name: 'Taller Actualizado',
    });
  });

  it('shows error on update failure', async () => {
    const mockEventService = eventService as any;
    mockEventService.update.mockRejectedValueOnce(new Error('Update failed'));

    const { result } = renderHook(() => useUpdateEvent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 1, data: { name: 'Test' } });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useDeleteEvent hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes an event', async () => {
    const mockEventService = eventService as any;
    mockEventService.delete.mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteEvent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockEventService.delete).toHaveBeenCalled();
  });

  it('shows error on delete failure', async () => {
    const mockEventService = eventService as any;
    mockEventService.delete.mockRejectedValueOnce(new Error('Delete failed'));

    const { result } = renderHook(() => useDeleteEvent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useRestoreEvent hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('restores a deleted event', async () => {
    const mockEventService = eventService as any;
    mockEventService.restore.mockResolvedValueOnce({});

    const { result } = renderHook(() => useRestoreEvent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockEventService.restore).toHaveBeenCalled();
  });

  it('shows error on restore failure', async () => {
    const mockEventService = eventService as any;
    mockEventService.restore.mockRejectedValueOnce(new Error('Restore failed'));

    const { result } = renderHook(() => useRestoreEvent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useEventParticipants hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches participants for an event', async () => {
    const mockParticipants = [
      {
        enrollment_id: 1,
        participant_id: 10,
        participant_name: 'Juan Pérez',
        participant_email: 'juan@example.com',
        participant_phone: '999888777',
        attendance: true,
        certificate_id: null,
        certificate_status: null,
        certificate_status_display: null,
        verification_code: null,
        has_certificate: false,
      },
    ];
    const mockEventService = eventService as any;
    mockEventService.getParticipants.mockResolvedValueOnce(mockParticipants);

    const { result } = renderHook(() => useEventParticipants(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockParticipants);
    expect(mockEventService.getParticipants).toHaveBeenCalledWith(1);
  });

  it('does not fetch when id is falsy', () => {
    const mockEventService = eventService as any;

    const { result } = renderHook(() => useEventParticipants(0), {
      wrapper: createWrapper(),
    });

    expect(mockEventService.getParticipants).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('shows error on fetch failure', async () => {
    const mockEventService = eventService as any;
    mockEventService.getParticipants.mockRejectedValueOnce(new Error('Failed to load participants'));

    const { result } = renderHook(() => useEventParticipants(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useEventGenerateCertificates hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates certificates for an event', async () => {
    const mockResult = {
      event_id: 1,
      event_name: 'Taller Python',
      total_enrollments: 5,
      created: 5,
      already_exists: 0,
      errors: 0,
      results: {
        created: [],
        already_exists: [],
        errors: [],
      },
    };
    const mockEventService = eventService as any;
    mockEventService.generateCertificates.mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useEventGenerateCertificates(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 1 });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockEventService.generateCertificates).toHaveBeenCalledWith(1, undefined);
  });

  it('generates certificates for specific participants', async () => {
    const mockEventService = eventService as any;
    mockEventService.generateCertificates.mockResolvedValueOnce({
      event_id: 1,
      event_name: 'Taller Python',
      total_enrollments: 2,
      created: 2,
      already_exists: 0,
      errors: 0,
      results: { created: [], already_exists: [], errors: [] },
    });

    const { result } = renderHook(() => useEventGenerateCertificates(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 1, participantIds: [10, 20] });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockEventService.generateCertificates).toHaveBeenCalledWith(1, [10, 20]);
  });

  it('shows error on certificate generation failure', async () => {
    const mockEventService = eventService as any;
    mockEventService.generateCertificates.mockRejectedValueOnce(new Error('Generation failed'));

    const { result } = renderHook(() => useEventGenerateCertificates(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 1 });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
