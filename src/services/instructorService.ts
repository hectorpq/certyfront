import api from './api';
import type { Instructor } from '@/types';

export const instructorService = {
  async getAll(): Promise<{ results: Instructor[] }> {
    const response = await api.get<{ results: Instructor[] }>('/api/instructors/');
    return response.data;
  },

  async getById(id: number): Promise<Instructor> {
    const response = await api.get<Instructor>(`/api/instructors/${id}/`);
    return response.data;
  },

  async create(data: Omit<Instructor, 'id'>): Promise<Instructor> {
    const response = await api.post<Instructor>('/api/instructors/', data);
    return response.data;
  },

  async update(id: number, data: Partial<Instructor>): Promise<Instructor> {
    const response = await api.patch<Instructor>(`/api/instructors/${id}/`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/instructors/${id}/`);
  },
};
