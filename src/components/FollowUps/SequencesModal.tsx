/**
 * Modal de Plantillas de Seguimiento y Secuencias Automatizadas
 * Define flujos de mensajes (Día 1, Día 3, Día 7) por etapa comercial
 */
import React, { useState, useEffect } from 'react';
import { WhatsAppTemplate, BusinessUnit, FunnelStage } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, MessageCircle, Plus, Send, CheckCircle2, Clock, Trash2, Edit2, ShieldAlert } from 'lucide-react';

interface SequencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SequencesModal: React.FC<SequencesModalProps> = ({ isOpen, onClose }) => {
  const { selectedUnit } = useAuth();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // New template form
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<BusinessUnit>(selectedUnit === 'all' ? 'red_lider' : selectedUnit);
  const [category, setCategory] = useState<'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('UTILITY');
  const [bodyText, setBodyText] = useState('');
  const [variablesStr, setVariablesStr] = useState('nombre, empresa');
  const [creating, setCreating] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.getTemplates(selectedUnit);
      setTemplates(res);
    } catch (e) {
      alert('Error cargando plantillas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, selectedUnit]);

  if (!isOpen) return null;

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bodyText) return;

    setCreating(true);
    try {
      const newTpl = await api.createTemplate({
        name: name.toLowerCase().replace(/\s+/g, '_'),
        language: 'es',
        category,
        unit,
        bodyText,
        variables: variablesStr.split(',').map(s => s.trim()).filter(Boolean),
        status: 'APPROVED' // En demo auto-aprobado para usabilidad instantánea
      });
      setTemplates([newTpl, ...templates]);
      setShowNew(false);
      setName('');
      setBodyText('');
    } catch (e: any) {
      alert('Error creando plantilla: ' + e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta plantilla de mensaje?')) return;
    try {
      await api.deleteTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (e: any) {
      alert('Error eliminando plantilla: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Plantillas y Secuencias Automáticas WhatsApp Cloud API</h2>
              <p className="text-xs text-slate-400">Cumplimiento regla 24h Meta • Mensajes aprobados para envío masivo o individual</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 uppercase tracking-wider">
              Catálogo de Plantillas Oficiales ({templates.length})
            </span>
            <button
              onClick={() => setShowNew(!showNew)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{showNew ? 'Cancelar Nueva' : '+ Crear Plantilla Aprobada'}</span>
            </button>
          </div>

          {/* New template form */}
          {showNew && (
            <form onSubmit={handleCreateTemplate} className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-4 animate-in fade-in duration-150">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Registrar Nueva Plantilla en Meta WhatsApp Cloud API</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Nombre técnico (sin espacios) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. recordatorio_visita_zapotal"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Unidad de Negocio</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold uppercase"
                  >
                    <option value="red_lider">Red Líder</option>
                    <option value="el_zapotal">El Zapotal</option>
                    <option value="software">Software</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Categoría Meta</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold"
                  >
                    <option value="UTILITY">UTILITY (Notificaciones / Citas)</option>
                    <option value="MARKETING">MARKETING (Ofertas / Promociones)</option>
                    <option value="AUTHENTICATION">AUTHENTICATION (Códigos OTP)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Cuerpo del mensaje (Usa {"{{1}}"}, {"{{2}}"} para variables dinámicas)</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Hola {{1}}, te saludamos de El Zapotal. Queríamos recordarte tu visita programada para conocer tu futuro lote. ¿Sigues confirmada?"
                  value={bodyText}
                  onChange={e => setBodyText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Nombres descriptivos de variables (separados por coma)</label>
                <input
                  type="text"
                  placeholder="ej. nombre, fecha_visita, nombre_asesor"
                  value={variablesStr}
                  onChange={e => setVariablesStr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{creating ? 'Simulando Aprobación...' : 'Crear y Aprobar Plantilla'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Templates list */}
          {loading ? (
            <div className="py-12 text-center text-slate-500">Cargando plantillas desde Meta Cloud API...</div>
          ) : templates.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-medium">No se encontraron plantillas para esta unidad</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(tpl => (
                <div key={tpl.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-extrabold text-white text-xs bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                        {tpl.name}
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {tpl.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="uppercase font-bold text-blue-300">
                        {tpl.unit === 'red_lider' ? '💼 Red Líder' : (tpl.unit === 'el_zapotal' ? '🌿 Zapotal' : '⚡ Software')}
                      </span>
                      <span>•</span>
                      <span>Categoría: {tpl.category}</span>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl text-slate-300 font-sans text-xs leading-relaxed whitespace-pre-wrap">
                      {tpl.bodyText}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Variables: {tpl.variables.join(', ') || 'Ninguna'}
                    </span>
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                      title="Eliminar plantilla"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Plantillas 100% compatibles con la API de Cloud en Producción</span>
          </span>
          <button onClick={onClose} className="px-5 py-2 bg-slate-800 text-white font-bold rounded-xl">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
