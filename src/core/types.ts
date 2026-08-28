export interface ScheduledMessage {
  at: number;
  name: string;
  text: string;
}

export interface WebinarConfig {
  id: number;
  title: string;
  video_url: string;
  duration_sec: number;
  interval_min: number;
  offer_show_at_sec: number;
  offer_title: string;
  offer_headline: string;
  offer_text: string;
  cta_label: string;
  cta_url: string;
  booking_url: string;
  scheduled_messages: ScheduledMessage[];
}

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  whatsapp: string | null;
  session_at: number;
  consent_at: string | null;
}

export interface MessageRow {
  id: number;
  created_at: string;
  session_at: number;
  lead_id: string | null;
  name: string;
  text: string;
  is_host: boolean;
}

export interface Application {
  id: string;
  created_at: string;
  lead_id: string | null;
  session_at: number | null;
  name: string | null;
  area: string | null;
  cidade: string | null;
  tempo: string | null;
  faturamento: string | null;
  investimento: string | null;
  dificuldade: string | null;
  pronto: string | null;
  whatsapp: string | null;
}

export type EventType = 'room_enter' | 'watch' | 'offer_view' | 'offer_click';

export interface KeyCount {
  k: string;
  n: number;
}

export interface WatchPoint {
  sec: number;
  n: number;
}

export interface LeadsByDay {
  d: string;
  n: number;
}

export interface SessionSummary {
  s: number;
  entered: number;
  reached_offer: number;
  clicked: number;
}

export interface DashboardStats {
  leads_total: number;
  leads_by_day: LeadsByDay[];
  room_viewers: number;
  watch: WatchPoint[];
  offer_views: number;
  offer_clicks: number;
  apps_total: number;
  apps_area: KeyCount[];
  apps_faturamento: KeyCount[];
  apps_investimento: KeyCount[];
  apps_pronto: KeyCount[];
  sessions: SessionSummary[];
}

/** Identidade do visitante, resolvida no servidor a partir dos cookies. */
export interface Visitor {
  leadId: string | null;
  name: string;
}
