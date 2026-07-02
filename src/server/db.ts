/**
 * Sistema Comercial Red Líder - Backend Database Engine
 * Utiliza SQLite vía better-sqlite3 con respaldo automático en memoria/archivo JSON
 */
import fs from 'fs';
import path from 'path';
import { Lead, Interaction, WhatsAppTemplate, EventWebinar, EventAttendee, ReferralRecord, BusinessUnit } from '../types.js';

const DATA_DIR = path.join(process.cwd(), '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'redlider_crm.json');

// Datos iniciales de demostración (5 por unidad de negocio)
const INITIAL_LEADS: Lead[] = [
  // --- RED LÍDER (Consultoría B2B, Cursos, Webinars) ---
  {
    id: 'rl-101',
    name: 'Ing. Marcos Benavides',
    company: 'Constructora Benavides SAC',
    phone: '51987654321',
    email: 'mbenavides@constructora-b.pe',
    unit: 'red_lider',
    source: 'LinkedIn',
    stage: 'propuesta',
    temperature: 'caliente',
    assignedTo: 'oscar',
    nextAction: 'Reunión de sustentación técnica de consultoría comercial B2B',
    nextActionDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
    tags: ['B2B', 'Alta gerencia', 'Consultoría'],
    interactions: [
      { id: 'int-1', leadId: 'rl-101', date: new Date(Date.now() - 3 * 86400000).toISOString(), channel: 'LinkedIn', note: 'Contacto inicial interesado en mejorar procesos de ventas del equipo técnico.' },
      { id: 'int-2', leadId: 'rl-101', date: new Date(Date.now() - 1 * 86400000).toISOString(), channel: 'Reunión', note: 'Diagnóstico por Zoom realizado con éxito. Se elaboró propuesta por S/ 15,000.' }
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    dealValue: 15000
  },
  {
    id: 'rl-102',
    name: 'Lic. Patricia Ramírez',
    company: 'Agencia de Aduanas Ramírez',
    phone: '51998877665',
    email: 'pramirez@aduanasramirez.com',
    unit: 'red_lider',
    source: 'Webinar',
    stage: 'diagnostico',
    temperature: 'tibio',
    assignedTo: 'agendadora',
    nextAction: 'Confirmar asistencia a diagnóstico personalizado por Zoom',
    nextActionDate: new Date().toISOString().split('T')[0], // Hoy
    tags: ['Webinar', 'Capacitación', 'In-company'],
    interactions: [
      { id: 'int-3', leadId: 'rl-102', date: new Date(Date.now() - 4 * 86400000).toISOString(), channel: 'WhatsApp', note: 'Asistió al webinar "Ingresos Predecibles 2026". Solicito información sobre curso para 10 ejecutivos.' }
    ],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    dealValue: 8500
  },
  {
    id: 'rl-103',
    name: 'Carlos Alberto Soto',
    company: 'Distribuidora NorPerú',
    phone: '51912345678',
    email: 'csoto@norperu.com.pe',
    unit: 'red_lider',
    source: 'Referido',
    stage: 'demanda',
    temperature: 'caliente',
    assignedTo: 'oscar',
    nextAction: 'Llamada de calificación inicial (Referido por Óscar Benavides)',
    nextActionDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // VENCIDO (hace 2 días)
    tags: ['Referido VIP', 'Trujillo'],
    interactions: [
      { id: 'int-4', leadId: 'rl-103', date: new Date(Date.now() - 6 * 86400000).toISOString(), channel: 'WhatsApp', note: 'Referido de cliente antiguo. Quiere una reingeniería de su fuerza de ventas exterior.' }
    ],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    dealValue: 22000
  },
  {
    id: 'rl-104',
    name: 'Dra. Sofía Lozano',
    company: 'Clínica Dental Sonrisas',
    phone: '51955443322',
    email: 'slozano@clinicasonrisas.pe',
    unit: 'red_lider',
    source: 'Facebook Ads',
    stage: 'seguimiento',
    temperature: 'tibio',
    assignedTo: 'carlos',
    nextAction: 'Enviar caso de éxito del sector salud por WhatsApp',
    nextActionDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    tags: ['Salud', 'Pyme'],
    interactions: [
      { id: 'int-5', leadId: 'rl-104', date: new Date(Date.now() - 10 * 86400000).toISOString(), channel: 'Llamada', note: 'Se envió propuesta de taller comercial S/ 4,500. Evaluando en comité directivo.' }
    ],
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    dealValue: 4500
  },
  {
    id: 'rl-105',
    name: 'Roberto Gómez',
    company: 'Textiles del Sur SAC',
    phone: '51944332211',
    email: 'rgomez@textilsur.pe',
    unit: 'red_lider',
    source: 'Base antigua',
    stage: 'calificacion',
    temperature: 'frio',
    assignedTo: 'carlos',
    nextAction: 'Enviar mensaje de reactivación 2026',
    nextActionDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], // VENCIDO (hace 5 días)
    tags: ['Reactivar', 'Textil'],
    interactions: [
      { id: 'int-6', leadId: 'rl-105', date: new Date(Date.now() - 45 * 86400000).toISOString(), channel: 'Correo', note: 'Cliente de curso en 2024. No se le ha contactado en más de un mes.' }
    ],
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 45 * 86400000).toISOString(),
    dealValue: 6000
  },

  // --- EL ZAPOTAL (Venta de Lotes Inmobiliarios) ---
  {
    id: 'zap-201',
    name: 'Jorge Luis Mendoza',
    phone: '51966554433',
    email: 'jmendoza@gmail.com',
    unit: 'el_zapotal',
    source: 'Facebook Ads',
    stage: 'visita',
    temperature: 'caliente',
    assignedTo: 'vendedor',
    nextAction: 'Visita guiada al terreno en El Zapotal este domingo 10:00 AM',
    nextActionDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    tags: ['Lote 200m2', 'Inversión', 'Movilidad solicitada'],
    interactions: [
      { id: 'int-7', leadId: 'zap-201', date: new Date(Date.now() - 2 * 86400000).toISOString(), channel: 'WhatsApp', note: 'Interesado en lotes de la Etapa 2 con vista a áreas verdes. Se coordinó movilidad desde el centro.' }
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    dealValue: 45000
  },
  {
    id: 'zap-202',
    name: 'Andrea Palomino Torres',
    phone: '51977665544',
    email: 'apalomino@yahoo.es',
    unit: 'el_zapotal',
    source: 'Instagram',
    stage: 'separacion',
    temperature: 'caliente',
    assignedTo: 'vendedor',
    nextAction: 'Confirmar voucher de depósito de separación (S/ 1,000) por WhatsApp',
    nextActionDate: new Date().toISOString().split('T')[0], // Hoy
    tags: ['Lote Esquina', 'Etapa 1', 'Crédito directo'],
    interactions: [
      { id: 'int-8', leadId: 'zap-202', date: new Date(Date.now() - 1 * 86400000).toISOString(), channel: 'Visita', note: 'Asistió a visita familiar al proyecto El Zapotal. Encantados con el Lote C-14. Pidió tiempo hasta la tarde.' }
    ],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    dealValue: 52000
  },
  {
    id: 'zap-203',
    name: 'Esteban Quispe Huamán',
    phone: '51933221100',
    email: 'equispeh@hotmail.com',
    unit: 'el_zapotal',
    source: 'Alianza',
    stage: 'calificacion',
    temperature: 'tibio',
    assignedTo: 'agendadora',
    nextAction: 'Llamar por la tarde para explicar planes de financiamiento directo a 36 meses',
    nextActionDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], // VENCIDO (hace 1 día)
    tags: ['Alianza Magisterial', 'Financiamiento'],
    interactions: [
      { id: 'int-9', leadId: 'zap-203', date: new Date(Date.now() - 3 * 86400000).toISOString(), channel: 'WhatsApp', note: 'Viene del convenio magisterial. Quiere saber si hay descuento en cuota inicial.' }
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    dealValue: 38000
  },
  {
    id: 'zap-204',
    name: 'Lucía Fernández Castillo',
    phone: '51922334455',
    email: 'lfernandez@outlook.com',
    unit: 'el_zapotal',
    source: 'Facebook Ads',
    stage: 'seguimiento',
    temperature: 'frio',
    assignedTo: 'carlos',
    nextAction: 'Enviar avance de obras de pórtico y pistas en El Zapotal',
    nextActionDate: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0], // VENCIDO (hace 12 días)
    tags: ['Inversor', 'Etapa 2'],
    interactions: [
      { id: 'int-10', leadId: 'zap-204', date: new Date(Date.now() - 35 * 86400000).toISOString(), channel: 'WhatsApp', note: 'Preguntó precios por WhatsApp tras ver anuncio. Se le envió brochure en PDF.' }
    ],
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 35 * 86400000).toISOString(),
    dealValue: 40000
  },
  {
    id: 'zap-205',
    name: 'Víctor Hugo Paredes',
    phone: '51988112233',
    email: 'vparedes@constructores.pe',
    unit: 'el_zapotal',
    source: 'Municipalidad',
    stage: 'contrato',
    temperature: 'caliente',
    assignedTo: 'oscar',
    nextAction: 'Firma de minuta de compraventa en notaría y cancelación de cuota inicial S/ 10,000',
    nextActionDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], // Mañana
    tags: ['Lote Comercial', 'Contrato Listo', 'Contado'],
    interactions: [
      { id: 'int-11', leadId: 'zap-205', date: new Date(Date.now() - 1 * 86400000).toISOString(), channel: 'Reunión', note: 'Separó el Lote A-01 con S/ 2,000. Minuta revisada por sus abogados.' }
    ],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    dealValue: 75000
  },

  // --- SOFTWARE / PROYECTOS FUTUROS (Soluciones Tech, CRM, Automatización) ---
  {
    id: 'soft-301',
    name: 'Eduardo Castro Morales',
    company: 'Logística TransAndina',
    phone: '51966778899',
    email: 'ecastro@transandina.com.pe',
    unit: 'software',
    source: 'LinkedIn',
    stage: 'demostracion',
    temperature: 'caliente',
    assignedTo: 'oscar',
    nextAction: 'Demo interactiva de plataforma de trazabilidad GPS con IA',
    nextActionDate: new Date().toISOString().split('T')[0], // Hoy
    tags: ['Logística', 'SaaS', 'Integración API'],
    interactions: [
      { id: 'int-12', leadId: 'soft-301', date: new Date(Date.now() - 2 * 86400000).toISOString(), channel: 'LinkedIn', note: 'Gerente de operaciones busca automatizar reportes de flota para 40 camiones.' }
    ],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    dealValue: 28000
  },
  {
    id: 'soft-302',
    name: 'Ing. Jimena Rojas',
    company: 'Inmobiliaria Horizonte',
    phone: '51955667788',
    email: 'jrojas@horizonteperu.pe',
    unit: 'software',
    source: 'Networking',
    stage: 'propuesta',
    temperature: 'caliente',
    assignedTo: 'oscar',
    nextAction: 'Enviar cotización formal de CRM inmobiliario a medida + WhatsApp Bot',
    nextActionDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    tags: ['Inmobiliaria', 'WhatsApp API', 'CRM'],
    interactions: [
      { id: 'int-13', leadId: 'soft-302', date: new Date(Date.now() - 3 * 86400000).toISOString(), channel: 'Reunión', note: 'Conoció el sistema que usamos en El Zapotal y quiere implementarlo en su constructora.' }
    ],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    dealValue: 35000
  },
  {
    id: 'soft-303',
    name: 'Lic. Fernando Alva',
    company: 'Colegio Privado San Agustín',
    phone: '51944556677',
    email: 'falva@sanagustin.edu.pe',
    unit: 'software',
    source: 'Contenido',
    stage: 'calificacion',
    temperature: 'tibio',
    assignedTo: 'agendadora',
    nextAction: 'Llamar para coordinar reunión técnica sobre sistema de admisiones automatizado',
    nextActionDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], // VENCIDO (hace 4 días)
    tags: ['Educación', 'Admisiones', 'Chatbot'],
    interactions: [
      { id: 'int-14', leadId: 'soft-303', date: new Date(Date.now() - 6 * 86400000).toISOString(), channel: 'WhatsApp', note: 'Descargó guía de automatización por WhatsApp. Interesado en chatbot para matrícula 2026.' }
    ],
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 6 * 86400000).toISOString(),
    dealValue: 18000
  },
  {
    id: 'soft-304',
    name: 'Mónica Salazar',
    company: 'Boutique Elena Moda',
    phone: '51933445566',
    email: 'monica@elenamoda.com',
    unit: 'software',
    source: 'Instagram',
    stage: 'negociacion',
    temperature: 'tibio',
    assignedTo: 'vendedor',
    nextAction: 'Reunión de ajuste de precios para pasarela de pagos e inventario',
    nextActionDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    tags: ['E-commerce', 'Retail'],
    interactions: [
      { id: 'int-15', leadId: 'soft-304', date: new Date(Date.now() - 2 * 86400000).toISOString(), channel: 'WhatsApp', note: 'Demo realizada. Piden fraccionar el pago inicial en 3 cuotas.' }
    ],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    dealValue: 12000
  },
  {
    id: 'soft-305',
    name: 'Raúl Gutiérrez Valdés',
    company: 'Agroexportadora del Valle',
    phone: '51922110099',
    email: 'rgutierrez@agrovalle.pe',
    unit: 'software',
    source: 'Referido',
    stage: 'demanda',
    temperature: 'frio',
    assignedTo: 'carlos',
    nextAction: 'Enviar presentación institucional de Red Líder Software y agendar café',
    nextActionDate: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0], // VENCIDO (hace 15 días)
    tags: ['Agro', 'IoT', 'Referido'],
    interactions: [
      { id: 'int-16', leadId: 'soft-305', date: new Date(Date.now() - 40 * 86400000).toISOString(), channel: 'Llamada', note: 'Referido por socio de Trujillo. Interesado en sensores IoT para riego, pero postergó para el segundo trimestre.' }
    ],
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    lastContactDate: new Date(Date.now() - 40 * 86400000).toISOString(),
    dealValue: 45000
  }
];

