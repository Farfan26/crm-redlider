/**
 * Rutas de Gestión de Prospectos (Leads) & Interacciones
 */
import express from 'express';
import { db } from '../db.js';
import { Lead, Interaction, FunnelStage, BusinessUnit } from '../../types.js';

export const leadsRouter = express.Router();

// GET /api/leads - Obtener todos los leads (con filtros opcionales)
leadsRouter.get('/', (req, res) => {
  try {
    let leads = db.getLeads();
    const { unit, stage, assignedTo, temperature, source, search, overdueOnly } = req.query;

    if (unit && unit !== 'all') {
      leads = leads.filter(l => l.unit === unit);
    }
    if (stage && stage !== 'all') {
      leads = leads.filter(l => l.stage === stage);
    }
    if (assignedTo && assignedTo !== 'all') {
      leads = leads.filter(l => l.assignedTo === assignedTo);
    }
    if (temperature && temperature !== 'all') {
      leads = leads.filter(l => l.temperature === temperature);
    }
    if (source && source !== 'all') {
      leads = leads.filter(l => l.source === source);
    }
    if (search) {
      const q = String(search).toLowerCase();
      leads = leads.filter(l => 
        l.name.toLowerCase().includes(q) || 
        (l.company && l.company.toLowerCase().includes(q)) || 
        l.phone.includes(q) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        l.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (overdueOnly === 'true') {
      const today = new Date().toISOString().split('T')[0];
      leads = leads.filter(l => l.nextActionDate && l.nextActionDate < today);
    }

    res.json(leads);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/:id - Obtener un lead por ID
leadsRouter.get('/:id', (req, res) => {
  const lead = db.getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });
  res.json(lead);
});

// POST /api/leads - Crear un nuevo prospecto
leadsRouter.post('/', (req, res) => {
  try {
    const data = req.body;
    // Validación obligatoria
    if (!data.name || !data.phone || !data.unit || !data.source) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (Nombre, Teléfono, Unidad, Fuente)' });
    }
    if (!data.nextAction || !data.nextActionDate) {
      return res.status(400).json({ error: 'Regla comercial obligatoria: Ningún prospecto puede registrarse sin Próxima Acción y Fecha' });
    }

    // Detección de duplicados por teléfono o correo
    const existingLeads = db.getLeads();
    const cleanPhone = String(data.phone).replace(/\D/g, '');
    const isDuplicate = existingLeads.some(l => 
      l.phone.replace(/\D/g, '') === cleanPhone || 
      (data.email && l.email && l.email.toLowerCase() === data.email.toLowerCase())
    );

    if (isDuplicate && !data.ignoreDuplicate) {
      return res.status(409).json({ 
        error: 'Posible duplicado detectado por número de teléfono o correo electrónico.',
        isDuplicate: true 
      });
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      company: data.company || '',
      phone: cleanPhone || data.phone,
      email: data.email || '',
      unit: data.unit as BusinessUnit,
      source: data.source,
      stage: (data.stage || 'demanda') as FunnelStage,
      temperature: data.temperature || 'tibio',
      assignedTo: data.assignedTo || 'agendadora',
      nextAction: data.nextAction,
      nextActionDate: data.nextActionDate,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map(s => s.trim()) : []),
      interactions: [{
        id: `int-${Date.now()}`,
        leadId: '', // se asignará abajo
        date: new Date().toISOString(),
        channel: 'Sistema',
        note: `Prospecto creado y asignado a ${data.assignedTo || 'agendadora'} en etapa "${data.stage || 'demanda'}". Próxima acción: ${data.nextAction}`
      }],
      lossReason: data.lossReason || '',
      referredByLeadId: data.referredByLeadId || '',
      referredByName: data.referredByName || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastContactDate: new Date().toISOString(),
      dealValue: Number(data.dealValue) || 0
    };
    newLead.interactions[0].leadId = newLead.id;

    db.saveLead(newLead);
    res.status(201).json(newLead);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/leads/:id - Actualizar prospecto
leadsRouter.put('/:id', (req, res) => {
  try {
    const lead = db.getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });

    const data = req.body;
    
    // Registrar cambio de etapa si aplica
    if (data.stage && data.stage !== lead.stage) {
      lead.interactions.unshift({
        id: `int-${Date.now()}`,
        leadId: lead.id,
        date: new Date().toISOString(),
        channel: 'Sistema',
        note: `Etapa cambiada en el embudo: de "${lead.stage}" a "${data.stage}"`
      });
    }

    const updatedLead: Lead = {
      ...lead,
      ...data,
      id: lead.id,
      updatedAt: new Date().toISOString(),
      interactions: data.interactions || lead.interactions
    };

    db.saveLead(updatedLead);
    res.json(updatedLead);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:id/interactions - Agregar interacción (nota, llamada, WhatsApp, reunión)
leadsRouter.post('/:id/interactions', (req, res) => {
  try {
    const lead = db.getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });

    const { channel, note, nextAction, nextActionDate, isIncoming } = req.body;
    if (!note) return res.status(400).json({ error: 'El contenido de la interacción es obligatorio' });

    const newInt: Interaction = {
      id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      leadId: lead.id,
      date: new Date().toISOString(),
      channel: channel || 'Nota interna',
      note,
      isIncoming: Boolean(isIncoming)
    };

    lead.interactions.unshift(newInt);
    lead.lastContactDate = new Date().toISOString();
    lead.updatedAt = new Date().toISOString();

    if (nextAction && nextActionDate) {
      lead.nextAction = nextAction;
      lead.nextActionDate = nextActionDate;
    }

    if (isIncoming) {
      lead.hasUnreadMessage = true;
    } else {
      lead.hasUnreadMessage = false;
    }

    db.saveLead(lead);
    res.status(201).json(lead);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id - Eliminar lead
leadsRouter.delete('/:id', (req, res) => {
  const deleted = db.deleteLead(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Lead no encontrado' });
  res.json({ success: true });
});

// POST /api/leads/import - Importar leads masivamente (ej. desde CSV)
leadsRouter.post('/import', (req, res) => {
  try {
    const { leads: rawLeads, unit: defaultUnit, assignedTo: defaultAssignee } = req.body;
    if (!Array.isArray(rawLeads) || rawLeads.length === 0) {
      return res.status(400).json({ error: 'No se enviaron registros válidos para importar' });
    }

    const existingLeads = db.getLeads();
    let importedCount = 0;
    let duplicatesSkipped = 0;

    for (const item of rawLeads) {
      const name = item.name || item.Nombre || item['Nombre completo'] || item['Cliente'];
      const phone = String(item.phone || item.Teléfono || item.Telefono || item.Celular || '').replace(/\D/g, '');
      const email = item.email || item.Correo || item['Correo electrónico'] || '';

      if (!name || !phone) continue;

      // Verificar duplicado por teléfono o correo
      const isDup = existingLeads.some(l => 
        l.phone.replace(/\D/g, '') === phone || 
        (email && l.email && l.email.toLowerCase() === email.toLowerCase())
      );

      if (isDup && !req.body.allowDuplicates) {
        duplicatesSkipped++;
        continue;
      }

      const newLead: Lead = {
        id: `imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: String(name).trim(),
        company: String(item.company || item.Empresa || item.Organización || '').trim(),
        phone,
        email: String(email).trim(),
        unit: (item.unit || item['Unidad de negocio'] || defaultUnit || 'red_lider') as BusinessUnit,
        source: (item.source || item.Fuente || item.Origen || 'Base antigua') as any,
        stage: (item.stage || item.Etapa || 'demanda') as FunnelStage,
        temperature: (item.temperature || item.Temperatura || 'tibio') as any,
        assignedTo: (item.assignedTo || item.Responsable || defaultAssignee || 'carlos') as any,
        nextAction: item.nextAction || item['Próxima acción'] || 'Llamada de reactivación tras importación',
        nextActionDate: item.nextActionDate || item['Fecha de acción'] || new Date().toISOString().split('T')[0],
        tags: item.tags ? String(item.tags).split(',').map(s => s.trim()) : ['Importado'],
        interactions: [{
          id: `int-${Date.now()}`,
          leadId: '',
          date: new Date().toISOString(),
          channel: 'Sistema',
          note: `Importado masivamente desde archivo Excel/CSV.`
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastContactDate: new Date().toISOString(),
        dealValue: Number(item.dealValue || item.Valor || item.Monto || 0)
      };
      newLead.interactions[0].leadId = newLead.id;

      db.saveLead(newLead);
      existingLeads.push(newLead);
      importedCount++;
    }

    res.json({
      success: true,
      importedCount,
      duplicatesSkipped
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
