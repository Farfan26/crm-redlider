/**
 * Sistema Comercial Red Líder - Tipos de datos globales
 */

export type BusinessUnit = 'red_lider' | 'el_zapotal' | 'software';

export type LeadTemperature = 'caliente' | 'tibio' | 'frio' | 'perdido';

export type LeadSource = 
  | 'Facebook Ads'
  | 'Instagram'
  | 'LinkedIn'
  | 'Webinar'
  | 'Contenido'
  | 'Alianza'
  | 'Municipalidad'
  | 'Networking'
  | 'Referido'
  | 'Base antigua'
  | 'WhatsApp entrante'
  | 'Messenger'
  | 'Otro';

export type UserRole = 'dani' | 'oscar' | 'carlos' | 'agendadora' | 'vendedor';

export interface UserInfo {
  id: UserRole;
  name: string;
  roleTitle: string;
  unit: BusinessUnit | 'all';
  permissions: {
    canEditAll: boolean;
    canViewAll: boolean;
    canManageConfig: boolean;
    canExport: boolean;
  };
}

export type RedLiderStage = 'demanda' | 'calificacion' | 'diagnostico' | 'propuesta' | 'seguimiento' | 'cierre' | 'referidos';
export type ZapotalStage = 'demanda' | 'calificacion' | 'visita' | 'seguimiento' | 'separacion' | 'contrato' | 'referidos';
export type SoftwareStage = 'demanda' | 'calificacion' | 'demostracion' | 'propuesta' | 'negociacion' | 'cierre' | 'referidos';

export type FunnelStage = RedLiderStage | ZapotalStage | SoftwareStage;

export interface StageDefinition {
  id: FunnelStage;
  label: string;
  color: string;
  description: string;
}

export interface Interaction {
  id: string;
  leadId: string;
  date: string; // ISO string
  channel: 'WhatsApp' | 'Llamada' | 'Correo' | 'Reunión' | 'Visita' | 'Messenger' | 'Instagram' | 'LinkedIn' | 'Facebook' | 'Nota interna' | 'Sistema' | 'Otro';
  note: string;
  isIncoming?: boolean;
  isAutomated?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  unit: BusinessUnit;
  source: LeadSource;
  stage: FunnelStage;
  temperature: LeadTemperature;
  assignedTo: UserRole;
  nextAction: string;
  nextActionDate: string; // YYYY-MM-DD
  tags: string[];
  interactions: Interaction[];
  lossReason?: string;
  referredByLeadId?: string;
  referredByName?: string;
  createdAt: string;
  updatedAt: string;
  lastContactDate: string;
  dealValue?: number; // Monto estimado de la venta o contrato
  hasUnreadMessage?: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  bodyText: string;
  variables: string[]; // e.g. ['{{1}}', '{{2}}']
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  unit?: BusinessUnit | 'all';
  description: string;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  eventName: string;
  name: string;
  phone: string;
  email: string;
  unit: BusinessUnit;
  maturity: 'interesado' | 'por_madurar' | 'no_calificado';
  convertedLeadId?: string;
  registeredAt: string;
}

export interface EventWebinar {
  id: string;
  name: string;
  title?: string;
  date: string;
  time?: string;
  type?: string;
  status?: string;
  unit: BusinessUnit;
  description: string;
  attendeesCount: number;
}

export interface ReferralRecord {
  id: string;
  referrerName: string;
  referrerPhone: string;
  referredLeadId?: string;
  referredName: string;
  referredPhone: string;
  unit: BusinessUnit;
  status: 'solicitado' | 'recibido' | 'contactado' | 'convertido';
  saleAmount?: number;
  rewardAmount?: number;
  date: string;
}

export interface DashboardKPIs {
  totalLeads: number;
  leadsByUnit: Record<BusinessUnit, number>;
  leadsBySource: Record<string, number>;
  cplBySource: Record<string, number>; // Costo Por Lead
  contactRate: number; // Porcentaje de leads contactados
  meetingsScheduled: number;
  visitsScheduled: number;
  proposalsSent: number;
  separationsMade: number;
  contractsClosed: number;
  closeRate: number; // Porcentaje de cierre
  totalSalesValue: number;
  overdueCount: number;
  noActionCount: number;
  avgDaysWithoutContact: number;
  referralsMetrics: {
    solicitados: number;
    recibidos: number;
    contactados: number;
    convertidos: number;
    salesAmount: number;
  };
  stageConversion: {
    stage: string;
    label: string;
    count: number;
    percentage: number;
  }[];
  weeklyTrend: {
    week: string;
    leads: number;
    sales: number;
  }[];
}

export interface WeeklyReportData {
  generatedAt: string;
  unitFilter: string;
  newLeadsCount: number;
  contactedCount: number;
  meetingsCount: number;
  visitsCount: number;
  proposalsCount: number;
  separationsCount: number;
  closuresCount: number;
  totalRevenue: number;
  overdueCount: number;
  hotOpportunities: {
    name: string;
    unit: string;
    stage: string;
    nextAction: string;
    dealValue?: number;
    phone: string;
  }[];
  formattedText: string;
}

export interface MetaConnectionStatus {
  isConnected: boolean;
  phoneNumberId: string;
  wabaId: string;
  hasToken: boolean;
  verifyTokenConfigured: boolean;
  mode: 'LIVE' | 'SIMULATED';
  lastWebhookReceived?: string;
}

export type EventItem = EventWebinar;
export type ReferralItem = ReferralRecord;
export interface MetaConfig {
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  verifyToken: string;
  webhookUrl: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD or ISO string
  time?: string; // e.g. "10:00 AM"
  type: 'visita_zapotal' | 'zoom_red_lider' | 'demostracion_software' | 'reunion_interna' | 'seguimiento';
  unit: BusinessUnit | 'all';
  leadName?: string;
  leadId?: string;
  assignedTo?: string;
  notes?: string;
  status: 'confirmado' | 'pendiente' | 'realizado' | 'cancelado';
}

export interface BotRule {
  id: string;
  name: string;
  triggerKeywords: string[]; // e.g., ["lote", "terreno", "zapotal", "precio"]
  unit: BusinessUnit | 'all';
  responseTemplate: string;
  suggestedAction: string;
  autoAssignStage?: string;
  isActive: boolean;
}

export interface BotLog {
  id: string;
  timestamp: string;
  leadName: string;
  leadPhone: string;
  incomingMessage: string;
  botResponse: string;
  matchedRuleName?: string;
  status: 'enviado' | 'requiere_humano' | 'simulado';
}