const INITIAL_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-1',
    name: 'lead_nuevo_el_zapotal',
    category: 'MARKETING',
    language: 'es_PE',
    bodyText: '¡Hola {{1}}! 🌿 Qué gusto saludarte de El Zapotal. Vimos tu interés en nuestros lotes residenciales. Tenemos excelentes facilidades con financiamiento directo y ubicación estratégica. ¿Te gustaría recibir nuestro brochure interactivo y coordinar una visita guiada este fin de semana?',
    variables: ['{{1}}'],
    status: 'APPROVED',
    unit: 'el_zapotal',
    description: 'Plantilla de bienvenida para nuevos prospectos de lotes El Zapotal'
  },
  {
    id: 'tpl-2',
    name: 'post_visita_zapotal',
    category: 'UTILITY',
    language: 'es_PE',
    bodyText: '¡Hola {{1}}! Fue un verdadero placer recibirte en El Zapotal hoy. Te recuerdo que el Lote {{2}} que te gustó puede ser separado con solo S/ 1,000 para mantener el precio especial de campaña. ¿Tienes alguna duda adicional que podamos resolver con nuestro asesor?',
    variables: ['{{1}}', '{{2}}'],
    status: 'APPROVED',
    unit: 'el_zapotal',
    description: 'Seguimiento inmediato después de la visita al terreno'
  },
  {
    id: 'tpl-3',
    name: 'b2b_consultoria_red_lider',
    category: 'MARKETING',
    language: 'es_PE',
    bodyText: 'Estimado(a) {{1}}, te saludamos del equipo directivo de Red Líder. Analizando el perfil comercial de {{2}}, vemos una gran oportunidad para implementar la metodología de Ingresos Predecibles en su equipo. ¿Estarías disponible para una breve llamada técnica de 15 minutos este jueves?',
    variables: ['{{1}}', '{{2}}'],
    status: 'APPROVED',
    unit: 'red_lider',
    description: 'Contacto inicial de prospección B2B alta gerencia para Red Líder'
  },
  {
    id: 'tpl-4',
    name: 'post_webinar_agradecimiento',
    category: 'MARKETING',
    language: 'es_PE',
    bodyText: '¡Hola {{1}}! Muchas gracias por asistir a nuestro webinar sobre Estrategia Comercial. Como agradecimiento, te compartimos la grabación y la presentación en este enlace. Además, cuentas con un 20% de beca especial para nuestra próxima certificación comercial si te inscribes esta semana.',
    variables: ['{{1}}'],
    status: 'APPROVED',
    unit: 'red_lider',
    description: 'Seguimiento automatizado para asistentes a webinars y masterclasses'
  },
  {
    id: 'tpl-5',
    name: 'reactivacion_comercial_2026',
    category: 'MARKETING',
    language: 'es_PE',
    bodyText: '¡Hola {{1}}! Hace algún tiempo conversamos sobre tus proyectos de crecimiento. En Red Líder acabamos de lanzar nuestras nuevas soluciones para el segundo semestre 2026 con facilidades exclusivas para contactos de nuestra red. ¿Te gustaría que te cuente qué novedades tenemos en un mensaje corto?',
    variables: ['{{1}}'],
    status: 'APPROVED',
    unit: 'all',
    description: 'Campaña de reactivación para prospectos sin contacto en más de 30/60 días'
  }
];

