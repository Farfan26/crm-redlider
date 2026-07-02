/**
 * Rutas del Módulo de Eventos & Webinars
 */
import express from 'express';
import { db } from '../db.js';
import { EventWebinar, EventAttendee, Lead, FunnelStage, BusinessUnit } from '../../types.js';

export const eventsRouter = express.Router();

// GET /api/events - Obtener todos los eventos
eventsRouter.get('/', (req, res) => {
  res.json(db.getEvents());
});

// POST /api/events - Crear evento o webinar
eventsRouter.post('/', (req, res) => {
  const { name, date, unit, description } = req.body;
  if (!name || !date || !unit) return res.status(400).json({ error: 'Faltan campos obligatorios' });

  const newEv: EventWebinar = {
    id: `ev-${Date.now()}`,
    name,
    date,
    unit: unit as BusinessUnit,
    description: description || '',
    attendeesCount: 0
  };
  db.saveEvent(newEv);
  res.status(201).json(newEv);
});

// GET /api/events/attendees - Obtener asistentes (opcional por eventId)
eventsRouter.get('/attendees', (req, res) => {
  const { eventId, unit } = req.query;
  let attendees = db.getAttendees();
  if (eventId) {
    attendees = attendees.filter(a => a.eventId === eventId);
  }
  if (unit && unit !== 'all') {
    attendees = attendees.filter(a => a.unit === unit);
  }
  res.json(attendees);
});

// POST /api/events/attendees - Registrar asistente
eventsRouter.post('/attendees', (req, res) => {
  const { eventId, name, phone, email, unit, maturity } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' });

  const ev = db.getEvents().find(e => e.id === eventId);
  const evName = ev ? ev.name : 'Evento General / Webinar';
  const evUnit = (ev ? ev.unit : (unit || 'red_lider')) as BusinessUnit;

  const newAtt: EventAttendee = {
    id: `att-${Date.now()}`,
    eventId: eventId || 'ev-1',
    eventName: evName,
    name,
    phone: String(phone).replace(/\D/g, ''),
    email: email || '',
    unit: evUnit,
    maturity: maturity || 'interesado',
    registeredAt: new Date().toISOString()
  };

  db.saveAttendee(newAtt);
  if (ev) {
    ev.attendeesCount = (ev.attendeesCount || 0) + 1;
    db.saveEvent(ev);
  }

  res.status(201).json(newAtt);
});

// POST /api/events/attendees/:id/convert - Conectar / Convertir asistente en Lead del embudo correspondiente
eventsRouter.post('/attendees/:id/convert', (req, res) => {
  try {
    const attendee = db.getAttendees().find(a => a.id === req.params.id);
    if (!attendee) return res.status(404).json({ error: 'Asistente no encontrado' });

    if (attendee.convertedLeadId) {
      return res.status(400).json({ error: 'Este asistente ya fue convertido en prospecto en el embudo' });
    }

    // Verificar si ya existe en leads por teléfono
    const existingLeads = db.getLeads();
    let lead = existingLeads.find(l => l.phone.replace(/\D/g, '') === attendee.phone);

    if (lead) {
      // Adjuntar nota de asistencia al evento
      lead.interactions.unshift({
        id: `int-${Date.now()}`,
        leadId: lead.id,
        date: new Date().toISOString(),
        channel: 'Visita',
        note: `[🎟️ ASISTENCIA A EVENTO]: Asistió a "${attendee.eventName}". Clasificación de madurez: ${attendee.maturity}.`
      });
      lead.tags.push('Webinar/Evento');
      db.saveLead(lead);
    } else {
      // Crear nuevo prospecto
      const initialStage: FunnelStage = attendee.unit === 'el_zapotal' ? 'visita' : (attendee.unit === 'software' ? 'demostracion' : 'diagnostico');
      
      lead = {
        id: `lead-ev-${Date.now()}`,
        name: attendee.name,
        phone: attendee.phone,
        email: attendee.email,
        unit: attendee.unit,
        source: 'Webinar',
        stage: initialStage,
        temperature: attendee.maturity === 'interesado' ? 'caliente' : 'tibio',
        assignedTo: 'agendadora',
        nextAction: `🎯 Seguimiento post-evento: Agradecer asistencia a "${attendee.eventName}" y coordinar siguientes pasos`,
        nextActionDate: new Date().toISOString().split('T')[0],
        tags: ['Webinar', 'Evento', attendee.maturity],
        interactions: [{
          id: `int-${Date.now()}`,
          leadId: '',
          date: new Date().toISOString(),
          channel: 'Visita',
          note: `Prospecto creado por conversión automática desde el evento "${attendee.eventName}". Clasificación: ${attendee.maturity}.`
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastContactDate: new Date().toISOString(),
        dealValue: attendee.unit === 'el_zapotal' ? 42000 : 15000
      };
      lead.interactions[0].leadId = lead.id;
      db.saveLead(lead);
    }

    attendee.convertedLeadId = lead.id;
    db.saveAttendee(attendee);

    res.json({
      success: true,
      message: `Asistente conectado exitosamente al embudo de ${lead.unit === 'red_lider' ? 'Red Líder' : (lead.unit === 'el_zapotal' ? 'El Zapotal' : 'Software')}`,
      lead
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
