import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Template } from '@/types';

export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await api.get<{ results: Template[] }>('/api/templates/');
      return response.data.results || response.data;
    },
  });
};

export const useTemplate = (id: number) => {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => api.get<Template>(`/api/templates/${id}/`),
    enabled: !!id,
  });
};