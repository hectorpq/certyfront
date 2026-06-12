import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { participantService } from '@/services/participantService';
import type { Participant } from '@/types';

export const useParticipants = (params?: { page?: number; search?: string; is_active?: boolean }) => {
  return useQuery({
    queryKey: ['participants', params],
    queryFn: () => participantService.getAll(params),
  });
};

export const useParticipant = (id: number) => {
  return useQuery({
    queryKey: ['participant', id],
    queryFn: () => participantService.getById(id),
    enabled: !!id,
  });
};

export const useCreateParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: participantService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });
};

export const useUpdateParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Participant> }) =>
      participantService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });
};

export const useDeleteParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: participantService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });
};

export const useImportParticipants = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: participantService.importExcel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });
};
