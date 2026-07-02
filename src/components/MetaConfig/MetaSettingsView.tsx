/**
 * Módulo de Configuración de Meta para Desarrolladores & Simulación Webhook en Vivo
 * Verifica tokens, gestiona plantillas y prueba la API oficial en modo sandbox / real
 */
import React, { useState, useEffect } from 'react';
import { MetaConfig, WhatsAppTemplate } from '../../types';
import { api } from '../../services/api';
import { 
  ShieldCheck, 
  Key, 
  MessageCircle, 
  Terminal, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  Globe, 
  Zap, 
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const MetaSettingsView: React.FC = () => {
  const [config, setConfig] = useState<MetaConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form edit
  const [form, setForm] = useState<Partial<MetaConfig>>({});

  // Simulation state
  const [simPhone, setSimPhone] = useState('51999888777');
  const [simName, setSimName] = useState('Juan Inversor');
  const [simText, setSimText] = useState('Hola, estoy interesado en un lote en El Zapotal de 200m2');
  const [simUnit, setSimUnit] = useState<'red_lider' | 'el_zapotal' | 'software'>('el_zapotal');
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simulating, setSimulating] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await api.getMetaConfig();
      setConfig(res);
      setForm(res);
    } catch (e) {
      alert('Error cargando configuración Meta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.saveMetaConfig(form);
      setConfig(updated);
      setForm(updated);
      alert('✅ ¡Configuración de Meta Cloud API guardada exitosamente!');
    } catch (e: any) {
      alert('Error guardando configuración: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await api.simulateWebhook({
        phone: simPhone,
        name: simName,
        text: simText,
        unit: simUnit
      });
      setSimResult(res);
    } catch (e: any) {
      alert('Error en simulación: ' + e.message);
    } finally {
      setSimulating(false);
    }
  };

  const copyWebhookUrl = () => {
    const url = `${window.location.origin}/api/webhook`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Cargando credenciales de Meta for Developers...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 border border-emerald-500/40 p-6 rounded-3xl shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Configuración Meta WhatsApp Cloud API</h2>
              <span className="bg-emerald-500 text-slate-950 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                OFICIAL v20.0
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Gestión centralizada de tokens de acceso, números de teléfono oficiales, webhooks entrantes y simulación en vivo sin costo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchConfig}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Refrescar estado"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: API Credentials & Setup Instructions */}
        <div className="space-y-6">
          <form onSubmit={handleSaveConfig} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>1. Credenciales de la App (Meta for Developers)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTokens(!showTokens)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
              >
                {showTokens ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showTokens ? 'Ocultar tokens' : 'Ver tokens'}</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Modo de Operación *</label>
                <select
                  value={form.mode || 'SIMULATED'}
                  onChange={e => setForm({ ...form, mode: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-extrabold"
                >
                  <option value="SIMULATED">🧪 MODO SIMULADO / SANDBOX (Pruebas instantáneas sin credenciales)</option>
                  <option value="LIVE">🚀 MODO REAL EN VIVO (Conexión oficial con servidores de Meta)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  En Modo Simulado puedes usar el CRM inmediatamente sin claves ni saldo. En Modo Real se conectará a la API de Meta.
                </p>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">WhatsApp Business Account ID (WABA ID)</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  placeholder="Ej. 102938475610293"
                  value={form.wabaId || ''}
                  onChange={e => setForm({ ...form, wabaId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Phone Number ID (ID del Número de Teléfono)</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  placeholder="Ej. 109876543210987"
                  value={form.phoneNumberId || ''}
                  onChange={e => setForm({ ...form, phoneNumberId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono font-bold text-blue-400"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">System User Access Token (Token Permanente)</label>
                <textarea
                  rows={2}
                  type={showTokens ? 'text' : 'password'} as any
                  placeholder="EAAG... (Token generado en Meta Business Manager)"
                  value={form.accessToken || ''}
                  onChange={e => setForm({ ...form, accessToken: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Webhook Verify Token (Secreto para verificación)</label>
                <input
                  type="text"
                  placeholder="Ej. red_lider_webhook_secret_2026"
                  value={form.verifyToken || ''}
                  onChange={e => setForm({ ...form, verifyToken: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono font-bold text-emerald-400"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? 'Guardando en Servidor...' : 'Guardar y Aplicar Configuración'}</span>
              </button>
            </div>
          </form>

          {/* Webhook setup info box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 text-xs shadow-lg">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>2. Configuración de Webhook en Meta Business</span>
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Copia esta URL y pégala en la sección <strong className="text-white">WhatsApp &gt; Configuration &gt; Webhook</strong> en el panel de desarrolladores de Meta:
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-[11px] text-blue-300">
              <span className="truncate">{window.location.origin}/api/webhook</span>
              <button
                onClick={copyWebhookUrl}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-sans font-bold flex items-center gap-1 shrink-0 ml-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>

            <div className="bg-blue-950/40 border border-blue-500/40 p-3 rounded-xl text-blue-200 text-[11px] space-y-1">
              <p>📌 <strong>Campos de suscripción requeridos:</strong> Asegúrate de suscribir tu webhook al campo <code className="bg-slate-900 px-1 py-0.5 rounded text-white">messages</code>.</p>
              <p>📌 <strong>Token de verificación:</strong> Usa el mismo que guardaste arriba (<code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-300 font-mono">{form.verifyToken || 'red_lider_webhook_secret_2026'}</code>).</p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Webhook Simulator */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border-2 border-emerald-500/60 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-extrabold text-white text-base">3. Simulador de Mensaje Entrante en Vivo</h3>
              </div>
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                PRUEBA RÁPIDA
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ¿No tienes tu teléfono oficial conectado aún? ¡No hay problema! Simula que un cliente real te escribe por WhatsApp ahora mismo. El CRM procesará el mensaje, identificará o creará al prospecto, y activará las alertas automáticas.
            </p>

            <form onSubmit={handleRunSimulation} className="space-y-3 text-xs pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Teléfono WhatsApp Simulado *</label>
                  <input
                    type="text"
                    required
                    value={simPhone}
                    onChange={e => setSimPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Nombre del Prospecto *</label>
                  <input
                    type="text"
                    required
                    value={simName}
                    onChange={e => setSimName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Unidad Comercial de Destino *</label>
                <select
                  value={simUnit}
                  onChange={e => setSimUnit(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold uppercase"
                >
                  <option value="el_zapotal">🌿 El Zapotal (Lotes Inmobiliarios)</option>
                  <option value="red_lider">💼 Red Líder (Consultoría & Cursos)</option>
                  <option value="software">⚡ Software & Proyectos Tech</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Mensaje Enviado por el Cliente *</label>
                <textarea
                  rows={3}
                  required
                  value={simText}
                  onChange={e => setSimText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-sans text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={simulating}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{simulating ? 'Simulando Webhook...' : '⚡ Disparar Simulación de WhatsApp Entrante'}</span>
                </button>
              </div>
            </form>

            {/* Simulation Results Output */}
            {simResult && (
              <div className="bg-slate-950 border border-emerald-500/60 rounded-2xl p-4 space-y-2 text-xs font-mono animate-in fade-in">
                <div className="flex items-center justify-between text-emerald-300 font-bold">
                  <span>✅ ¡Simulación ejecutada con éxito!</span>
                  <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded">HTTP 200 OK</span>
                </div>
                <div className="text-slate-300 space-y-1 text-[11px] pt-1 border-t border-slate-800">
                  <p>• <strong>Estado del Prospecto:</strong> {simResult.action === 'created' ? '🎉 NUEVO LEAD CREADO' : '🔄 LEAD EXISTENTE ACTUALIZADO'}</p>
                  <p>• <strong>ID en el CRM:</strong> {simResult.lead?.id}</p>
                  <p>• <strong>Asignado automáticamente a:</strong> <span className="text-blue-400 uppercase font-bold">{simResult.lead?.assignedTo}</span></p>
                  <p>• <strong>Etapa:</strong> <span className="text-emerald-400 font-bold uppercase">{simResult.lead?.stage}</span></p>
                  <p>• <strong>Alerta generada:</strong> <span className="text-amber-300 font-sans">🟢 Ventana 24h abierta para respuesta libre en Ficha del CRM.</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Best Practices & Rules Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 text-xs">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Políticas Oficiales de Meta & Prevención de Bloqueos</span>
            </h3>

            <ul className="space-y-2 text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✔</span>
                <span><strong>Regla de 24 Horas:</strong> Cada vez que un cliente te envía un mensaje, se abre una ventana de 24 horas para responder con texto libre o adjuntos.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">⚠</span>
                <span><strong>Fuera de la Ventana de 24h:</strong> Si han pasado más de 24h sin respuesta del cliente, es OBLIGATORIO utilizar una Plantilla Aprobada en el menú "Mensajería".</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✖</span>
                <span><strong>Evitar SPAM y Reportes:</strong> No envíes mensajes masivos a personas que no hayan solicitado información. Un alto porcentaje de bloqueos o reportes de spam por parte de usuarios desactivará el número comercial.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
