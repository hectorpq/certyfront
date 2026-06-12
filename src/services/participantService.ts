import api from './api';
import type { Participant, PaginatedResponse } from '@/types';

export const participantService = {
  async getAll(params?: {
    page?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Participant>> {
    const response = await api.get<PaginatedResponse<Participant>>('/api/participants/', {
      params,
    });
    return response.data;
  },

  async getById(id: number): Promise<Participant> {
    const response = await api.get<Participant>(`/api/participants/${id}/`);
    return response.data;
  },

  async create(data: {
    document_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }): Promise<Participant> {
    const response = await api.post<Participant>('/api/participants/', data);
    return response.data;
  },

  async update(id: number, data: Partial<Participant>): Promise<Participant> {
    const response = await api.patch<Participant>(`/api/participants/${id}/`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/participants/${id}/`);
  },

  async restore(id: number): Promise<void> {
    await api.post(`/api/participants/${id}/restore/`);
  },

  async importExcel(file: File): Promise<{
    total_rows: number;
    imported: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/participants/import_participants/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
