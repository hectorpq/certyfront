import api from './api';
import type { Event, PaginatedResponse } from '@/types';

export const eventService = {
  async getAll(params?: {
    page?: number;
    search?: string;
    status?: string;
    category?: number;
  }): Promise<PaginatedResponse<Event>> {
    const response = await api.get<PaginatedResponse<Event>>('/api/events/', {
      params,
    });
    return response.data;
  },

  async getById(id: number): Promise<Event> {
    const response = await api.get<Event>(`/api/events/${id}/`);
    return response.data;
  },

  async create(data: Partial<Event>): Promise<Event> {
    const response = await api.post<Event>('/api/events/', data);
    return response.data;
  },

  async update(id: number, data: Partial<Event>): Promise<Event> {
    const response = await api.patch<Event>(`/api/events/${id}/`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/events/${id}/`);
  },

  async restore(id: number): Promise<void> {
    await api.post(`/api/events/${id}/restore/`);
  },
};
