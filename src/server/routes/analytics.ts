/**
 * Rutas de Indicadores (Dashboard BI) & Reporte Comercial Semanal
 */
import express from 'express';
import { db } from '../db.js';
import { DashboardKPIs, WeeklyReportData, BusinessUnit } from '../../types.js';

export const analyticsRouter = express.Router();

// GET /api/analytics/kpis - Obtener indicadores clave filtrados
analyticsRouter.get('/kpis', (req, res) => {
  try {
    const { unit, assignedTo, startDate, endDate } = req.query;
    let leads = db.getLeads();

    // Filtros
    if (unit && unit !== 'all') {
      leads = leads.filter(l => l.unit === unit);
    }
    if (assignedTo && assignedTo !== 'all') {
      leads = leads.filter(l => l.assignedTo === assignedTo);
    }
    if (startDate) {
      leads = leads.filter(l => l.createdAt.substring(0, 10) >= String(startDate));
    }
    if (endDate) {
      leads = leads.filter(l => l.createdAt.substring(0, 10) <= String(endDate));
    }

    const cplMap = db.getCpl();
    const today = new Date().toISOString().split('T')[0];

    // Cálculos de KPI
    const totalLeads = leads.length;
    const leadsByUnit: Record<BusinessUnit, number> = { red_lider: 0, el_zapotal: 0, software: 0 };
    const leadsBySource: Record<string, number> = {};
    let contactedCount = 0;
    let meetingsScheduled = 0;
    let visitsScheduled = 0;
    let proposalsSent = 0;
    let separationsMade = 0;
    let contractsClosed = 0;
    let totalSalesValue = 0;
    let overdueCount = 0;
    let noActionCount = 0;
    let totalDaysWithoutContact = 0;

    leads.forEach(l => {
      // Por unidad
      if (l.unit in leadsByUnit) {
        leadsByUnit[l.unit]++;
      }
      // Por fuente
      leadsBySource[l.source] = (leadsBySource[l.source] || 0) + 1;

      // Etapas de conversión
      if (l.stage !== 'demanda') contactedCount++;
      if (l.stage === 'diagnostico' || l.stage === 'demostracion' || l.interactions.some(i => i.channel === 'Reunión')) {
        meetingsScheduled++;
      }
      if (l.stage === 'visita' || l.interactions.some(i => i.channel === 'Visita')) {
        visitsScheduled++;
      }
      if (l.stage === 'propuesta' || l.stage === 'negociacion') {
        proposalsSent++;
      }
      if (l.stage === 'separacion') {
        separationsMade++;
      }
      if (l.stage === 'cierre' || l.stage === 'contrato' || l.stage === 'referidos') {
        contractsClosed++;
        totalSalesValue += (l.dealValue || 0);
      }

      // Salud de seguimiento
      if (!l.nextAction || !l.nextActionDate) {
        noActionCount++;
      } else if (l.nextActionDate < today) {
        overdueCount++;
      }

      // Días sin contacto
      const lastContact = new Date(l.lastContactDate || l.createdAt || 0).getTime();
      const diffDays = Math.max(0, (Date.now() - lastContact) / (1000 * 60 * 60 * 24));
      totalDaysWithoutContact += diffDays;
    });

    const contactRate = totalLeads > 0 ? Math.round((contactedCount / totalLeads) * 100) : 0;
    const closeRate = totalLeads > 0 ? Math.round((contractsClosed / totalLeads) * 100) : 0;
    const avgDaysWithoutContact = totalLeads > 0 ? Math.round(totalDaysWithoutContact / totalLeads) : 0;

    // Métricas de referidos
    const refs = db.getReferrals();
    let refSalesAmount = 0;
    refs.filter(r => r.status === 'convertido').forEach(r => refSalesAmount += (r.saleAmount || 0));
    const referralsMetrics = {
      solicitados: refs.filter(r => r.status === 'solicitado').length,
      recibidos: refs.filter(r => r.status === 'recibido').length,
      contactados: refs.filter(r => r.status === 'contactado').length,
      convertidos: refs.filter(r => r.status === 'convertido').length,
      salesAmount: refSalesAmount
    };

    // Conversión por etapas agregada
    const stagesList = [
      { id: 'demanda', label: '1. Gen. Demanda / Nuevos' },
      { id: 'calificacion', label: '2. Calificación' },
      { id: 'diagnostico_visita_demo', label: '3. Diagnóstico / Visita / Demo' },
      { id: 'propuesta_separacion', label: '4. Propuesta / Separación' },
      { id: 'negociacion_seguimiento', label: '5. Negociación / Seguimiento' },
      { id: 'cierre_contrato', label: '6. Cierre / Contrato' }
    ];

    const stageConversion = stagesList.map(st => {
      let cnt = 0;
      if (st.id === 'demanda') cnt = leads.filter(l => l.stage === 'demanda').length;
      else if (st.id === 'calificacion') cnt = leads.filter(l => l.stage === 'calificacion').length;
      else if (st.id === 'diagnostico_visita_demo') cnt = leads.filter(l => l.stage === 'diagnostico' || l.stage === 'visita' || l.stage === 'demostracion').length;
      else if (st.id === 'propuesta_separacion') cnt = leads.filter(l => l.stage === 'propuesta' || l.stage === 'separacion').length;
      else if (st.id === 'negociacion_seguimiento') cnt = leads.filter(l => l.stage === 'negociacion' || l.stage === 'seguimiento').length;
      else if (st.id === 'cierre_contrato') cnt = leads.filter(l => l.stage === 'cierre' || l.stage === 'contrato' || l.stage === 'referidos').length;

      return {
        stage: st.id,
        label: st.label,
        count: cnt,
        percentage: totalLeads > 0 ? Math.round((cnt / totalLeads) * 100) : 0
      };
    });

    // Tendencia semanal simulada
    const weeklyTrend = [
      { week: 'Semana 1', leads: Math.max(2, Math.round(totalLeads * 0.15)), sales: Math.round(contractsClosed * 0.2) },
      { week: 'Semana 2', leads: Math.max(3, Math.round(totalLeads * 0.25)), sales: Math.round(contractsClosed * 0.3) },
      { week: 'Semana 3', leads: Math.max(4, Math.round(totalLeads * 0.30)), sales: Math.round(contractsClosed * 0.25) },
      { week: 'Semana Actual', leads: Math.max(5, Math.round(totalLeads * 0.30)), sales: Math.round(contractsClosed * 0.25) }
    ];

    const result: DashboardKPIs = {
      totalLeads,
      leadsByUnit,
      leadsBySource,
      cplBySource: cplMap,
      contactRate,
      meetingsScheduled,
      visitsScheduled,
      proposalsSent,
      separationsMade,
      contractsClosed,
      closeRate,
      totalSalesValue,
      overdueCount,
      noActionCount,
      avgDaysWithoutContact,
      referralsMetrics,
      stageConversion,
      weeklyTrend
    };

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/weekly-report - Generar Reporte Comercial Semanal
analyticsRouter.get('/weekly-report', (req, res) => {
  try {
    const { unit } = req.query;
    let leads = db.getLeads();
    const unitLabel = unit === 'red_lider' ? 'Red Líder (Consultoría & Cursos)' : (unit === 'el_zapotal' ? 'El Zapotal (Lotes Inmobiliarios)' : (unit === 'software' ? 'Software & Proyectos' : 'Todas las Unidades'));

    if (unit && unit !== 'all') {
      leads = leads.filter(l => l.unit === unit);
    }

    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    // Contadores de la última semana
    const newLeads = leads.filter(l => l.createdAt.substring(0, 10) >= sevenDaysAgo);
    const contacted = leads.filter(l => l.stage !== 'demanda');
    const meetings = leads.filter(l => l.stage === 'diagnostico' || l.stage === 'demostracion');
    const visits = leads.filter(l => l.stage === 'visita');
    const proposals = leads.filter(l => l.stage === 'propuesta' || l.stage === 'negociacion');
    const separations = leads.filter(l => l.stage === 'separacion');
    const closures = leads.filter(l => l.stage === 'cierre' || l.stage === 'contrato' || l.stage === 'referidos');

    let totalRevenue = 0;
    closures.forEach(c => totalRevenue += (c.dealValue || 0));

    const overdueLeads = leads.filter(l => l.nextActionDate && l.nextActionDate < today);

    // Oportunidades calientes
    const hotOpportunities = leads
      .filter(l => l.temperature === 'caliente' && l.stage !== 'cierre' && l.stage !== 'contrato' && l.stage !== 'referidos')
      .slice(0, 8)
      .map(l => ({
        name: l.name,
        unit: l.unit === 'red_lider' ? 'Red Líder' : (l.unit === 'el_zapotal' ? 'El Zapotal' : 'Software'),
        stage: l.stage,
        nextAction: l.nextAction,
        dealValue: l.dealValue,
        phone: l.phone
      }));

    // Formatear el texto de reporte estilo WhatsApp / Correo ejecutivo
    let text = `📊 *REPORTE COMERCIAL SEMANAL - RED LÍDER*\n`;
    text += `📅 Fecha: ${new Date().toLocaleDateString('es-PE')} | Unidad: *${unitLabel}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    text += `🎯 *RESUMEN DE RESULTADOS DE LA SEMANA:*\n`;
    text += `🔹 *Prospectos Nuevos:* ${newLeads.length}\n`;
    text += `🔹 *Leads Contactados / Calificados:* ${contacted.length}\n`;
    text += `🔹 *Citas / Diagnósticos / Demos:* ${meetings.length}\n`;
    text += `🔹 *Visitas al Terreno (Zapotal):* ${visits.length}\n`;
    text += `🔹 *Propuestas / Cotizaciones Enviadas:* ${proposals.length}\n`;
    text += `🔹 *Separaciones de Lote:* ${separations.length}\n`;
    text += `🏆 *CIERRES / CONTRATOS:* ${closures.length}\n`;
    text += `💰 *Volumen Total Negociado:* S/ ${totalRevenue.toLocaleString('es-PE')}\n\n`;

    text += `⚠️ *SALUD DEL EMBUDO & SEGUIMIENTOS:*\n`;
    text += `⏰ *Seguimientos Vencidos:* ${overdueLeads.length} prospectos requieren atención inmediata.\n\n`;

    if (hotOpportunities.length > 0) {
      text += `🔥 *TOP OPORTUNIDADES CALIENTES POR CERRAR:*\n`;
      hotOpportunities.forEach((h, idx) => {
        text += `${idx + 1}. *${h.name}* (${h.unit}) - S/ ${(h.dealValue || 0).toLocaleString('es-PE')}\n`;
        text += `   📌 Próxima acción: ${h.nextAction}\n`;
      });
      text += `\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🚀 *Generado automáticamente por el Sistema Comercial Red Líder*`;

    const reportData: WeeklyReportData = {
      generatedAt: new Date().toISOString(),
      unitFilter: unitLabel,
      newLeadsCount: newLeads.length,
      contactedCount: contacted.length,
      meetingsCount: meetings.length,
      visitsCount: visits.length,
      proposalsCount: proposals.length,
      separationsCount: separations.length,
      closuresCount: closures.length,
      totalRevenue,
      overdueCount: overdueLeads.length,
      hotOpportunities,
      formattedText: text
    };

    res.json(reportData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET & POST /api/analytics/cpl - Obtener y actualizar Costos Por Lead
analyticsRouter.get('/cpl', (req, res) => {
  res.json(db.getCpl());
});

analyticsRouter.post('/cpl', (req, res) => {
  db.saveCpl(req.body);
  res.json({ success: true, cpl: db.getCpl() });
});
