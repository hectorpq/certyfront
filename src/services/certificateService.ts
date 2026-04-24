import api from './api';
import type { Certificate, CertificateDetail, PaginatedResponse, BulkImportResult, ExcelPreview, DeliveryLog } from '@/types';

export const certificateService = {
  async getAll(params?: {
    page?: number;
    search?: string;
    status?: string;
    event?: number;
  }): Promise<PaginatedResponse<Certificate>> {
    const response = await api.get<PaginatedResponse<Certificate>>('/api/certificates/', {
      params,
    });
    return response.data;
  },

  async getById(id: number): Promise<CertificateDetail> {
    const response = await api.get<CertificateDetail>(`/api/certificates/${id}/`);
    return response.data;
  },

  async create(data: { student_id: number; event_id: number; template?: number }): Promise<Certificate> {
    const response = await api.post<Certificate>('/api/certificates/', data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/certificates/${id}/`);
  },

  async generate(id: number, template_id?: number): Promise<{ status: string; message: string; certificate: CertificateDetail }> {
    const response = await api.post(`/api/certificates/${id}/generate/`, {
      template_id,
    });
    return response.data;
  },

  async deliver(id: number, method: 'email' | 'whatsapp' | 'link', recipient?: string): Promise<{
    status: string;
    message: string;
    delivery_log: DeliveryLog;
    certificate: CertificateDetail;
  }> {
    const response = await api.post(`/api/certificates/${id}/deliver/`, {
      method,
      recipient,
    });
    return response.data;
  },

  async getHistory(id: number): Promise<{
    certificate_id: string;
    total_attempts: number;
    deliveries: DeliveryLog[];
  }> {
    const response = await api.get(`/api/certificates/${id}/history/`);
    return response.data;
  },

  async verify(code: string): Promise<{ status: string; message: string; certificate: CertificateDetail }> {
    const response = await api.get(`/api/certificates/verify/`, {
      params: { code },
    });
    return response.data;
  },

  async previewExcel(file: File): Promise<ExcelPreview> {
    const formData = new FormData();
    formData.append('excel_file', file);
    const response = await api.post<ExcelPreview>('/api/certificates/preview/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async generateBulk(file: File, dry_run?: boolean): Promise<BulkImportResult> {
    const formData = new FormData();
    formData.append('excel_file', file);
    if (dry_run) {
      formData.append('dry_run', 'true');
    }
    const response = await api.post<BulkImportResult>('/api/certificates/generate-bulk/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async generateBulkFull(params: {
    excelFile: File;
    eventId: number;
    templateImage: File;
    nameX: number;
    nameY: number;
    fontSize?: number;
    fontColor?: string;
  }): Promise<BulkImportResult> {
    const formData = new FormData();
    formData.append('excel_file', params.excelFile);
    formData.append('template_image', params.templateImage);
    formData.append('event_id', String(params.eventId));
    formData.append('name_x', String(params.nameX));
    formData.append('name_y', String(params.nameY));
    formData.append('font_size', String(params.fontSize ?? 28));
    formData.append('font_color', params.fontColor ?? '#000000');
    const response = await api.post<BulkImportResult>('/api/certificates/generate-bulk/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async processEdited(data: Array<Record<string, unknown>>): Promise<BulkImportResult> {
    const response = await api.post<BulkImportResult>('/api/certificates/process/', {
      data,
    });
    return response.data;
  },

  // Template methods
  async getTemplates(): Promise<unknown[]> {
    const response = await api.get('/api/templates/');
    return response.data;
  },

  async getTemplate(id: number): Promise<unknown> {
    const response = await api.get(`/api/templates/${id}/`);
    return response.data;
  },

  async createTemplate(data: { name: string; category?: string; layout_config?: Record<string, unknown>; is_active?: boolean }): Promise<unknown> {
    const response = await api.post('/api/templates/', data);
    return response.data;
  },

  async updateTemplate(id: number, data: { name?: string; category?: string; layout_config?: Record<string, unknown>; is_active?: boolean }): Promise<unknown> {
    const response = await api.put(`/api/templates/${id}/`, data);
    return response.data;
  },

  async deleteTemplate(id: number): Promise<void> {
    await api.delete(`/api/templates/${id}/`);
  },

  async uploadTemplateImage(id: number, file: File): Promise<{ background_image: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/api/templates/${id}/upload-image/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
