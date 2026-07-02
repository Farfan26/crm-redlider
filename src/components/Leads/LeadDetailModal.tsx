/**
 * Modal de Detalle de Prospecto & Envío Automatizado por WhatsApp Cloud API
 */
import React, { useState, useEffect } from 'react';
import { Lead, WhatsAppTemplate, FunnelStage, LeadTemperature, UserRole } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Phone, 
  Mail, 
  Building2, 
  Briefcase, 
  Code, 
  MessageCircle, 
  Calendar, 
  Clock, 
  User, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Save, 
  Plus, 
  Copy, 
  Check, 
  History,
  AlertCircle
} from 'lucide-react';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead: initialLead,
  onClose,
  onRefresh
}) => {
  const { currentUser, usersList } = useAuth();
  const [lead, setLead] = useState<Lead | null>(initialLead);
  const [activeTab, setActiveTab] = useState<'info' | 'whatsapp' | 'interactions'>('info');
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [variableValues, setVariableValues] = useState<string[]>(['', '', '']);
  const [customText, setCustomText] = useState<string>('');
  const [sendingWa, setSendingWa] = useState(false);
  const [waStatus, setWaStatus] = useState<string | null>(null);

  // New interaction form
  const [newNote, setNewNote] = useState('');
  const [newChannel, setNewChannel] = useState<'WhatsApp' | 'Llamada' | 'Correo' | 'Reunión' | 'Visita' | 'Nota interna'>('Llamada');
  const [newNextAction, setNewNextAction] = useState('');
  const [newNextActionDate, setNewNextActionDate] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Editable fields in info tab
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (initialLead) {
      setLead(initialLead);
      setEditForm(initialLead);
      setNewNextAction(initialLead.nextAction || '');
      setNewNextActionDate(initialLead.nextActionDate || new Date().toISOString().split('T')[0]);
      
      // Cargar plantillas
      api.getTemplates(initialLead.unit).then(res => {
        setTemplates(res);
        if (res.length > 0) setSelectedTemplateId(res[0].id);
      }).catch(() => {});
    }
  }, [initialLead]);

  if (!lead) return null;

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = lead.nextActionDate && lead.nextActionDate < today;
  const noAction = !lead.nextAction || !lead.nextActionDate;

  // Calcular ventana 24h para alertas
  const lastContactTime = new Date(lead.lastContactDate || 0).getTime();
  const hoursSinceLastContact = (Date.now() - lastContactTime) / (1000 * 60 * 60);
  const isWithin24h = hoursSinceLastContact <= 24;

  const handleSaveInfo = async () => {
    if (!currentUser.permissions.canEditAll && lead.assignedTo !== currentUser.id) {
      alert('🔒 No tienes permiso de edición para este prospecto porque está asignado a otro responsable.');
      return;
    }

    try {
      const updated = await api.updateLead(lead.id, editForm);
      setLead(updated);
      setEditing(false);
      onRefresh();
    } catch (e: any) {
      alert('Error guardando cambios: ' + e.message);
    }
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSavingNote(true);
    try {
      const updated = await api.addInteraction(lead.id, {
        channel: newChannel,
        note: newNote,
        nextAction: newNextAction || undefined,
        nextActionDate: newNextActionDate || undefined
      });
      setLead(updated);
      setNewNote('');
      onRefresh();
    } catch (e: any) {
      alert('Error registrando interacción: ' + e.message);
    } finally {
      setSavingNote(false);
    }
  };

  const handleSendWhatsApp = async () => {
    setSendingWa(true);
    setWaStatus(null);
    try {
      const res = await api.sendWhatsAppMessage({
        leadId: lead.id,
        templateId: selectedTemplateId || undefined,
        customText: !selectedTemplateId ? customText : undefined,
        variableValues: selectedTemplateId ? variableValues.filter(Boolean) : undefined
      });
      setWaStatus('✅ ' + res.apiStatus);
      if (res.lead) setLead(res.lead);
      setCustomText('');
      onRefresh();
    } catch (err: any) {
      setWaStatus('❌ Error: ' + err.message);
      if (err.requiresTemplate) {
        alert('⚠️ Regla de Meta: Han pasado más de 24h desde el último mensaje entrante del cliente. Por seguridad antibloqueo, selecciona una Plantilla de Mensaje aprobada en el menú desplegable.');
      }
    } finally {
      setSendingWa(false);
    }
  };

  const selectedTplObj = templates.find(t => t.id === selectedTemplateId);
  let previewText = selectedTplObj ? selectedTplObj.bodyText : customText;
  if (selectedTplObj) {
    variableValues.forEach((val, idx) => {
      previewText = previewText.replace(`{{${idx + 1}}}`, val || `[Variable ${idx + 1}]`);
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
              {lead.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">{lead.name}</h2>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-slate-700">
                  {lead.stage}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  lead.temperature === 'caliente' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {lead.temperature}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                <span>🏢 {lead.company || 'Sin empresa'}</span>
                <span>•</span>
                <span>📱 {lead.phone}</span>
                <span>•</span>
                <span className="text-blue-400 font-semibold">Resp: {lead.assignedTo.toUpperCase()}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alertas rojas / naranjas en el header del modal */}
        {noAction && (
          <div className="bg-red-600 text-white text-xs font-bold px-6 py-2 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>ALERTA ROJA COMERCIAL: Este prospecto no tiene una Próxima Acción definida. Asigna una acción abajo ahora.</span>
            </div>
          </div>
        )}
        {isOverdue && !noAction && (
          <div className="bg-amber-500 text-slate-950 text-xs font-extrabold px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>ALERTA NARANJA: Seguimiento vencido el {lead.nextActionDate}. Ejecuta la acción o actualiza la fecha.</span>
            </div>
          </div>
        )}

        {/* Modal Tabs */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-6 flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 border-b-2 transition-all ${
              activeTab === 'info' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            📋 Ficha & Datos Comerciales
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'whatsapp' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Mensajería WhatsApp Cloud API</span>
            {!isWithin24h && <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[9px]">+24h</span>}
          </button>
          <button
            onClick={() => setActiveTab('interactions')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'interactions' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Historial ({lead.interactions.length}) & Nueva Interacción</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'info' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Información Comercial del Prospecto
                </h3>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    ✏️ Editar Ficha
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveInfo}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Cambios</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Form / Grid view */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Nombre Completo</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                    />
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-bold text-white text-sm">
                      {lead.name}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Empresa / Organización</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.company || ''}
                      onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-semibold"
                    />
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200">
                      {lead.company || 'N/A'}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Teléfono (WhatsApp)</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.phone || ''}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    />
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-blue-400 font-bold flex items-center justify-between">
                      <span>{lead.phone}</span>
                      <button
                        onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank')}
                        className="text-xs bg-emerald-600/20 text-emerald-300 px-2 py-1 rounded font-sans"
                      >
                        Abrir WA
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Correo Electrónico</label>
                  {editing ? (
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
                      {lead.email || 'No registrado'}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Unidad de Negocio</label>
                  {editing ? (
                    <select
                      value={editForm.unit || 'red_lider'}
                      onChange={e => setEditForm({ ...editForm, unit: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                    >
                      <option value="red_lider">Red Líder (Consultoría & Cursos)</option>
                      <option value="el_zapotal">El Zapotal (Inmobiliaria)</option>
                      <option value="software">Software & Proyectos</option>
                    </select>
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-bold text-white uppercase">
                      {lead.unit}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Fuente de Captación</label>
                  {editing ? (
                    <select
                      value={editForm.source || 'Facebook Ads'}
                      onChange={e => setEditForm({ ...editForm, source: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-semibold"
                    >
                      <option value="Facebook Ads">Facebook Ads</option>
                      <option value="Instagram">Instagram</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Webinar">Webinar</option>
                      <option value="Contenido">Contenido</option>
                      <option value="Alianza">Alianza</option>
                      <option value="Municipalidad">Municipalidad</option>
                      <option value="Networking">Networking</option>
                      <option value="Referido">Referido</option>
                      <option value="Base antigua">Base antigua</option>
                      <option value="WhatsApp entrante">WhatsApp entrante</option>
                      <option value="Messenger">Messenger</option>
                    </select>
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 font-semibold">
                      {lead.source}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Etapa del Embudo</label>
                  {editing ? (
                    <select
                      value={editForm.stage || 'demanda'}
                      onChange={e => setEditForm({ ...editForm, stage: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold uppercase"
                    >
                      <option value="demanda">1. Generación de Demanda</option>
                      <option value="calificacion">2. Calificación</option>
                      <option value="diagnostico">3. Diagnóstico Zoom (Red Líder)</option>
                      <option value="visita">3. Visita al Terreno (Zapotal)</option>
                      <option value="demostracion">3. Demostración Tech (Software)</option>
                      <option value="propuesta">4. Propuesta</option>
                      <option value="seguimiento">5. Seguimiento</option>
                      <option value="separacion">5. Separación S/ 1,000 (Zapotal)</option>
                      <option value="negociacion">5. Negociación (Software)</option>
                      <option value="cierre">6. Cierre / Factura (Red Líder)</option>
                      <option value="contrato">6. Contrato / Minuta (Zapotal)</option>
                      <option value="referidos">7. Referidos / Fidelización</option>
                    </select>
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-bold text-emerald-400 uppercase">
                      {lead.stage}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Temperatura Comercial</label>
                  {editing ? (
                    <select
                      value={editForm.temperature || 'tibio'}
                      onChange={e => setEditForm({ ...editForm, temperature: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                    >
                      <option value="caliente">🔥 Caliente (Alta probabilidad)</option>
                      <option value="tibio">🟡 Tibio (En evaluación)</option>
                      <option value="frio">❄️ Frío (Postergado o inicial)</option>
                      <option value="perdido">❌ Perdido / Descartado</option>
                    </select>
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-bold uppercase">
                      {lead.temperature}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Responsable Asignado</label>
                  {editing ? (
                    <select
                      value={editForm.assignedTo || 'carlos'}
                      onChange={e => setEditForm({ ...editForm, assignedTo: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold uppercase"
                    >
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-bold text-blue-300 uppercase">
                      {lead.assignedTo}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Valor Estimado del Negocio</label>
                  {editing ? (
                    <input
                      type="number"
                      value={editForm.dealValue || 0}
                      onChange={e => setEditForm({ ...editForm, dealValue: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
                    />
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono font-bold text-emerald-400 text-sm">
                      S/ {(lead.dealValue || 0).toLocaleString('es-PE')}
                    </div>
                  )}
                </div>
              </div>

              {/* Next Action Box mandatory emphasis */}
              <div className="bg-slate-950 p-4 rounded-2xl border-2 border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    Regla Comercial Obligatoria: Próxima Acción
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Fecha programada: {lead.nextActionDate || '¡SIN FECHA!'}
                  </span>
                </div>
                {editing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Describe la próxima acción a realizar..."
                      value={editForm.nextAction || ''}
                      onChange={e => setEditForm({ ...editForm, nextAction: e.target.value })}
                      className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                    <input
                      type="date"
                      value={editForm.nextActionDate || ''}
                      onChange={e => setEditForm({ ...editForm, nextActionDate: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                ) : (
                  <p className="text-sm font-bold text-white bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    {lead.nextAction || '⚠️ ALERTA ROJA: Ningún prospecto puede quedar sin siguiente acción.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Alert about 24h Meta rule */}
              <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                isWithin24h 
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}>
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-1 uppercase">
                    {isWithin24h 
                      ? '🟢 Ventana de 24 horas ACTIVA (Mensajes Libres Permitidos)' 
                      : '🟠 Ventana de 24 horas VENCIDA (Regla Oficial de Meta)'}
                  </span>
                  <p className="text-slate-300">
                    {isWithin24h
                      ? 'El cliente envió un mensaje en las últimas 24 horas. Puedes enviar texto libre o plantillas directamente desde el CRM.'
                      : `Han pasado ${Math.round(hoursSinceLastContact)} horas desde el último mensaje entrante. Según las políticas oficiales de la WhatsApp Cloud API, fuera de la ventana de 24h ES OBLIGATORIO usar una Plantilla de Mensaje aprobada por Meta para evitar el bloqueo del número.`}
                  </p>
                </div>
              </div>

              {/* Template selector */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <span>1. Seleccionar Plantilla Aprobada por Meta</span>
                    <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-normal">Recomendado</span>
                  </label>
                  <button
                    onClick={() => setSelectedTemplateId('')}
                    className="text-[11px] text-slate-400 hover:text-white underline"
                  >
                    Usar texto libre
                  </button>
                </div>

                <select
                  value={selectedTemplateId}
                  onChange={e => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- [Modo Texto Libre / Manual] --</option>
                  {templates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      [{tpl.unit === 'el_zapotal' ? '🌿 Zapotal' : '⚡ Red Líder'}] {tpl.name} ({tpl.category})
                    </option>
                  ))}
                </select>

                {selectedTplObj && (
                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] text-slate-400 font-semibold block">
                      Variables dinámicas para esta plantilla:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedTplObj.variables.map((varName, idx) => (
                        <div key={idx} className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-mono">{varName} (ej. Nombre / Lote)</label>
                          <input
                            type="text"
                            placeholder={idx === 0 ? lead.name : (idx === 1 ? (lead.company || 'Lote A-01') : '')}
                            value={variableValues[idx] || ''}
                            onChange={e => {
                              const next = [...variableValues];
                              next[idx] = e.target.value;
                              setVariableValues(next);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedTemplateId && (
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-white block">Escribe tu mensaje de texto libre:</label>
                    <textarea
                      rows={4}
                      value={customText}
                      onChange={e => setCustomText(e.target.value)}
                      placeholder="Escribe el mensaje para el prospecto..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Message preview box */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Vista previa del mensaje a enviar ({lead.phone}):
                </span>
                <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl text-xs text-emerald-200 font-sans leading-relaxed whitespace-pre-wrap">
                  {previewText || '(Selecciona una plantilla o escribe texto arriba)'}
                </div>
              </div>

              {/* Action status & buttons */}
              {waStatus && (
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white">
                  {waStatus}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    const url = `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(previewText)}`;
                    window.open(url, '_blank');
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <span>🌐 Abrir en WhatsApp Web / App</span>
                </button>

                <button
                  onClick={handleSendWhatsApp}
                  disabled={sendingWa || (!selectedTemplateId && !customText.trim())}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{sendingWa ? 'Enviando a Meta...' : 'Enviar por WhatsApp Cloud API'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Form to add new note / call / visit */}
              <form onSubmit={handleAddInteraction} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-purple-400" />
                  Registrar Nueva Interacción / Seguimiento
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">Canal de Contacto</label>
                    <select
                      value={newChannel}
                      onChange={e => setNewChannel(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold"
                    >
                      <option value="Llamada">📞 Llamada telefónica</option>
                      <option value="WhatsApp">💬 WhatsApp</option>
                      <option value="Reunión">🤝 Reunión Zoom / Presencial</option>
                      <option value="Visita">🚗 Visita al Terreno</option>
                      <option value="Correo">✉️ Correo electrónico</option>
                      <option value="Nota interna">📝 Nota interna</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">Próxima Acción (Actualizar)</label>
                    <input
                      type="text"
                      placeholder="Ej: Llamar mañana para confirmar depósito..."
                      value={newNextAction}
                      onChange={e => setNewNextAction(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">Fecha Próxima Acción</label>
                    <input
                      type="date"
                      value={newNextActionDate}
                      onChange={e => setNewNextActionDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    rows={3}
                    placeholder="Detalle o nota de la conversación con el cliente..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingNote}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savingNote ? 'Guardando...' : 'Registrar en Historial'}</span>
                  </button>
                </div>
              </form>

              {/* Timeline of interactions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Historial Cronológico de Interacciones ({lead.interactions.length})
                </h4>

                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {lead.interactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">Sin interacciones previas</div>
                  ) : (
                    lead.interactions.map((int) => (
                      <div key={int.id} className="relative pl-8 group">
                        <div className={`absolute left-2 top-2 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                          int.isIncoming ? 'bg-emerald-400 ring-4 ring-emerald-500/20' : 'bg-blue-500'
                        }`} />

                        <div className="bg-slate-950/90 border border-slate-800/80 p-3.5 rounded-2xl text-xs space-y-1 shadow-sm group-hover:border-slate-700 transition-colors">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className={`font-extrabold uppercase px-2 py-0.5 rounded ${
                              int.isIncoming ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-blue-300'
                            }`}>
                              {int.isIncoming ? '📥 ' : '📤 '}{int.channel}
                            </span>
                            <span className="font-mono">{new Date(int.date).toLocaleString('es-PE')}</span>
                          </div>
                          <p className="text-slate-200 font-medium leading-relaxed whitespace-pre-wrap pt-1">
                            {int.note}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            ID: {lead.id} • Creado: {new Date(lead.createdAt).toLocaleDateString('es-PE')}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
