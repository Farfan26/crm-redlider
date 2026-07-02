/**
 * Módulo de Bot Asistente IA & Calificador WhatsApp Automático
 * Para gestionar respuestas automáticas y calificar prospectos en el embudo.
 */
import React, { useState } from 'react';
import { BotRule, BotLog, BusinessUnit } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Bot as BotIcon, 
  Sparkles, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Play, 
  Pause, 
  Plus, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Trash2,
  Building2,
  Briefcase,
  Code
} from 'lucide-react';

// Reglas predeterminadas para El Zapotal, Red Líder y Software
const INITIAL_RULES: BotRule[] = [
  {
    id: 'rule-zapotal-1',
    name: '🎯 Calificador Terrenos El Zapotal (Lotes)',
    triggerKeywords: ['lote', 'terreno', 'tarapoto', 'zapotal', 'm2', 'metros', 'precio terreno', 'ubicacion'],
    unit: 'el_zapotal',
    responseTemplate: '¡Hola! 🌲 Gracias por contactar a *El Zapotal - Tarapoto*. Tenemos lotes semi-rústicos desde 1,000 m² con título de propiedad en SUNARP y servicios eco-amigables. ¿Para qué fecha te gustaría coordinar una visita guiada o videollamada desde el terreno?',
    suggestedAction: 'Asignar vendedor y agendar visita',
    autoAssignStage: 'calificacion',
    isActive: true
  },
  {
    id: 'rule-redlider-1',
    name: '📈 Calificador Consultoría / Ingresos Predecibles',
    triggerKeywords: ['curso', 'asesoria', 'red lider', 'ingresos predecibles', 'ventas', 'consultoria', 'aaron ross', 'empresa'],
    unit: 'red_lider',
    responseTemplate: '¡Hola! 🚀 Bienvenido a *Red Líder*. Ayudamos a empresas e inmobiliarias a escalar sus ventas con el modelo de Ingresos Predecibles de Aaron Ross. ¿Te gustaría agendar una Sesión de Diagnóstico por Zoom de 20 minutos con Óscar o nuestro equipo de estrategia?',
    suggestedAction: 'Ofrecer link de Zoom para Diagnóstico',
    autoAssignStage: 'diagnostico',
    isActive: true
  },
  {
    id: 'rule-software-1',
    name: '💻 Calificador CRM & Webhooks API',
    triggerKeywords: ['crm', 'software', 'api', 'bot whatsapp', 'webhook', 'sistema', 'automati'],
    unit: 'software',
    responseTemplate: '¡Hola! 💻 Diseñamos e implementamos sistemas CRM a medida con conexión nativa a WhatsApp Cloud API (sin costos de Twilio ni pasarelas intermedias). ¿Cuántos vendedores o usuarios tiene actualmente tu equipo comercial?',
    suggestedAction: 'Coordinar demostración en vivo de plataforma',
    autoAssignStage: 'demostracion',
    isActive: true
  },
  {
    id: 'rule-general-welcome',
    name: '👋 Saludo General / Fuera de Horario',
    triggerKeywords: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'informacion', 'info', 'ayuda'],
    unit: 'all',
    responseTemplate: '¡Hola! Bienvenido al canal oficial de *Red Líder & El Zapotal*. Por favor coméntanos en qué podemos apoyarte hoy:\n1️⃣ Lotes en Tarapoto (El Zapotal)\n2️⃣ Consultoría Comercial (Red Líder)\n3️⃣ Sistemas CRM & Bots (Software)\nUn asesor se comunicará contigo en breve.',
    suggestedAction: 'Notificar en Kanban (Etapa Demanda)',
    autoAssignStage: 'demanda',
    isActive: true
  }
];

