import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Instructor } from '@/types';

export const useInstructors = () => {
  return useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      const response = await api.get<{ results: Instructor[] }>('/api/instructors/');
      return response.data.results || response.data;
    },
  });
};

export const useInstructor = (id: number) => {
  return useQuery({
    queryKey: ['instructor', id],
    queryFn: () => api.get<Instructor>(`/api/instructors/${id}/`).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateInstructor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) =>
      api.post<Instructor>('/api/instructors/', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
  });
};

export const useUpdateInstructor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      api.patch<Instructor>(`/api/instructors/${id}/`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
  });
};

export const useDeleteInstructor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => 
      api.delete(`/api/instructors/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
  });
};