/**
 * Embudo Kanban Drag & Drop Diferenciado por Unidad de Negocio
 */
import React, { useState } from 'react';
import { Lead, FunnelStage, BusinessUnit } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  Phone, 
  Mail, 
  Calendar, 
  AlertCircle, 
  ArrowRight, 
  Flame, 
  Building2, 
  Briefcase, 
  Code, 
  MessageCircle, 
  User, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  Tag
} from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onRefresh: () => void;
  onNewLead: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onSelectLead,
  onRefresh,
  onNewLead
}) => {
  const { selectedUnit, currentUser } = useAuth();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<FunnelStage | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Definir etapas según la unidad de negocio seleccionada
  const getStagesForUnit = (unit: BusinessUnit | 'all'): { id: FunnelStage; label: string; colorClass: string; borderClass: string }[] => {
    if (unit === 'red_lider') {
      return [
        { id: 'demanda', label: '1. Gen. Demanda', colorClass: 'bg-blue-950/40 text-blue-300', borderClass: 'border-blue-500/40' },
        { id: 'calificacion', label: '2. Calificación', colorClass: 'bg-cyan-950/40 text-cyan-300', borderClass: 'border-cyan-500/40' },
        { id: 'diagnostico', label: '3. Diagnóstico Zoom', colorClass: 'bg-indigo-950/40 text-indigo-300', borderClass: 'border-indigo-500/40' },
        { id: 'propuesta', label: '4. Propuesta B2B', colorClass: 'bg-purple-950/40 text-purple-300', borderClass: 'border-purple-500/40' },
        { id: 'seguimiento', label: '5. Seguimiento', colorClass: 'bg-amber-950/40 text-amber-300', borderClass: 'border-amber-500/40' },
        { id: 'cierre', label: '6. Cierre / Factura', colorClass: 'bg-emerald-950/40 text-emerald-300', borderClass: 'border-emerald-500/40' },
        { id: 'referidos', label: '7. Referidos / Fidelic.', colorClass: 'bg-teal-950/40 text-teal-300', borderClass: 'border-teal-500/40' }
      ];
    } else if (unit === 'el_zapotal') {
      return [
        { id: 'demanda', label: '1. Gen. Demanda', colorClass: 'bg-emerald-950/40 text-emerald-300', borderClass: 'border-emerald-500/40' },
        { id: 'calificacion', label: '2. Calificación', colorClass: 'bg-teal-950/40 text-teal-300', borderClass: 'border-teal-500/40' },
        { id: 'visita', label: '3. Visita al Terreno 🚗', colorClass: 'bg-green-950/40 text-green-300', borderClass: 'border-green-500/40' },
        { id: 'seguimiento', label: '4. Seguimiento Post', colorClass: 'bg-amber-950/40 text-amber-300', borderClass: 'border-amber-500/40' },
        { id: 'separacion', label: '5. Separación S/ 1k', colorClass: 'bg-orange-950/40 text-orange-300', borderClass: 'border-orange-500/40' },
        { id: 'contrato', label: '6. Contrato / Minuta 🏆', colorClass: 'bg-emerald-900/60 text-white font-bold', borderClass: 'border-emerald-400' },
        { id: 'referidos', label: '7. Referidos de Vecino', colorClass: 'bg-teal-950/40 text-teal-300', borderClass: 'border-teal-500/40' }
      ];
    } else if (unit === 'software') {
      return [
        { id: 'demanda', label: '1. Gen. Demanda', colorClass: 'bg-purple-950/40 text-purple-300', borderClass: 'border-purple-500/40' },
        { id: 'calificacion', label: '2. Calificación', colorClass: 'bg-violet-950/40 text-violet-300', borderClass: 'border-violet-500/40' },
        { id: 'demostracion', label: '3. Demostración Demo', colorClass: 'bg-indigo-950/40 text-indigo-300', borderClass: 'border-indigo-500/40' },
        { id: 'propuesta', label: '4. Propuesta Tech', colorClass: 'bg-fuchsia-950/40 text-fuchsia-300', borderClass: 'border-fuchsia-500/40' },
        { id: 'negociacion', label: '5. Negociación', colorClass: 'bg-amber-950/40 text-amber-300', borderClass: 'border-amber-500/40' },
        { id: 'cierre', label: '6. Cierre / Contrato', colorClass: 'bg-emerald-950/40 text-emerald-300', borderClass: 'border-emerald-500/40' },
        { id: 'referidos', label: '7. Referidos / Upsell', colorClass: 'bg-teal-950/40 text-teal-300', borderClass: 'border-teal-500/40' }
      ];
    } else {
      // Unificado de 6 columnas
      return [
        { id: 'demanda', label: '1. Gen. Demanda', colorClass: 'bg-slate-800 text-slate-300', borderClass: 'border-slate-700' },
        { id: 'calificacion', label: '2. Calificación', colorClass: 'bg-slate-800 text-slate-300', borderClass: 'border-slate-700' },
        { id: 'diagnostico' as any, label: '3. Diag / Visita / Demo', colorClass: 'bg-slate-800 text-slate-300', borderClass: 'border-slate-700' },
        { id: 'propuesta' as any, label: '4. Propuesta / Separac.', colorClass: 'bg-slate-800 text-slate-300', borderClass: 'border-slate-700' },
        { id: 'seguimiento' as any, label: '5. Seg. / Negociación', colorClass: 'bg-slate-800 text-slate-300', borderClass: 'border-slate-700' },
        { id: 'cierre' as any, label: '6. Cierre / Contrato 🏆', colorClass: 'bg-emerald-950/60 text-emerald-300 font-bold', borderClass: 'border-emerald-500/60' }
      ];
    }
  };

  const stages = getStagesForUnit(selectedUnit);

  // Mapear etapa para vista unificada
  const mapStageToUnified = (stage: FunnelStage): string => {
    if (stage === 'demanda' || stage === 'calificacion' || stage === 'referidos') return stage;
    if (stage === 'diagnostico' || stage === 'visita' || stage === 'demostracion') return 'diagnostico';
    if (stage === 'propuesta' || stage === 'separacion') return 'propuesta';
    if (stage === 'seguimiento' || stage === 'negociacion') return 'seguimiento';
    if (stage === 'cierre' || stage === 'contrato') return 'cierre';
    return stage;
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: FunnelStage) => {
    e.preventDefault();
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStage: FunnelStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (!leadId) return;

    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.stage === targetStage) return;

    await executeStageMove(lead, targetStage);
  };

  const executeStageMove = async (lead: Lead, newStage: FunnelStage) => {
    // Verificar permisos
    if (!currentUser.permissions.canEditAll && lead.assignedTo !== currentUser.id) {
      alert('🔒 No tienes permiso para mover este prospecto porque está asignado a otro responsable.');
      return;
    }

    setUpdatingId(lead.id);
    try {
      await api.updateLead(lead.id, { stage: newStage });
      
      // Celebración si cerró venta
      if (newStage === 'cierre' || newStage === 'contrato') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6']
        });
      }

      onRefresh();
    } catch (err: any) {
      alert('Error moviendo prospecto: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const getUnitIcon = (unit: BusinessUnit) => {
    if (unit === 'red_lider') return <Briefcase className="w-3 h-3 text-blue-400" />;
    if (unit === 'el_zapotal') return <Building2 className="w-3 h-3 text-emerald-400" />;
    return <Code className="w-3 h-3 text-purple-400" />;
  };

  const getTemperatureBadge = (temp: string) => {
    if (temp === 'caliente') return <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5"><Flame className="w-3 h-3 text-red-400" />Caliente</span>;
    if (temp === 'tibio') return <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-bold">Tibio</span>;
    if (temp === 'frio') return <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-[10px] font-bold">Frío</span>;
    return <span className="bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold">Perdido</span>;
  };

  return (
    <div className="space-y-4">
      {/* Kanban header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">
              Embudo Comercial: {selectedUnit === 'red_lider' ? 'Red Líder (Consultoría & Cursos)' : (selectedUnit === 'el_zapotal' ? 'El Zapotal (Venta de Lotes 🌿)' : (selectedUnit === 'software' ? 'Software & Proyectos ⚡' : 'Vista Unificada Todas las Unidades'))}
            </h2>
            <span className="text-xs px-2.5 py-0.5 bg-blue-950 border border-blue-800 text-blue-300 rounded-full font-bold">
              {leads.length} leads
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            💡 Arrastra y suelta las tarjetas entre columnas para actualizar la etapa en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewLead}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <span>+ Nuevo Prospecto</span>
          </button>
        </div>
      </div>

      {/* Kanban columns container */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar items-start min-h-[620px]">
        {stages.map((st) => {
          // Filtrar leads por columna
          const columnLeads = leads.filter(l => {
            if (selectedUnit === 'all') {
              return mapStageToUnified(l.stage) === st.id;
            }
            return l.stage === st.id;
          });

          const totalColumnValue = columnLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);
          const isOver = dragOverStage === st.id;

          return (
            <div
              key={st.id}
              onDragOver={(e) => handleDragOver(e, st.id)}
              onDrop={(e) => handleDrop(e, st.id)}
              className={`w-72 md:w-80 shrink-0 bg-slate-900/80 border rounded-2xl flex flex-col max-h-[75vh] transition-all duration-200 ${
                isOver ? 'border-blue-500 bg-slate-800/80 ring-2 ring-blue-500/40 scale-[1.01]' : 'border-slate-800'
              }`}
            >
              {/* Column header */}
              <div className={`p-3 rounded-t-2xl border-b flex items-center justify-between ${st.colorClass} ${st.borderClass}`}>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs truncate uppercase tracking-wider">{st.label}</h3>
                  <span className="text-[10px] opacity-80 block font-mono">
                    S/ {totalColumnValue.toLocaleString('es-PE')}
                  </span>
                </div>
                <span className="bg-slate-950/80 text-white font-mono text-xs px-2 py-0.5 rounded-full font-bold">
                  {columnLeads.length}
                </span>
              </div>

              {/* Cards wrapper */}
              <div className="p-2.5 overflow-y-auto flex-1 space-y-2.5">
                {columnLeads.length === 0 ? (
                  <div className="h-28 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-xs text-center p-4 font-medium">
                    Sin prospectos en esta etapa
                  </div>
                ) : (
                  columnLeads.map(lead => {
                    const isOverdue = lead.nextActionDate && lead.nextActionDate < today;
                    const noAction = !lead.nextAction || !lead.nextActionDate;
                    const isUpdating = updatingId === lead.id;

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => onSelectLead(lead)}
                        className={`bg-slate-950/90 border rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative ${
                          noAction
                            ? 'border-red-500/80 ring-1 ring-red-500/40 bg-red-950/10'
                            : isOverdue
                            ? 'border-amber-500/80 bg-amber-950/10'
                            : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        } ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {/* Alert banners */}
                        {noAction && (
                          <div className="bg-red-500/20 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded mb-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-red-400" />
                            <span>ALERTA ROJA 🔴: Sin próxima acción definida</span>
                          </div>
                        )}
                        {isOverdue && !noAction && (
                          <div className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded mb-2 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>ALERTA NARANJA 🟠: Seguimiento vencido ({lead.nextActionDate})</span>
                          </div>
                        )}
                        {lead.hasUnreadMessage && (
                          <div className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded mb-2 flex items-center gap-1 animate-pulse">
                            <MessageCircle className="w-3 h-3 text-emerald-400" />
                            <span>📥 MENSAJE ENTRANTE SIN LEER</span>
                          </div>
                        )}

                        {/* Card top row: Unit + Temperature */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {getUnitIcon(lead.unit)}
                            {lead.unit === 'red_lider' ? 'Red Líder' : (lead.unit === 'el_zapotal' ? 'El Zapotal' : 'Software')}
                          </span>
                          {getTemperatureBadge(lead.temperature)}
                        </div>

                        {/* Name & Company */}
                        <h4 className="font-extrabold text-white text-sm tracking-tight group-hover:text-blue-400 transition-colors">
                          {lead.name}
                        </h4>
                        {lead.company && (
                          <p className="text-xs text-slate-400 truncate mb-2 font-medium">
                            🏢 {lead.company}
                          </p>
                        )}

                        {/* Deal value & Source */}
                        <div className="flex items-center justify-between text-xs my-2 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/80">
                          <span className="text-emerald-400 font-mono font-bold">
                            S/ {(lead.dealValue || 0).toLocaleString('es-PE')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold bg-slate-800 px-1.5 py-0.5 rounded">
                            {lead.source}
                          </span>
                        </div>

                        {/* Next Action Box */}
                        <div className="bg-slate-900/90 rounded-lg p-2 text-[11px] border border-slate-800 text-slate-300 mb-2">
                          <span className="text-slate-400 font-bold uppercase text-[9px] block">Próxima acción ({lead.nextActionDate || 'Pendiente'}):</span>
                          <span className="line-clamp-2 text-white font-medium">{lead.nextAction || '⛔ Definir ahora en la ficha'}</span>
                        </div>

                        {/* Footer row: Assignee & Quick open WhatsApp */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 font-semibold uppercase text-slate-300">
                            <User className="w-3 h-3 text-blue-400" />
                            {lead.assignedTo}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${lead.name}, te saluda el equipo comercial de Red Líder...`)}`;
                              window.open(url, '_blank');
                            }}
                            className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg transition-all flex items-center gap-1"
                            title="Abrir WhatsApp Web"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="font-bold">WA</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