const INITIAL_LOGS: BotLog[] = [
  {
    id: 'log-1',
    timestamp: 'Hace 10 min',
    leadName: 'Juan Carlos Torres',
    leadPhone: '+51 987 654 321',
    incomingMessage: 'Hola buenos días, quiero info del precio de lote en Tarapoto',
    botResponse: '¡Hola! 🌲 Gracias por contactar a *El Zapotal - Tarapoto*. Tenemos lotes semi-rústicos desde 1,000 m² con título de propiedad en SUNARP... ¿Para qué fecha te gustaría coordinar una visita?',
    matchedRuleName: '🎯 Calificador Terrenos El Zapotal (Lotes)',
    status: 'enviado'
  },
  {
    id: 'log-2',
    timestamp: 'Hace 45 min',
    leadName: 'Inmobiliaria San Marcos',
    leadPhone: '+51 912 345 678',
    incomingMessage: 'Queremos cotizar una asesoría en ventas con el modelo ingresos predecibles',
    botResponse: '¡Hola! 🚀 Bienvenido a *Red Líder*. Ayudamos a empresas e inmobiliarias a escalar sus ventas... ¿Te gustaría agendar una Sesión de Diagnóstico por Zoom?',
    matchedRuleName: '📈 Calificador Consultoría / Ingresos Predecibles',
    status: 'enviado'
  }
];

