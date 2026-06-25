export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'coordinador' | 'participante';
  is_active: boolean;
  is_staff: boolean;
}

export interface Template {
  id: number;
  name: string;
  category: string;
  background_image: number | null;
  background_url: string;
  background_image_url?: string;
  preview_url: string;
  layout_config: Record<string, unknown>;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  font_color?: string;
  font_family?: string;
  font_size?: number;
  x_coord?: number;
  y_coord?: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    role?: 'admin' | 'coordinador' | 'participante';
    is_staff?: boolean;
  };
}

export interface Participant {
  id: number;
  document_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: number | null;
  deleted_by_detail: { id: number; full_name: string; email: string } | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  category: number | null;
  category_name?: string;
  created_by: number;
  created_by_name?: string;
  instructor?: number;
  instructor_name?: string | null;
  instructor_specialty?: string | null;
  instructor_signature?: string | null;
  name: string;
  description: string;
  event_date: string;
  end_date: string | null;
  duration_hours: number | null;
  location: string;
  status: 'draft' | 'active' | 'finished' | 'cancelled';
  status_display?: string;
  template?: number;
  template_name?: string | null;
  template_image?: string;
  font_color?: string;
  name_font_size?: number;
  name_x?: number;
  name_y?: number;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: number | null;
  deleted_by_detail: { id: number; full_name: string; email: string } | null;
  created_at: string;
  updated_at: string;
}

export interface EnrolledParticipant {
  enrollment_id: number;
  participant_id: number;
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  attendance: boolean;
  certificate_id: number | null;
  certificate_status: string | null;
  certificate_status_display: string | null;
  verification_code: string | null;
  has_certificate: boolean;
}

export interface EventGenerateResult {
  event_id: number;
  event_name: string;
  total_enrollments: number;
  created: number;
  already_exists: number;
  errors: number;
  results: {
    created: Array<{
      participant_id: number;
      participant_name: string;
      certificate_id: number;
      status: string;
    }>;
    already_exists: Array<{
      participant_id: number;
      participant_name: string;
    }>;
    errors: Array<{
      participant_id: number;
      participant_name: string;
      error: string;
    }>;
  };
}

export interface Instructor {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  specialty: string;
  bio: string;
  signature_url: string;
  signature_image?: string | null;
}

export interface Certificate {
  [x: string]: any;
  id: number;
  participant: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
  };
  event: {
    id: number;
    name: string;
    event_date?: string | null;
    end_date?: string | null;
    description?: string;
    location?: string;
    duration_hours?: number | null;
    instructor_name?: string | null;
    category?: string | number | null;
  };
  template?: number;
  status: 'pending' | 'generated' | 'sent' | 'failed';
  status_display?: string;
  verification_code: string;
  pdf_url?: string;
  issued_at: string;
  updated_at: string;
  expires_at?: string;
  generated_by?: number;
  is_expired?: boolean;
}

export interface CertificateDetail extends Certificate {
  delivery_history?: DeliveryLog[];
  last_delivery?: DeliveryLog | null;
  has_delivery_attempts?: boolean;
}

export interface DeliveryLog {
  id: number;
  certificate: number;
  delivery_method: 'email' | 'whatsapp' | 'link';
  delivery_method_display: string;
  recipient: string;
  status: 'success' | 'error' | 'pending';
  status_display: string;
  error_message?: string;
  sent_at: string;
  updated_at: string;
  sent_by: number;
  is_successful: boolean;
  is_failed: boolean;
  is_pending: boolean;
}

export interface BulkImportResult {
  processing_timestamp: string;
  total_rows: number;
  successful: number;
  failed: number;
  success_rate: string;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
    data?: Record<string, unknown>;
  }>;
  created_certificates: number[];
  data_preview?: Array<Record<string, unknown>>;
  summary: string;
}

export interface ExcelPreview {
  success: boolean;
  row_count: number;
  columns: string[];
  data: Array<Record<string, unknown>>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DashboardStats {
  total_certificates: number;
  pending_certificates: number;
  generated_certificates: number;
  sent_certificates: number;
  failed_certificates: number;
  active_events: number;
  total_participants: number;
}
