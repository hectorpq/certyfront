import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/eventService';
import type { Event } from '@/types';

export const useEvents = (params?: { page?: number; search?: string; status?: string; category?: number; show_deleted?: boolean }) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventService.getAll(params),
  });
};

export const useEvent = (id: number) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getById(id),
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Event> }) =>
      eventService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useRestoreEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useEventParticipants = (id: number) => {
  return useQuery({
    queryKey: ['event', id, 'participants'],
    queryFn: () => eventService.getParticipants(id),
    enabled: !!id,
  });
};

export const useEventGenerateCertificates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, participantIds }: { id: number; participantIds?: number[] }) =>
      eventService.generateCertificates(id, participantIds),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['event', id, 'participants'] });
    },
  });
};