export const BotAssistantView: React.FC = () => {
  const { selectedUnit, currentUser } = useAuth();
  const [rules, setRules] = useState<BotRule[]>(INITIAL_RULES);
  const [logs, setLogs] = useState<BotLog[]>(INITIAL_LOGS);
  const [activeSubTab, setActiveSubTab] = useState<'rules' | 'sandbox' | 'logs'>('rules');

  // Estado del Sandbox (Simulador en Vivo)
  const [simPhone, setSimPhone] = useState('+51 999 888 777');
  const [simName, setSimName] = useState('Cliente de Prueba');
  const [simInput, setSimInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'lead' | 'bot'; text: string; time: string; rule?: string }[]>([
    { sender: 'bot', text: '🤖 Sistema Bot Activo. Escribe un mensaje simulando ser un cliente de WhatsApp para probar el disparo automático de reglas.', time: '12:00 PM' }
  ]);

  // Nueva regla
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [newTemplate, setNewTemplate] = useState('');
  const [newUnit, setNewUnit] = useState<BusinessUnit>('el_zapotal');
  const [newAction, setNewAction] = useState('Notificar a ventas');

  const toggleRuleActive = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('¿Eliminar esta regla automática del Bot?')) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newKeywords || !newTemplate) return;

    const keywordsArray = newKeywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    const newRule: BotRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      triggerKeywords: keywordsArray,
      unit: newUnit,
      responseTemplate: newTemplate,
      suggestedAction: newAction,
      isActive: true
    };

    setRules([...rules, newRule]);
    setShowNewRuleModal(false);
    setNewRuleName('');
    setNewKeywords('');
    setNewTemplate('');
    alert('✅ Regla del Bot agregada exitosamente.');
  };

  // Disparar prueba de sandbox
  const handleSendSimulatedMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simInput.trim()) return;

    const userMsg = simInput.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Agregar mensaje del usuario
    const newHistory = [...chatHistory, { sender: 'lead' as const, text: userMsg, time: timeNow }];
    setSimInput('');

    // Evaluar reglas
    const cleanMsg = userMsg.toLowerCase();
    let matchedRule = rules.find(r => r.isActive && r.triggerKeywords.some(kw => cleanMsg.includes(kw)));

    // Si no coincide con ninguna palabra clave específica, buscar la regla de saludo general
    if (!matchedRule) {
      matchedRule = rules.find(r => r.isActive && r.id === 'rule-general-welcome') || rules[0];
    }

    const botReplyText = matchedRule ? matchedRule.responseTemplate : 'Gracias por escribirnos. Un asesor comercial se pondrá en contacto contigo en breve.';
    const ruleName = matchedRule ? matchedRule.name : 'Respuesta por defecto';

    // Simular retraso de escritura (500ms)
    setTimeout(() => {
      setChatHistory([
        ...newHistory,
        {
          sender: 'bot' as const,
          text: botReplyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rule: ruleName
        }
      ]);

      // Registrar en logs del bot
      const newLog: BotLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Justo ahora (Simulado)',
        leadName: simName,
        leadPhone: simPhone,
        incomingMessage: userMsg,
        botResponse: botReplyText,
        matchedRuleName: ruleName,
        status: 'simulado'
      };
      setLogs([newLog, ...logs]);
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            Automatización WhatsApp & Inteligencia Comercial
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            🤖 Bot Asistente IA & Calificador 24/7
          </h1>
          <p className="text-sm text-slate-400">
            Filtra, saluda y califica leads entrantes de WhatsApp Cloud API antes de pasarlos al embudo de Óscar, Carlos o Dani.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Webhook Meta: ACTIVO EN PRODUCCIÓN
          </div>

          <button
            onClick={() => setShowNewRuleModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-lg shadow-purple-600/30 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            + Crear Regla de Bot
          </button>
        </div>
      </div>

      {/* Sub-Navegación de pestañas del Bot */}
      <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveSubTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'rules'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          Reglas Automáticas ({rules.length})
        </button>
        <button
          onClick={() => setActiveSubTab('sandbox')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'sandbox'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          Simulador de Chat en Vivo
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'logs'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Historial & Logs del Bot ({logs.length})
        </button>
      </div>

      {/* TAB 1: REGLAS AUTOMÁTICAS */}
      {activeSubTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`bg-slate-900 border rounded-2xl p-6 shadow-xl space-y-4 transition-all relative overflow-hidden ${
                rule.isActive ? 'border-purple-500/40 bg-gradient-to-b from-purple-950/10 to-slate-900' : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      rule.unit === 'el_zapotal' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      rule.unit === 'red_lider' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      rule.unit === 'software' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {rule.unit === 'all' ? 'Todas las Unidades' : rule.unit}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rule.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {rule.isActive ? '⚡ ACTIVA' : '⏸️ PAUSADA'}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
                    {rule.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleRuleActive(rule.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      rule.isActive ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    }`}
                    title={rule.isActive ? 'Pausar regla' : 'Activar regla'}
                  >
                    {rule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                    title="Eliminar regla"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Palabras clave disparadoras */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  🔑 Palabras Clave Disparadoras (Triggers):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {rule.triggerKeywords.map((kw, idx) => (
                    <span key={idx} className="bg-slate-800/80 text-purple-300 text-xs px-2.5 py-1 rounded-lg border border-purple-500/30 font-mono font-medium">
                      "{kw}"
                    </span>
                  ))}
                </div>
              </div>

              {/* Plantilla de respuesta */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <BotIcon className="w-3 h-3 text-purple-400" /> Plantilla de Respuesta WhatsApp:
                </span>
                <p className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                  {rule.responseTemplate}
                </p>
              </div>

              {/* Acción en el CRM */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80 text-slate-400">
                <span>
                  ⚡ Acción sugerida: <strong className="text-white">{rule.suggestedAction}</strong>
                </span>
                {rule.autoAssignStage && (
                  <span className="bg-blue-950/60 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-bold uppercase text-[10px]">
                    Etapa: {rule.autoAssignStage}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: SIMULADOR SANDBOX */}
      {activeSubTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Panel de Configuración de Prueba */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 h-fit">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Configurar Cliente de Prueba
            </h3>
            <p className="text-xs text-slate-400">
              Simula cómo responderá el Bot cuando un cliente escriba por WhatsApp o Messenger a cualquiera de nuestras líneas.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Nombre del Lead Simulado
                </label>
                <input
                  type="text"
                  value={simName}
                  onChange={e => setSimName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Teléfono Simulado
                </label>
                <input
                  type="text"
                  value={simPhone}
                  onChange={e => setSimPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-purple-300 block">
                💡 Ideas para probar en el chat:
              </span>
              <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                <li><code className="text-white cursor-pointer hover:underline" onClick={() => setSimInput('Hola info sobre lote en zapotal')}>"Hola info sobre lote en zapotal"</code></li>
                <li><code className="text-white cursor-pointer hover:underline" onClick={() => setSimInput('Cual es el precio de una consultoría en ventas')}>"Cual es el precio de una consultora en ventas"</code></li>
                <li><code className="text-white cursor-pointer hover:underline" onClick={() => setSimInput('Necesito un CRM con bot de whatsapp')}>"Necesito un CRM con bot de whatsapp"</code></li>
              </ul>
            </div>
          </div>

          {/* Chat WhatsApp Simulado */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[520px] overflow-hidden">
            {/* Header del Chat */}
            <div className="bg-slate-900 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md">
                  RL
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    Bot Red Líder • Sandbox API
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    En línea (Respuesta instantánea)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setChatHistory([{ sender: 'bot', text: '🤖 Sandbox reiniciado. ¡Escribe un nuevo mensaje para probar!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 font-medium"
              >
                Limpiar Chat
              </button>
            </div>

            {/* Mensajes del Chat */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${
                    msg.sender === 'lead' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`p-3.5 rounded-2xl shadow-md text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'lead'
                        ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.rule && (
                      <div className="text-[10px] font-extrabold text-purple-400 uppercase mb-1 flex items-center gap-1 border-b border-slate-800 pb-1">
                        ⚡ Disparado por: {msg.rule}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                    {msg.sender === 'lead' ? simName : 'Bot IA'} • {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Input de Mensaje */}
            <form onSubmit={handleSendSimulatedMessage} className="bg-slate-900 p-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Escribe como si fueras "${simName}"...`}
                value={simInput}
                onChange={e => setSimInput(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all transform hover:scale-105"
                title="Enviar mensaje simulado"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: LOGS & HISTORIAL */}
      {activeSubTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-fadeIn">
          <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              Registro de Interacciones y Respuestas Automáticas
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Mostrando las últimas {logs.length} interacciones del Bot
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Hora</th>
                  <th className="py-3 px-4">Prospecto / Teléfono</th>
                  <th className="py-3 px-4">Mensaje Entrante (Lead)</th>
                  <th className="py-3 px-4">Respuesta Enviada (Bot)</th>
                  <th className="py-3 px-4">Regla Activada</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      <div>{log.leadName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.leadPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={log.incomingMessage}>
                      💬 "{log.incomingMessage}"
                    </td>
                    <td className="py-3 px-4 text-emerald-300 max-w-xs truncate" title={log.botResponse}>
                      🤖 "{log.botResponse}"
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-purple-950/60 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        {log.matchedRuleName || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL NUEVA REGLA DEL BOT */}
      {showNewRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                Nueva Regla de Auto-Respuesta WhatsApp
              </h3>
              <button onClick={() => setShowNewRuleModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Nombre Identificador de la Regla *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Calificador Lotes VIP Tarapoto / Demos software"
                  value={newRuleName}
                  onChange={e => setNewRuleName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Unidad de Negocio
                  </label>
                  <select
                    value={newUnit}
                    onChange={e => setNewUnit(e.target.value as BusinessUnit)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="el_zapotal">🌲 El Zapotal (Terrenos)</option>
                    <option value="red_lider">🚀 Red Líder (Consultoría)</option>
                    <option value="software">💻 Software / Proyectos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Acción CRM Sugerida
                  </label>
                  <input
                    type="text"
                    value={newAction}
                    onChange={e => setNewAction(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Palabras Clave Disparadoras (Triggers) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. precio, cuanto cuesta, lote, tarapoto, cotizacion"
                  value={newKeywords}
                  onChange={e => setNewKeywords(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Separa cada palabra o frase con comas.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Plantilla de Respuesta Bot (WhatsApp / Messenger) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="¡Hola! Gracias por contactar a Red Líder..."
                  value={newTemplate}
                  onChange={e => setNewTemplate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewRuleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/30"
                >
                  Guardar Regla Automática
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
