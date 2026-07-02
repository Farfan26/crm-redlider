/**
 * Vista de Seguimientos Vencidos (Ordenados automáticamente por Días de Retraso)
 * Pieza clave de la automatización de seguimiento de Red Líder
 */
import React from 'react';
import { Lead } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertCircle, 
  Clock, 
  PhoneCall, 
  MessageCircle, 
  Calendar, 
  ChevronRight, 
  Flame, 
  Briefcase, 
  Building2, 
  Code,
  CheckCircle2,
  BellRing
} from 'lucide-react';

interface OverdueFollowUpsViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenSequences: () => void;
  onOpenReactivation: () => void;
}

export const OverdueFollowUpsView: React.FC<OverdueFollowUpsViewProps> = ({
  leads,
  onSelectLead,
  onOpenSequences,
  onOpenReactivation
}) => {
  const { selectedUnit, currentUser } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  // Filtrar solo vencidos (fecha anterior a hoy) y ordenar por días de retraso descendente
  const overdueLeads = leads
    .filter(l => {
      if (selectedUnit !== 'all' && l.unit !== selectedUnit) return false;
      return l.nextActionDate && l.nextActionDate < today;
    })
    .sort((a, b) => (a.nextActionDate < b.nextActionDate ? -1 : 1));

  // También calcular leads sin próxima acción (Alerta Roja)
  const noActionLeads = leads.filter(l => {
    if (selectedUnit !== 'all' && l.unit !== selectedUnit) return false;
    return !l.nextAction || !l.nextActionDate;
  });

  const getDaysDelayed = (dateStr: string) => {
    const diff = (new Date(today).getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(diff));
  };

  const getUnitIcon = (unit: string) => {
    if (unit === 'red_lider') return <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
    if (unit === 'el_zapotal') return <Building2 className="w-3.5 h-3.5 text-emerald-400" />;
    return <Code className="w-3.5 h-3.5 text-purple-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Top action and guidance bar */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-red-950/80 border border-amber-500/40 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/40 text-amber-400 shrink-0">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>Seguimientos Vencidos & Alertas Operativas</span>
              <span className="text-xs px-2.5 py-0.5 bg-amber-500 text-slate-950 font-extrabold rounded-full">
                {overdueLeads.length} vencidos
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Ordenados por días de retraso. Prioridad máxima para Carlos, agendadora y vendedores senior.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReactivation}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <span>🔄 Reactivación (+30/60 días)</span>
          </button>
          <button
            onClick={onOpenSequences}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Plantillas y Secuencias</span>
          </button>
        </div>
      </div>

      {/* Alerta roja de leads sin acción si existen */}
      {noActionLeads.length > 0 && (
        <div className="bg-red-950/40 border-2 border-red-500/60 rounded-2xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-red-300 flex items-center gap-2 uppercase tracking-wider">
              <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
              <span>ALERTA ROJA 🔴: {noActionLeads.length} prospectos sin próxima acción definida</span>
            </h3>
            <span className="text-xs text-slate-400">Violación a regla comercial de Ingresos Predecibles</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {noActionLeads.map(l => (
              <div
                key={l.id}
                onClick={() => onSelectLead(l)}
                className="bg-slate-950/90 border border-red-500/40 p-3 rounded-xl hover:bg-slate-900 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="min-w-0">
                  <span className="font-bold text-white block truncate text-xs">{l.name}</span>
                  <span className="text-[10px] text-slate-400 block">{l.phone} • Resp: {l.assignedTo}</span>
                </div>
                <span className="text-xs bg-red-600 text-white font-bold px-2 py-1 rounded shrink-0">
                  Definir
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de vencidos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Listado de Seguimientos Vencidos ({overdueLeads.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Haz clic en "Atender / WA" para enviar plantilla instantánea por WhatsApp o registrar llamada
          </span>
        </div>

        {overdueLeads.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">¡Excelente trabajo! No hay seguimientos vencidos en esta unidad.</p>
            <p className="text-xs text-slate-500">Todo tu equipo comercial está al día con sus próximas acciones.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {overdueLeads.map(lead => {
              const daysDelayed = getDaysDelayed(lead.nextActionDate);
              const isExtreme = daysDelayed >= 7;

              return (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className={`p-4 hover:bg-slate-800/60 transition-colors cursor-pointer flex flex-wrap items-center justify-between gap-4 ${
                    isExtreme ? 'bg-amber-950/20' : ''
                  }`}
                >
                  {/* Left: Delay tag + Name & info */}
                  <div className="flex items-center gap-4 min-w-[280px] flex-1">
                    <div className={`px-2.5 py-1.5 rounded-xl font-mono text-center shrink-0 ${
                      isExtreme 
                        ? 'bg-red-500 text-white font-black shadow-md shadow-red-500/20' 
                        : 'bg-amber-500 text-slate-950 font-extrabold'
                    }`}>
                      <span className="text-xs block leading-none">{daysDelayed}</span>
                      <span className="text-[9px] uppercase leading-none block mt-0.5">días</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-extrabold text-white text-sm group-hover:text-blue-400 truncate">
                          {lead.name}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                          {getUnitIcon(lead.unit)}
                          {lead.unit === 'red_lider' ? 'Red Líder' : (lead.unit === 'el_zapotal' ? 'Zapotal' : 'Soft')}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded uppercase">
                          {lead.stage}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>📱 {lead.phone}</span>
                        <span>•</span>
                        <span className="text-blue-400 font-semibold uppercase">Resp: {lead.assignedTo}</span>
                        <span>•</span>
                        <span className="text-slate-500 font-mono">Venció el {lead.nextActionDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: The overdue action text */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex-1 min-w-[260px] text-xs">
                    <span className="text-slate-500 font-bold uppercase text-[9px] block">Acción Pendiente:</span>
                    <span className="text-amber-200 font-semibold line-clamp-2">{lead.nextAction}</span>
                  </div>

                  {/* Right: Quick buttons */}
                  <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        const url = `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${lead.name}, te saludo de Red Líder. Te escribo para dar seguimiento a nuestra conversación pendiente...`)}`;
                        window.open(url, '_blank');
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                      title="Abrir WhatsApp con mensaje pre-cargado"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => onSelectLead(lead)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Abrir ficha para registrar llamada o reprogramar"
                    >
                      <span>Atender</span>
                      <ChevronRight className="w-4 h-4" />
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