const INITIAL_EVENTS: EventWebinar[] = [
  {
    id: 'ev-1',
    name: 'Webinar: Ingresos Predecibles en el Perú 2026',
    date: '2026-06-20',
    unit: 'red_lider',
    description: 'Masterclass con Aaron Ross y Oscar sobre especialización comercial B2B.',
    attendeesCount: 48
  },
  {
    id: 'ev-2',
    name: 'Open House: Visita de Gala El Zapotal Etapa 2',
    date: '2026-06-28',
    unit: 'el_zapotal',
    description: 'Evento de presentación de lotes frente a parque con recorrido familiar guiado.',
    attendeesCount: 24
  },
  {
    id: 'ev-3',
    name: 'Summit Tech: Inteligencia Artificial en Ventas B2B',
    date: '2026-07-15',
    unit: 'software',
    description: 'Demostración en vivo de agentes comerciales automatizados con WhatsApp API y CRM.',
    attendeesCount: 35
  }
];

const INITIAL_ATTENDEES: EventAttendee[] = [
  {
    id: 'att-1',
    eventId: 'ev-1',
    eventName: 'Webinar: Ingresos Predecibles en el Perú 2026',
    name: 'Lic. Patricia Ramírez',
    phone: '51998877665',
    email: 'pramirez@aduanasramirez.com',
    unit: 'red_lider',
    maturity: 'interesado',
    convertedLeadId: 'rl-102',
    registeredAt: '2026-06-18T10:30:00Z'
  },
  {
    id: 'att-2',
    eventId: 'ev-1',
    eventName: 'Webinar: Ingresos Predecibles en el Perú 2026',
    name: 'Gonzalo Morales Tineo',
    phone: '51911223344',
    email: 'gmorales@consultorespe.com',
    unit: 'red_lider',
    maturity: 'por_madurar',
    registeredAt: '2026-06-19T15:20:00Z'
  },
  {
    id: 'att-3',
    eventId: 'ev-2',
    eventName: 'Open House: Visita de Gala El Zapotal Etapa 2',
    name: 'Andrea Palomino Torres',
    phone: '51977665544',
    email: 'apalomino@yahoo.es',
    unit: 'el_zapotal',
    maturity: 'interesado',
    convertedLeadId: 'zap-202',
    registeredAt: '2026-06-25T09:00:00Z'
  }
];

