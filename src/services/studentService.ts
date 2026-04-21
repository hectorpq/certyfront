import api from './api';
import type { Student, PaginatedResponse } from '@/types';

export const studentService = {
  async getAll(params?: {
    page?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Student>> {
    const response = await api.get<PaginatedResponse<Student>>('/api/students/', {
      params,
    });
    return response.data;
  },

  async getById(id: number): Promise<Student> {
    const response = await api.get<Student>(`/api/students/${id}/`);
    return response.data;
  },

  async create(data: {
    document_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }): Promise<Student> {
    const response = await api.post<Student>('/api/students/', data);
    return response.data;
  },

  async update(id: number, data: Partial<Student>): Promise<Student> {
    const response = await api.patch<Student>(`/api/students/${id}/`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/students/${id}/`);
  },

  async importExcel(file: File): Promise<{
    total_rows: number;
    imported: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/students/import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
