/**
 * Rutas e Integraciones con Meta (WhatsApp Cloud API, Messenger, Instagram & Lead Ads)
 */
import express from 'express';
import { db } from '../db.js';
import { Lead, Interaction, WhatsAppTemplate, BusinessUnit } from '../../types.js';

export const metaRouter = express.Router();

// GET /api/meta/status - Estado de la conexión con Meta
metaRouter.get('/status', (req, res) => {
  const cfg = db.getMetaConfig();
  res.json({
    isConnected: Boolean(cfg.accessToken && cfg.accessToken !== 'EAAxxxx_simulated_token'),
    phoneNumberId: cfg.phoneNumberId,
    wabaId: cfg.wabaId,
    hasToken: Boolean(cfg.accessToken),
    verifyTokenConfigured: Boolean(cfg.verifyToken),
    mode: cfg.mode || 'SIMULATED',
    lastWebhookReceived: (cfg as any).lastWebhookReceived || null
  });
});

// POST /api/meta/config - Guardar configuración de Meta
metaRouter.post('/config', (req, res) => {
  const { accessToken, phoneNumberId, wabaId, verifyToken, mode } = req.body;
  db.saveMetaConfig({
    accessToken: accessToken || undefined,
    phoneNumberId: phoneNumberId || undefined,
    wabaId: wabaId || undefined,
    verifyToken: verifyToken || undefined,
    mode: mode || 'SIMULATED'
  });
  res.json({ success: true, config: db.getMetaConfig() });
});

// GET /api/meta/templates - Obtener plantillas de WhatsApp aprobadas/disponibles
metaRouter.get('/templates', (req, res) => {
  const { unit } = req.query;
  let templates = db.getTemplates();
  if (unit && unit !== 'all') {
    templates = templates.filter(t => t.unit === unit || t.unit === 'all' || !t.unit);
  }
  res.json(templates);
});

// POST /api/meta/templates - Crear o registrar nueva plantilla
metaRouter.post('/templates', (req, res) => {
  const { name, category, language, bodyText, variables, unit, description } = req.body;
  if (!name || !bodyText) return res.status(400).json({ error: 'Nombre y cuerpo son obligatorios' });

  const newTpl: WhatsAppTemplate = {
    id: `tpl-${Date.now()}`,
    name: name.toLowerCase().replace(/\s+/g, '_'),
    category: category || 'MARKETING',
    language: language || 'es_PE',
    bodyText,
    variables: variables || [],
    status: 'APPROVED', // Simulado como aprobado para pruebas en AI Studio
    unit: unit || 'all',
    description: description || ''
  };

  db.saveTemplate(newTpl);
  res.status(201).json(newTpl);
});

