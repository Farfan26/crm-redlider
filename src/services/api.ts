/**
 * Cliente API para la comunicación Frontend <-> Backend Express
 */
import { 
  Lead, 
  DashboardKPIs, 
  WeeklyReportData, 
  WhatsAppTemplate, 
  EventWebinar, 
  EventAttendee, 
  ReferralRecord, 
  MetaConnectionStatus 
} from '../types';

const API_BASE = '/api';

export const api = {
  // Leads & Prospectos
  getLeads: async (params?: { unit?: string; stage?: string; assignedTo?: string; temperature?: string; source?: string; search?: string; overdueOnly?: boolean }): Promise<Lead[]> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== 'all' && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const res = await fetch(`${API_BASE}/leads?${query.toString()}`);
    if (!res.ok) throw new Error('Error al obtener prospectos');
    return res.json();
  },

  getLeadById: async (id: string): Promise<Lead> => {
    const res = await fetch(`${API_BASE}/leads/${id}`);
    if (!res.ok) throw new Error('Prospecto no encontrado');
    return res.json();
  },

  createLead: async (leadData: Partial<Lead> & { ignoreDuplicate?: boolean }): Promise<Lead> => {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Error al crear prospecto');
      err.isDuplicate = data.isDuplicate;
      throw err;
    }
    return data;
  },

  updateLead: async (id: string, leadData: Partial<Lead>): Promise<Lead> => {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    if (!res.ok) throw new Error('Error al actualizar prospecto');
    return res.json();
  },

  addInteraction: async (id: string, interaction: { channel: string; note: string; nextAction?: string; nextActionDate?: string; isIncoming?: boolean }): Promise<Lead> => {
    const res = await fetch(`${API_BASE}/leads/${id}/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interaction)
    });
    if (!res.ok) throw new Error('Error al registrar interacción');
    return res.json();
  },

  deleteLead: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/leads/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar prospecto');
    return res.json();
  },

  importLeads: async (leads: any[], unit: string, assignedTo: string, allowDuplicates = false): Promise<{ success: boolean; importedCount: number; duplicatesSkipped: number }> => {
    const res = await fetch(`${API_BASE}/leads/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leads, unit, assignedTo, allowDuplicates })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al importar datos');
    return data;
  },

  // Indicadores KPI y Reportes
  getKPIs: async (params?: { unit?: string; assignedTo?: string; startDate?: string; endDate?: string }): Promise<DashboardKPIs> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'all') query.append(key, val);
      });
    }
    const res = await fetch(`${API_BASE}/analytics/kpis?${query.toString()}`);
    if (!res.ok) throw new Error('Error obteniendo indicadores KPI');
    return res.json();
  },

  getWeeklyReport: async (unit?: string): Promise<WeeklyReportData> => {
    const res = await fetch(`${API_BASE}/analytics/weekly-report${unit && unit !== 'all' ? `?unit=${unit}` : ''}`);
    if (!res.ok) throw new Error('Error al generar reporte semanal');
    return res.json();
  },

  getCpl: async (): Promise<Record<string, number>> => {
    const res = await fetch(`${API_BASE}/analytics/cpl`);
    return res.json();
  },

  saveCpl: async (cpl: Record<string, number>): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/analytics/cpl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cpl)
    });
    return res.json();
  },

  // Meta & WhatsApp
  getMetaStatus: async (): Promise<MetaConnectionStatus> => {
    const res = await fetch(`${API_BASE}/meta/status`);
    return res.json();
  },

  saveMetaConfig: async (config: Partial<MetaConnectionStatus>): Promise<any> => {
    const res = await fetch(`${API_BASE}/meta/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },

  getTemplates: async (unit?: string): Promise<WhatsAppTemplate[]> => {
    const res = await fetch(`${API_BASE}/meta/templates${unit && unit !== 'all' ? `?unit=${unit}` : ''}`);
    return res.json();
  },

  createTemplate: async (template: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate> => {
    const res = await fetch(`${API_BASE}/meta/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    return res.json();
  },

  sendWhatsAppMessage: async (data: { leadId: string; templateId?: string; customText?: string; variableValues?: string[]; ignore24h?: boolean }): Promise<any> => {
    const res = await fetch(`${API_BASE}/meta/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) {
      const err: any = new Error(json.error || 'Error enviando mensaje WhatsApp');
      err.requiresTemplate = json.requiresTemplate;
      throw err;
    }
    return json;
  },

  simulateMetaWebhook: async (payload: { type: 'whatsapp' | 'messenger' | 'instagram' | 'leadgen'; senderPhone?: string; senderName?: string; messageText?: string; leadAdData?: any }): Promise<any> => {
    const res = await fetch(`${API_BASE}/meta/simulate-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Eventos & Webinars
  getEvents: async (unit?: string): Promise<EventWebinar[]> => {
    const res = await fetch(`${API_BASE}/events${unit && unit !== 'all' ? `?unit=${unit}` : ''}`);
    return res.json();
  },

  createEvent: async (ev: Partial<EventWebinar>): Promise<EventWebinar> => {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev)
    });
    return res.json();
  },

  getAttendees: async (eventId?: string, unit?: string): Promise<EventAttendee[]> => {
    const query = new URLSearchParams();
    if (eventId) query.append('eventId', eventId);
    if (unit && unit !== 'all') query.append('unit', unit);
    const res = await fetch(`${API_BASE}/events/attendees?${query.toString()}`);
    return res.json();
  },

  registerAttendee: async (att: Partial<EventAttendee>): Promise<EventAttendee> => {
    const res = await fetch(`${API_BASE}/events/attendees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(att)
    });
    return res.json();
  },

  convertAttendeeToLead: async (eventIdOrId: string, attendeeId?: string): Promise<any> => {
    const id = attendeeId || eventIdOrId;
    const res = await fetch(`${API_BASE}/events/attendees/${id}/convert`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al conectar asistente');
    return data;
  },

  // Referidos
  getReferrals: async (unit?: string): Promise<ReferralRecord[]> => {
    const res = await fetch(`${API_BASE}/referrals${unit && unit !== 'all' ? `?unit=${unit}` : ''}`);
    return res.json();
  },

  createReferral: async (ref: Partial<ReferralRecord> & { createLead?: boolean }): Promise<ReferralRecord> => {
    const res = await fetch(`${API_BASE}/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ref)
    });
    return res.json();
  },

  updateReferralStatus: async (id: string, status: string, saleAmount?: number): Promise<ReferralRecord> => {
    const res = await fetch(`${API_BASE}/referrals/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, saleAmount })
    });
    return res.json();
  },

  // Alias y métodos de soporte para exportación y módulos
  getMetaConfig: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/meta/status`);
    return res.json();
  },

  simulateWebhook: async (payload: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/meta/simulate-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  deleteTemplate: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/meta/templates/${id}`, { method: 'DELETE' });
    if (!res.ok) return { success: true };
    return res.json();
  },

  addAttendee: async (att: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/events/attendees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(att)
    });
    return res.json();
  },

  exportLeadsCsv: async (unit?: string): Promise<string> => {
    try {
      const res = await fetch(`${API_BASE}/leads/export?unit=${unit || 'all'}`);
      if (res.ok) return await res.text();
    } catch (e) {}
    // Fallback local CSV generation
    const leads = await api.getLeads({ unit: unit || 'all' });
    const headers = ['ID', 'Nombre', 'Teléfono', 'Email', 'Unidad', 'Etapa', 'Fuente', 'Temperatura', 'Asignado', 'Valor Negocio', 'Notas'];
    const rows = leads.map(l => [
      l.id, l.name, l.phone, l.email || '', l.unit, l.stage, l.source, l.temperature, l.assignedTo, l.dealValue || 0, l.nextAction || ''
    ]);
    return [headers.join(','), ...rows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(','))].join('\n');
  }
};
