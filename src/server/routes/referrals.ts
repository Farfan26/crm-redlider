/**
 * Rutas del Módulo de Referidos
 */
import express from 'express';
import { db } from '../db.js';
import { ReferralRecord, Lead, BusinessUnit } from '../../types.js';

export const referralsRouter = express.Router();

// GET /api/referrals - Obtener referidos
referralsRouter.get('/', (req, res) => {
  const { unit } = req.query;
  let refs = db.getReferrals();
  if (unit && unit !== 'all') {
    refs = refs.filter(r => r.unit === unit);
  }
  res.json(refs);
});

// POST /api/referrals - Registrar nuevo referido ("Quién refirió a quién")
referralsRouter.post('/', (req, res) => {
  try {
    const { referrerName, referrerPhone, referredName, referredPhone, unit, saleAmount, createLead } = req.body;
    if (!referrerName || !referredName || !referredPhone) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    let referredLeadId: string | undefined;

    // Si se pidió crear el lead automáticamente en el embudo
    if (createLead) {
      const cleanPhone = String(referredPhone).replace(/\D/g, '');
      const existingLeads = db.getLeads();
      let targetLead = existingLeads.find(l => l.phone.replace(/\D/g, '') === cleanPhone);

      if (!targetLead) {
        targetLead = {
          id: `lead-ref-${Date.now()}`,
          name: referredName,
          phone: cleanPhone,
          unit: (unit || 'red_lider') as BusinessUnit,
          source: 'Referido',
          stage: 'demanda',
          temperature: 'caliente',
          assignedTo: 'oscar',
          nextAction: `🤝 Llamar al nuevo referido de VIP ${referrerName} y agradecer recomendación`,
          nextActionDate: new Date().toISOString().split('T')[0],
          tags: ['Referido', `Referidor: ${referrerName}`],
          interactions: [{
            id: `int-${Date.now()}`,
            leadId: '',
            date: new Date().toISOString(),
            channel: 'Sistema',
            note: `[🌟 REFERIDO VIP]: Recomendado por ${referrerName} (${referrerPhone || 'Socio'}).`
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastContactDate: new Date().toISOString(),
          dealValue: Number(saleAmount) || 20000,
          referredByName: referrerName
        };
        targetLead.interactions[0].leadId = targetLead.id;
        db.saveLead(targetLead);
      }
      referredLeadId = targetLead.id;
    }

    const newRef: ReferralRecord = {
      id: `ref-${Date.now()}`,
      referrerName,
      referrerPhone: referrerPhone || '',
      referredLeadId,
      referredName,
      referredPhone: String(referredPhone).replace(/\D/g, ''),
      unit: (unit || 'red_lider') as BusinessUnit,
      status: 'solicitado',
      saleAmount: Number(saleAmount) || 0,
      date: new Date().toISOString().split('T')[0]
    };

    db.saveReferral(newRef);
    res.status(201).json(newRef);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/referrals/:id/status - Actualizar estado de referido (solicitado, recibido, contactado, convertido)
referralsRouter.put('/:id/status', (req, res) => {
  const { status, saleAmount } = req.body;
  const ref = db.getReferrals().find(r => r.id === req.params.id);
  if (!ref) return res.status(404).json({ error: 'Referido no encontrado' });

  ref.status = status;
  if (saleAmount !== undefined) ref.saleAmount = Number(saleAmount);

  db.saveReferral(ref);

  // Si está vinculado a un lead y cambió a convertido, pasarlo a etapa referidos/cierre en el CRM
  if (status === 'convertido' && ref.referredLeadId) {
    const lead = db.getLeadById(ref.referredLeadId);
    if (lead) {
      lead.stage = 'referidos';
      lead.interactions.unshift({
        id: `int-${Date.now()}`,
        leadId: lead.id,
        date: new Date().toISOString(),
        channel: 'Sistema',
        note: `[🏆 REFERIDO CONVERTIDO]: Venta cerrada por S/ ${(ref.saleAmount || 0).toLocaleString('es-PE')}`
      });
      if (ref.saleAmount) lead.dealValue = ref.saleAmount;
      db.saveLead(lead);
    }
  }

  res.json(ref);
});