const INITIAL_REFERRALS: ReferralRecord[] = [
  {
    id: 'ref-1',
    referrerName: 'Óscar Benavides (Socio)',
    referrerPhone: '51900112233',
    referredLeadId: 'rl-103',
    referredName: 'Carlos Alberto Soto (NorPerú)',
    referredPhone: '51912345678',
    unit: 'red_lider',
    status: 'contactado',
    date: '2026-06-25'
  },
  {
    id: 'ref-2',
    referrerName: 'Ing. Marcos Benavides',
    referrerPhone: '51987654321',
    referredName: 'Constructora El Valle',
    referredPhone: '51966551122',
    unit: 'red_lider',
    status: 'solicitado',
    date: '2026-06-29'
  },
  {
    id: 'ref-3',
    referrerName: 'Andrea Palomino Torres',
    referrerPhone: '51977665544',
    referredName: 'Familia Palomino Cisneros',
    referredPhone: '51988776600',
    unit: 'el_zapotal',
    status: 'recibido',
    date: '2026-06-30'
  }
];

const INITIAL_CPL: Record<string, number> = {
  'Facebook Ads': 18.50,
  'Instagram': 15.00,
  'LinkedIn': 45.00,
  'Webinar': 12.00,
  'Contenido': 0.00,
  'Alianza': 5.00,
  'Municipalidad': 0.00,
  'Networking': 10.00,
  'Referido': 0.00,
  'Base antigua': 0.00,
  'WhatsApp entrante': 8.00,
  'Messenger': 12.00,
  'Otro': 10.00
};

