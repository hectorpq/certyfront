import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services/studentService';
import type { Student } from '@/types';

export const useStudents = (params?: { page?: number; search?: string; is_active?: boolean }) => {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => studentService.getAll(params),
  });
};

export const useStudent = (id: number) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getById(id),
    enabled: !!id,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Student> }) =>
      studentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useImportStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentService.importExcel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};
