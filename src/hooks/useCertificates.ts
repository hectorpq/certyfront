import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificateService } from '@/services/certificateService';

export const useCertificates = (params?: { page?: number; search?: string; status?: string; event?: number }) => {
  return useQuery({
    queryKey: ['certificates', params],
    queryFn: () => certificateService.getAll(params),
  });
};

export const useCertificate = (id: number) => {
  return useQuery({
    queryKey: ['certificate', id],
    queryFn: () => certificateService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: certificateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

export const useDeleteCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: certificateService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

export const useGenerateCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, template_id }: { id: number; template_id?: number }) =>
      certificateService.generate(id, template_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

export const useDeliverCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, method, recipient }: { id: number; method: 'email' | 'whatsapp' | 'link'; recipient?: string }) =>
      certificateService.deliver(id, method, recipient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

export const useCertificateHistory = (id: number) => {
  return useQuery({
    queryKey: ['certificateHistory', id],
    queryFn: () => certificateService.getHistory(id),
    enabled: !!id,
  });
};

export const usePreviewExcel = () => {
  return useMutation({
    mutationFn: ({ file }: { file: File }) => certificateService.previewExcel(file),
  });
};

export const useGenerateBulk = () => {
  return useMutation({
    mutationFn: ({ file, dry_run }: { file: File; dry_run?: boolean }) =>
      certificateService.generateBulk(file, dry_run),
  });
};

export const useGenerateBulkFull = () => {
  return useMutation({
    mutationFn: (params: {
      excelFile: File;
      eventId: number;
      templateImage: File;
      nameX: number;
      nameY: number;
      fontSize?: number;
      fontColor?: string;
    }) => certificateService.generateBulkFull(params),
  });
};

export const useProcessEdited = () => {
  return useMutation({
    mutationFn: (data: Array<Record<string, unknown>>) =>
      certificateService.processEdited(data),
  });
};

export const useVerifyCertificate = () => {
  return useMutation({
    mutationFn: (code: string) => certificateService.verify(code),
  });
};