interface DatabaseSchema {
  leads: Lead[];
  templates: WhatsAppTemplate[];
  events: EventWebinar[];
  attendees: EventAttendee[];
  referrals: ReferralRecord[];
  cpl: Record<string, number>;
  metaConfig: {
    accessToken: string;
    phoneNumberId: string;
    wabaId: string;
    verifyToken: string;
    mode: 'LIVE' | 'SIMULATED';
  };
}

class DatabaseEngine {
  private data!: DatabaseSchema;

  constructor() {
    this.init();
  }

  private init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.error('Error leyendo base de datos, re-inicializando:', e);
        this.seed();
      }
    } else {
      this.seed();
    }
  }

  private seed() {
    this.data = {
      leads: INITIAL_LEADS,
      templates: INITIAL_TEMPLATES,
      events: INITIAL_EVENTS,
      attendees: INITIAL_ATTENDEES,
      referrals: INITIAL_REFERRALS,
      cpl: INITIAL_CPL,
      metaConfig: {
        accessToken: process.env.META_ACCESS_TOKEN || 'EAAxxxx_simulated_token',
        phoneNumberId: process.env.META_PHONE_NUMBER_ID || '104xxx_simulated_phone',
        wabaId: process.env.META_WABA_ID || '103xxx_simulated_waba',
        verifyToken: process.env.META_VERIFY_TOKEN || 'redlider_secret_token_2026',
        mode: 'SIMULATED'
      }
    };
    this.save();
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error guardando en archivo JSON de base de datos:', e);
    }
  }

  public getLeads(): Lead[] {
    return this.data.leads || [];
  }

  public getLeadById(id: string): Lead | undefined {
    return this.data.leads.find(l => l.id === id);
  }

  public saveLead(lead: Lead): Lead {
    const idx = this.data.leads.findIndex(l => l.id === lead.id);
    if (idx >= 0) {
      this.data.leads[idx] = lead;
    } else {
      this.data.leads.push(lead);
    }
    this.save();
    return lead;
  }

  public deleteLead(id: string): boolean {
    const initialLen = this.data.leads.length;
    this.data.leads = this.data.leads.filter(l => l.id !== id);
    if (this.data.leads.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public getTemplates(): WhatsAppTemplate[] {
    return this.data.templates || [];
  }

  public saveTemplate(tpl: WhatsAppTemplate): WhatsAppTemplate {
    const idx = this.data.templates.findIndex(t => t.id === tpl.id);
    if (idx >= 0) {
      this.data.templates[idx] = tpl;
    } else {
      this.data.templates.push(tpl);
    }
    this.save();
    return tpl;
  }

  public getEvents(): EventWebinar[] {
    return this.data.events || [];
  }

  public saveEvent(ev: EventWebinar): EventWebinar {
    const idx = this.data.events.findIndex(e => e.id === ev.id);
    if (idx >= 0) {
      this.data.events[idx] = ev;
    } else {
      this.data.events.push(ev);
    }
    this.save();
    return ev;
  }

  public getAttendees(): EventAttendee[] {
    return this.data.attendees || [];
  }

  public saveAttendee(att: EventAttendee): EventAttendee {
    const idx = this.data.attendees.findIndex(a => a.id === att.id);
    if (idx >= 0) {
      this.data.attendees[idx] = att;
    } else {
      this.data.attendees.push(att);
    }
    this.save();
    return att;
  }

  public getReferrals(): ReferralRecord[] {
    return this.data.referrals || [];
  }

  public saveReferral(ref: ReferralRecord): ReferralRecord {
    const idx = this.data.referrals.findIndex(r => r.id === ref.id);
    if (idx >= 0) {
      this.data.referrals[idx] = ref;
    } else {
      this.data.referrals.push(ref);
    }
    this.save();
    return ref;
  }

  public getCpl(): Record<string, number> {
    return this.data.cpl || {};
  }

  public saveCpl(cpl: Record<string, number>) {
    this.data.cpl = { ...this.data.cpl, ...cpl };
    this.save();
  }

  public getMetaConfig() {
    return this.data.metaConfig;
  }

  public saveMetaConfig(cfg: Partial<DatabaseSchema['metaConfig']>) {
    this.data.metaConfig = { ...this.data.metaConfig, ...cfg };
    this.save();
  }
}

export const db = new DatabaseEngine();