// POST /api/meta/send - Enviar mensaje por WhatsApp Cloud API (con control de ventana 24h)
metaRouter.post('/send', async (req, res) => {
  try {
    const { leadId, templateId, customText, variableValues, ignore24h } = req.body;
    const lead = db.getLeadById(leadId);
    if (!lead) return res.status(404).json({ error: 'Prospecto no encontrado' });

    const cfg = db.getMetaConfig();
    const cleanPhone = lead.phone.replace(/\D/g, '');

    // Verificar ventana de 24 horas (desde última interacción entrante)
    const now = new Date().getTime();
    const lastContactTime = new Date(lead.lastContactDate || 0).getTime();
    const hoursSinceLastContact = (now - lastContactTime) / (1000 * 60 * 60);
    const isWithin24h = hoursSinceLastContact <= 24;

    let messageSentText = '';

    if (!isWithin24h && !templateId && !ignore24h) {
      return res.status(403).json({
        error: 'Regla de Meta: Han pasado más de 24 horas desde el último mensaje entrante del cliente. Debes usar una plantilla aprobada por Meta.',
        requiresTemplate: true,
        hoursElapsed: Math.round(hoursSinceLastContact)
      });
    }

    if (templateId) {
      const tpl = db.getTemplates().find(t => t.id === templateId || t.name === templateId);
      if (!tpl) return res.status(404).json({ error: 'Plantilla no encontrada' });

      // Reemplazar variables {{1}}, {{2}} en el texto
      let text = tpl.bodyText;
      if (Array.isArray(variableValues)) {
        variableValues.forEach((val, i) => {
          text = text.replace(`{{${i + 1}}}`, val || '');
        });
      } else {
        // Relleno por defecto
        text = text.replace('{{1}}', lead.name).replace('{{2}}', lead.company || 'su empresa');
      }
      messageSentText = `[Plantilla: ${tpl.name}] ${text}`;
    } else {
      messageSentText = customText;
    }

    // Si estamos en modo LIVE y tenemos token real, intentamos llamada HTTP real a Meta Cloud API
    let apiStatus = 'Simulado y registrado en historial';
    if (cfg.mode === 'LIVE' && cfg.accessToken && cfg.accessToken !== 'EAAxxxx_simulated_token') {
      try {
        const url = `https://graph.facebook.com/v19.0/${cfg.phoneNumberId}/messages`;
        const payload: any = {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: templateId ? 'template' : 'text'
        };

        if (templateId) {
          const tpl = db.getTemplates().find(t => t.id === templateId || t.name === templateId);
          payload.template = {
            name: tpl?.name,
            language: { code: tpl?.language || 'es' },
            components: Array.isArray(variableValues) && variableValues.length > 0 ? [
              {
                type: 'body',
                parameters: variableValues.map(v => ({ type: 'text', text: v }))
              }
            ] : []
          };
        } else {
          payload.text = { body: customText };
        }

        const fetchRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfg.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const jsonRes = await fetchRes.json();
        if (!fetchRes.ok) {
          console.warn('Advertencia API Meta:', jsonRes);
          apiStatus = `Error Meta API: ${jsonRes?.error?.message || 'Revisar credenciales'}. Registrado localmente.`;
        } else {
          apiStatus = `Enviado con éxito vía Meta Cloud API (ID: ${jsonRes.messages?.[0]?.id || 'ok'})`;
        }
      } catch (apiErr: any) {
        console.error('Error enviando a Meta Graph API:', apiErr);
        apiStatus = `Fallo de red al contactar Meta. Registrado localmente.`;
      }
    }

    // Registrar en el historial de interacciones del lead
    const newInt: Interaction = {
      id: `int-${Date.now()}`,
      leadId: lead.id,
      date: new Date().toISOString(),
      channel: 'WhatsApp',
      note: `Enviado por WhatsApp: "${messageSentText}" (${apiStatus})`,
      isIncoming: false,
      isAutomated: Boolean(templateId)
    };

    lead.interactions.unshift(newInt);
    lead.lastContactDate = new Date().toISOString();
    lead.updatedAt = new Date().toISOString();
    lead.hasUnreadMessage = false;
    db.saveLead(lead);

    res.json({
      success: true,
      apiStatus,
      messageSent: messageSentText,
      lead
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/webhook/meta - VERIFICACIÓN OFICIAL DE META (hub.verify_token & hub.challenge)
metaRouter.get('/webhook', (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const cfg = db.getMetaConfig();
    const expectedToken = cfg.verifyToken || process.env.META_VERIFY_TOKEN || 'redlider_secret_token_2026';

    console.log(`[Meta Webhook Verify] mode=${mode}, token=${token}, expected=${expectedToken}`);

    if (mode && token) {
      if (mode === 'subscribe' && token === expectedToken) {
        console.log('¡Webhook de Meta verificado exitosamente!');
        return res.status(200).send(challenge);
      } else {
        console.warn('Fallo en verificación de Webhook de Meta: Token no coincide.');
        return res.status(403).json({ error: 'Verify token mismatch' });
      }
    }
    res.status(400).json({ error: 'Faltan parámetros hub.mode o hub.verify_token' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/webhook/meta - RECEPCIÓN DE MENSAJES ENTRANTES (WhatsApp, Messenger, Instagram, Lead Ads)
metaRouter.post('/webhook', (req, res) => {
  try {
    const body = req.body;
    console.log('[Meta Webhook Received POST]:', JSON.stringify(body, null, 2));

    // Meta requiere responder 200 OK inmediatamente
    res.status(200).send('EVENT_RECEIVED');

    // Procesar asincrónicamente
    processIncomingWebhook(body);
  } catch (err: any) {
    console.error('Error procesando webhook de Meta:', err);
  }
});

// POST /api/meta/simulate-webhook - Simulador interactivo en UI para pruebas instantáneas
metaRouter.post('/simulate-webhook', (req, res) => {
  try {
    const { type, senderPhone, senderName, messageText, leadAdData } = req.body;
    let simulatedPayload: any = {};

    if (type === 'whatsapp' || type === 'messenger' || type === 'instagram') {
      simulatedPayload = {
        object: type === 'whatsapp' ? 'whatsapp_business_account' : 'page',
        entry: [{
          id: '103xxx_simulated',
          changes: [{
            value: {
              messaging_product: type,
              metadata: { display_phone_number: '51900000000', phone_number_id: '104xxx' },
              contacts: [{ profile: { name: senderName || 'Cliente Simulado' }, wa_id: senderPhone || '51988887777' }],
              messages: [{
                from: senderPhone || '51988887777',
                id: `wamid.sim_${Date.now()}`,
                timestamp: String(Math.floor(Date.now() / 1000)),
                text: { body: messageText || 'Hola, quisiera información de precios del Zapotal' },
                type: 'text'
              }]
            },
            field: 'messages'
          }]
        }]
      };
    } else if (type === 'leadgen') {
      // Anuncio de Facebook Ads / Meta Lead Ads
      simulatedPayload = {
        object: 'page',
        entry: [{
          id: 'page_12345',
          changes: [{
            field: 'leadgen',
            value: {
              ad_id: 'ad_98765',
              form_id: 'form_elzapotal_2026',
              leadgen_id: `leadgen_${Date.now()}`,
              created_time: Math.floor(Date.now() / 1000),
              page_id: 'page_12345',
              // Extra temporal data para simulación inmediata
              simulated_data: leadAdData || {
                full_name: senderName || 'Lead de Anuncio Facebook',
                phone_number: senderPhone || '51955554444',
                email: 'lead@anunciofb.pe',
                unit: 'el_zapotal',
                campaign: 'Campaña Lotes Primavera 2026'
              }
            }
          }]
        }]
      };
    }

    const result = processIncomingWebhook(simulatedPayload);
    res.json({
      success: true,
      message: 'Simulación de evento de Meta procesada exitosamente en el CRM',
      result
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper de procesamiento de Webhooks
function processIncomingWebhook(body: any): any {
  const leads = db.getLeads();
  let actionTaken = 'No action';
  let targetLead: Lead | undefined;

  try {
    if (body.object === 'whatsapp_business_account' || body.entry?.[0]?.changes?.[0]?.value?.messages) {
      const changeValue = body.entry?.[0]?.changes?.[0]?.value;
      const messageObj = changeValue?.messages?.[0];
      const contactObj = changeValue?.contacts?.[0];

      if (messageObj) {
        const phone = String(messageObj.from || '').replace(/\D/g, '');
        const senderName = contactObj?.profile?.name || `Cliente WhatsApp (${phone})`;
        const text = messageObj.text?.body || messageObj.button?.text || '[Mensaje multimedia o interactivo]';
        const channel = changeValue.messaging_product === 'whatsapp' ? 'WhatsApp' : 'Messenger';

        targetLead = leads.find(l => l.phone.replace(/\D/g, '') === phone);

        if (targetLead) {
          // Agregar al historial de interacciones
          targetLead.interactions.unshift({
            id: `int-${Date.now()}`,
            leadId: targetLead.id,
            date: new Date().toISOString(),
            channel: channel as any,
            note: `[📥 MENSAJE ENTRANTE]: "${text}"`,
            isIncoming: true
          });
          targetLead.lastContactDate = new Date().toISOString();
          targetLead.updatedAt = new Date().toISOString();
          targetLead.hasUnreadMessage = true;
          // Actualizar próxima acción para no perder el hilo
          targetLead.nextAction = `⚠️ RESPONDER MENSAJE ENTRANTE DE ${channel.toUpperCase()}`;
          targetLead.nextActionDate = new Date().toISOString().split('T')[0];
          db.saveLead(targetLead);
          actionTaken = `Interacción adjuntada al prospecto existente: ${targetLead.name}`;
        } else {
          // Crear prospecto nuevo automáticamente
          // Detectar unidad de negocio por palabras clave en el mensaje
          let detectedUnit: BusinessUnit = 'red_lider';
          const lowerText = text.toLowerCase();
          if (lowerText.includes('lote') || lowerText.includes('zapotal') || lowerText.includes('terreno') || lowerText.includes('inmobiliari') || lowerText.includes('m2')) {
            detectedUnit = 'el_zapotal';
          } else if (lowerText.includes('software') || lowerText.includes('sistema') || lowerText.includes('crm') || lowerText.includes('bot') || lowerText.includes('app') || lowerText.includes('api')) {
            detectedUnit = 'software';
          }

          const newLead: Lead = {
            id: `wa-${Date.now()}`,
            name: senderName,
            phone,
            unit: detectedUnit,
            source: channel === 'WhatsApp' ? 'WhatsApp entrante' : 'Messenger',
            stage: 'demanda',
            temperature: 'caliente',
            assignedTo: 'agendadora', // Asignación inicial
            nextAction: `⚠️ ATENDER NUEVO LEAD POR ${channel.toUpperCase()}: Responder consulta inicial`,
            nextActionDate: new Date().toISOString().split('T')[0],
            tags: [channel, 'Automático', 'Entrante'],
            interactions: [{
              id: `int-${Date.now()}`,
              leadId: '',
              date: new Date().toISOString(),
              channel: channel as any,
              note: `[📥 NUEVO LEAD ENTRANTE]: "${text}"`,
              isIncoming: true
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastContactDate: new Date().toISOString(),
            dealValue: detectedUnit === 'el_zapotal' ? 40000 : (detectedUnit === 'software' ? 15000 : 8000),
            hasUnreadMessage: true
          };
          newLead.interactions[0].leadId = newLead.id;
          db.saveLead(newLead);
          targetLead = newLead;
          actionTaken = `Nuevo lead creado automáticamente: ${senderName} (${detectedUnit})`;
        }
      }
    } else if (body.entry?.[0]?.changes?.[0]?.field === 'leadgen') {
      // Captura de anuncios Meta Lead Ads (Facebook / Instagram Ads)
      const leadgenVal = body.entry?.[0]?.changes?.[0]?.value;
      const simData = leadgenVal?.simulated_data || {};
      const phone = String(simData.phone_number || '51900112244').replace(/\D/g, '');
      const name = simData.full_name || `Lead Anuncio Facebook #${leadgenVal?.leadgen_id?.substring(0, 5) || '123'}`;
      const email = simData.email || '';
      const unit = (simData.unit || 'el_zapotal') as BusinessUnit;

      // Verificar si ya existe
      targetLead = leads.find(l => l.phone.replace(/\D/g, '') === phone || (email && l.email === email));
      if (!targetLead) {
        const newLead: Lead = {
          id: `leadgen-${Date.now()}`,
          name,
          phone,
          email,
          unit,
          source: 'Facebook Ads',
          stage: 'demanda',
          temperature: 'caliente',
          assignedTo: 'agendadora',
          nextAction: '⚡ Llamar en menos de 15 minutos: Lead recién capturado por anuncio de Facebook',
          nextActionDate: new Date().toISOString().split('T')[0],
          tags: ['Facebook Ads', 'Meta Lead Ads', simData.campaign || 'Campaña Meta'],
          interactions: [{
            id: `int-${Date.now()}`,
            leadId: '',
            date: new Date().toISOString(),
            channel: 'Sistema',
            note: `[🚀 META LEAD ADS]: Lead capturado en formulario de Facebook/Instagram. Campaña: ${simData.campaign || 'General'}.`
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastContactDate: new Date().toISOString(),
          dealValue: unit === 'el_zapotal' ? 45000 : 12000,
          hasUnreadMessage: true
        };
        newLead.interactions[0].leadId = newLead.id;
        db.saveLead(newLead);
        targetLead = newLead;
        actionTaken = `Lead de Meta Lead Ads creado automáticamente: ${name}`;
      }
    }

    // Actualizar timestamp en config
    db.saveMetaConfig({ lastWebhookReceived: new Date().toISOString() } as any);
  } catch (err) {
    console.error('Error interno en processIncomingWebhook:', err);
  }

  return { actionTaken, leadId: targetLead?.id, leadName: targetLead?.name };
}
