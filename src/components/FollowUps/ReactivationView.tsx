/**
 * Vista de Reactivación de Bases Antiguas (>30, 60, 90 días sin contacto)
 * Permite disparo en lote o reasignación masiva de leads dormidos
 */
import React, { useState } from 'react';
import { Lead, BusinessUnit } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  RefreshCcw, 
  Clock, 
  MessageCircle, 
  Users, 
  Check, 
  Send, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  Briefcase, 
  Code,
  Filter
} from 'lucide-react';

interface ReactivationViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onRefresh: () => void;
}

export const ReactivationView: React.FC<ReactivationViewProps> = ({
  leads,
  onSelectLead,
  onRefresh
}) => {
  const { selectedUnit, usersList, currentUser } = useAuth();
  const [daysThreshold, setDaysThreshold] = useState<number>(30);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [batchAssignee, setBatchAssignee] = useState<string>('carlos');
  const [processing, setProcessing] = useState(false);
  const [batchMsg, setBatchMsg] = useState<string | null>(null);

  const now = Date.now();
  const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;

  // Filtrar leads sin contacto en más de X días y que no estén cerrados/contrato
  const dormantLeads = leads.filter(l => {
    if (selectedUnit !== 'all' && l.unit !== selectedUnit) return false;
    if (l.stage === 'cierre' || l.stage === 'contrato') return false;

    const lastContactTime = new Date(l.lastContactDate || l.createdAt || 0).getTime();
    return (now - lastContactTime) >= thresholdMs;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(dormantLeads.map(l => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter(i => i !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleBatchReassign = async () => {
    if (selectedLeadIds.length === 0) {
      alert('Selecciona al menos un prospecto para reasignar');
      return;
    }
    setProcessing(true);
    setBatchMsg(null);
    try {
      let count = 0;
      for (const id of selectedLeadIds) {
        await api.updateLead(id, { assignedTo: batchAssignee as any });
        count++;
      }
      setBatchMsg(`✅ Se reasignaron ${count} prospectos dormidos con éxito al responsable ${batchAssignee.toUpperCase()}`);
      setSelectedLeadIds([]);
      onRefresh();
    } catch (e: any) {
      alert('Error en reasignación por lote: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchWhatsApp = async () => {
    if (selectedLeadIds.length === 0) {
      alert('Selecciona al menos un prospecto para enviar campaña de reactivación');
      return;
    }
    if (!confirm(`¿Estás seguro de enviar una campaña de reactivación por WhatsApp Cloud API a ${selectedLeadIds.length} prospectos?`)) {
      return;
    }

    setProcessing(true);
    setBatchMsg(null);
    try {
      let count = 0;
      for (const id of selectedLeadIds) {
        await api.sendWhatsAppMessage({
          leadId: id,
          customText: `Hola, te saludamos del equipo de Red Líder. Notamos que hace un tiempo consultaste por nuestros servicios/lotes y queremos contarte sobre una nueva oportunidad especial este mes. ¿Te gustaría agendar una llamada breve de actualización?`
        });
        count++;
      }
      setBatchMsg(`🚀 Se dispararon ${count} mensajes de campaña de reactivación por WhatsApp de forma secuencial.`);
      setSelectedLeadIds([]);
      onRefresh();
    } catch (e: any) {
      alert('Error en disparo masivo de WhatsApp: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/40 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/40 text-indigo-400 shrink-0">
            <RefreshCcw className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>Reactivación de Bases Antiguas & Prospectos Dormidos</span>
              <span className="text-xs px-2.5 py-0.5 bg-indigo-500 text-white font-extrabold rounded-full">
                {dormantLeads.length} leads inactivos
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Identifica contactos sin interacción por +30, +60 o +90 días y ejecuta reasignación en lote o campañas.
            </p>
          </div>
        </div>

        {/* Days filter pills */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-bold px-2 uppercase text-[10px] flex items-center gap-1">
            <Filter className="w-3 h-3 text-indigo-400" /> Sin contacto por:
          </span>
          {[30, 60, 90].map(days => (
            <button
              key={days}
              onClick={() => {
                setDaysThreshold(days);
                setSelectedLeadIds([]);
              }}
              className={`px-3 py-1 rounded-lg font-extrabold transition-all ${
                daysThreshold === days 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              +{days} días
            </button>
          ))}
        </div>
      </div>

      {/* Batch action bar when items selected */}
      {selectedLeadIds.length > 0 && (
        <div className="bg-slate-900 border-2 border-indigo-500/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in zoom-in duration-150 shadow-xl">
          <div className="flex items-center gap-2 font-bold text-white text-xs">
            <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg font-mono">
              {selectedLeadIds.length} seleccionados
            </span>
            <span>¿Qué deseas hacer con estos prospectos dormidos?</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold uppercase pl-2">Reasignar a:</span>
              <select
                value={batchAssignee}
                onChange={e => setBatchAssignee(e.target.value)}
                className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded border border-slate-800 uppercase"
              >
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <button
                onClick={handleBatchReassign}
                disabled={processing}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1"
              >
                <span>Reasignar en lote</span>
              </button>
            </div>

            <button
              onClick={handleBatchWhatsApp}
              disabled={processing}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{processing ? 'Enviando...' : 'Disparar Campaña WA'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Result message */}
      {batchMsg && (
        <div className="bg-emerald-950/60 border border-emerald-500/60 p-4 rounded-2xl text-emerald-200 font-bold text-xs flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>{batchMsg}</span>
        </div>
      )}

      {/* Dormant leads list table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="select-all"
              checked={dormantLeads.length > 0 && selectedLeadIds.length === dormantLeads.length}
              onChange={handleSelectAll}
              className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <label htmlFor="select-all" className="font-bold text-slate-300 uppercase tracking-wider cursor-pointer">
              Seleccionar Todos los Prospectos Dormidos ({dormantLeads.length})
            </label>
          </div>
          <span className="text-[11px] text-slate-500">
            Criterio actual: Sin actividad registrada desde hace más de {daysThreshold} días
          </span>
        </div>

        {dormantLeads.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Clock className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No se encontraron prospectos dormidos con +{daysThreshold} días sin contacto.</p>
            <p className="text-xs text-slate-500">Intenta cambiar el filtro a +30 días o selecciona otra unidad de negocio.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 max-h-[600px] overflow-y-auto">
            {dormantLeads.map(lead => {
              const lastContactTime = new Date(lead.lastContactDate || lead.createdAt || 0).getTime();
              const daysDormant = Math.round((now - lastContactTime) / (1000 * 60 * 60 * 24));
              const isSelected = selectedLeadIds.includes(lead.id);

              return (
                <div
                  key={lead.id}
                  onClick={() => handleToggleSelect(lead.id)}
                  className={`p-4 hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected ? 'bg-indigo-950/30 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-[240px] flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Controlled by row click
                      className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 shrink-0"
                    />

                    <div className="bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-center shrink-0">
                      <span className="text-xs font-mono font-bold text-indigo-400 block leading-none">{daysDormant}</span>
                      <span className="text-[9px] text-slate-500 uppercase block mt-0.5">días</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm truncate">{lead.name}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded uppercase">
                          {lead.stage}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>📱 {lead.phone}</span>
                        <span>•</span>
                        <span>🏢 {lead.company || 'Sin empresa'}</span>
                        <span>•</span>
                        <span className="text-blue-400 font-semibold uppercase">Resp: {lead.assignedTo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs flex-1 max-w-sm">
                    <span className="text-slate-500 font-bold uppercase text-[9px] block">Último contacto / nota:</span>
                    <span className="text-slate-300 line-clamp-2">
                      {lead.interactions[0]?.note || 'Sin registro de interacción en historial'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Ver Ficha
                    </button>
                    <button
                      onClick={() => {
                        const url = `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${lead.name}, te saluda el equipo de Red Líder...`)}`;
                        window.open(url, '_blank');
                      }}
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WA</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
