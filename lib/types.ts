// Enums matching backend
export enum ComplaintCategory {
  MEDICAL = "medical",
  SCHOOL = "school",
  HOUSING = "housing",
  SERVICE = "service",
  HOTEL = "hotel",
  RETAIL = "retail",
  GOVERNMENT = "government",
  OTHER = "other"
}

export enum ComplaintPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent"
}

export enum CaseStatus {
  NEW = "new",
  IN_REVIEW = "in_review",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  PENDING_INFO = "pending_info",
  RESOLVED = "resolved",
  CLOSED = "closed",
  REJECTED = "rejected"
}

export enum SentimentLevel {
  POSITIVE = "positive",
  NEUTRAL = "neutral",
  NEGATIVE = "negative",
  VERY_NEGATIVE = "very_negative"
}

export enum UrgencyLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export enum IntakeChannel {
  WEB_FORM = "web_form",
  MOBILE_APP = "mobile_app",
  IVR_PHONE = "ivr_phone",
  KIOSK = "kiosk",
  ROBOT = "robot",
  QR_CODE = "qr_code",
  MESSENGER = "messenger",
  EMAIL = "email",
  API = "api"
}

// Display names
export const CATEGORY_DISPLAY_NAMES: Record<ComplaintCategory, string> = {
  [ComplaintCategory.MEDICAL]: "Медицинская",
  [ComplaintCategory.SCHOOL]: "Образовательная",
  [ComplaintCategory.HOUSING]: "ЖКХ",
  [ComplaintCategory.SERVICE]: "Обслуживание",
  [ComplaintCategory.HOTEL]: "Гостиничная",
  [ComplaintCategory.RETAIL]: "Торговля",
  [ComplaintCategory.GOVERNMENT]: "Государственные услуги",
  [ComplaintCategory.OTHER]: "Прочее",
};

export const PRIORITY_DISPLAY_NAMES: Record<ComplaintPriority, string> = {
  [ComplaintPriority.LOW]: "Низкий",
  [ComplaintPriority.NORMAL]: "Средний",
  [ComplaintPriority.HIGH]: "Высокий",
  [ComplaintPriority.URGENT]: "Критический",
};

// Request/Response interfaces matching backend
export interface TextArtifactsSchema {
  original: string;
  normalized: string;
  neutral: string;
  language: string;
  audio_duration?: number;
  transcription_time?: number;
}

export interface ComplaintMetricsSchema {
  sentiment: SentimentLevel;
  sentiment_display?: string;
  toxicity_score: number;
  urgency: UrgencyLevel;
  urgency_display?: string;
  category: ComplaintCategory;
  category_display?: string;
  keywords: string[];
  mentioned_persons: string[];
  mentioned_locations: string[];
  mentioned_dates: string[];
  credibility_score: number;
  severity_score: number;
  contains_pii: boolean;
  contains_accusations: boolean;
  is_repeat_complaint: boolean;
}

export interface CaseMessageResponse {
  id: string;
  content: string;
  is_from_reporter: boolean;
  created_at: string;
  author_role?: string;
}

export interface CaseResponse {
  id: string;
  status: CaseStatus;
  status_display?: string;
  priority: ComplaintPriority;
  text_artifacts?: TextArtifactsSchema;
  metrics?: ComplaintMetricsSchema;
  intake_channel: IntakeChannel;
  audio_file_path?: string;
  reporter_pin?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  sla_deadline?: string;
  is_sla_breached: boolean;
  sla_remaining_hours?: number;
  assigned_to?: string;
  assigned_department?: string;
  messages: CaseMessageResponse[];
  unread_count: number;
  tags: string[];
}

export interface CaseCreateRequest {
  text?: string;
  intake_channel: IntakeChannel;
  category_hint?: ComplaintCategory;
  location_hint?: string;
  visit_token?: string;
}

export interface ProcessingResult {
  case: CaseResponse;
  processing_time: number;
  warnings: string[];
}

export interface CaseListResponse {
  items: CaseResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface CategoryStats {
  category: ComplaintCategory;
  count: number;
  avg_resolution_hours?: number;
  sla_breach_rate: number;
}

export interface DashboardStats {
  total_cases: number;
  open_cases: number;
  resolved_today: number;
  avg_resolution_hours: number;
  sla_breach_count: number;
  by_category: CategoryStats[];
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  daily_trend: Record<string, any>[];
}

export interface DayTrend {
  date: string;
  total: number;
  resolved: number;
  new: number;
  inProgress: number;
}

export interface NameValuePair {
  name: string;
  value: number;
}

export interface AnalyticsResponse {
  total_complaints: number;
  resolved_complaints: number;
  resolution_rate: number;
  average_sentiment_score: number;
  average_resolution_time: number;
  complaints_by_day: DayTrend[];
  complaints_by_category: NameValuePair[];
  sentiment_data: NameValuePair[];
  priority_data: NameValuePair[];
}

