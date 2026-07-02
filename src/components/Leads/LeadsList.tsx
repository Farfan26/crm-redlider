/**
 * Vista de Lista de Prospectos (Leads) con Alertas Rojas 🔴 y Naranjas 🟠
 */
import React, { useState } from 'react';
import { Lead, BusinessUnit, FunnelStage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertCircle, 
  Clock, 
  MessageCircle, 
  Phone, 
  Mail, 
  Building2, 
  Briefcase, 
  Code, 
  Filter, 
  Search, 
  Plus, 
  Upload, 
  Download, 
  ChevronRight,
  Flame
} from 'lucide-react';

interface LeadsListProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onNewLead: () => void;
  onOpenImport: () => void;
  onExportCsv: () => void;
  onExportExcel?: () => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  onSelectLead,
  onNewLead,
  onOpenImport,
  onExportCsv,
  onExportExcel
}) => {
  const { selectedUnit } = useAuth();
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterTemp, setFilterTemp] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterAlert, setFilterAlert] = useState<string>('all');

  const today = new Date().toISOString().split('T')[0];

  // Filtrado interno
  const filteredLeads = leads.filter(l => {
    if (selectedUnit !== 'all' && l.unit !== selectedUnit) return false;
    if (filterStage !== 'all' && l.stage !== filterStage) return false;
    if (filterTemp !== 'all' && l.temperature !== filterTemp) return false;
    if (filterAssignee !== 'all' && l.assignedTo !== filterAssignee) return false;

    if (filterAlert === 'red') {
      return !l.nextAction || !l.nextActionDate;
    } else if (filterAlert === 'orange') {
      return l.nextActionDate && l.nextActionDate < today && l.nextAction;
    } else if (filterAlert === 'unread') {
      return l.hasUnreadMessage;
    }

    return true;
  });

  const getUnitBadge = (unit: BusinessUnit) => {
    if (unit === 'red_lider') return <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Briefcase className="w-3 h-3" />Red Líder</span>;
    if (unit === 'el_zapotal') return <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Building2 className="w-3 h-3" />Zapotal</span>;
    return <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Code className="w-3 h-3" />Software</span>;
  };

  const getStageBadge = (stage: FunnelStage) => {
    return <span className="bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{stage}</span>;
  };

  const getTemperatureBadge = (temp: string) => {
    if (temp === 'caliente') return <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Flame className="w-3 h-3 text-red-400" />Caliente</span>;
    if (temp === 'tibio') return <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">Tibio</span>;
    if (temp === 'frio') return <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold">Frío</span>;
    return <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">Perdido</span>;
  };

  return (
    <div className="space-y-4">
      {/* Top action and filter bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Listado General de Prospectos</span>
              <span className="text-xs px-2.5 py-0.5 bg-blue-950 border border-blue-800 text-blue-300 rounded-full">
                {filteredLeads.length} registros
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Control riguroso de próximas acciones, temperaturas y fuentes comerciales
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenImport}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Importar Excel/CSV</span>
            </button>
            <button
              onClick={onExportCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
            {onExportExcel && (
              <button
                onClick={onExportExcel}
                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                title="Descargar base de datos en formato Excel .xlsx"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>📥 Descargar Excel (.xlsx)</span>
              </button>
            )}
            <button
              onClick={onNewLead}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Prospecto</span>
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-bold uppercase flex items-center gap-1 text-[10px]">
            <Filter className="w-3 h-3 text-blue-400" /> Filtros:
          </span>

          <select
            value={filterAlert}
            onChange={e => setFilterAlert(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none"
          >
            <option value="all">Todas las Alertas</option>
            <option value="red">🔴 Alerta Roja (Sin Próxima Acción)</option>
            <option value="orange">🟠 Alerta Naranja (Seguimiento Vencido)</option>
            <option value="unread">🟢 Con Mensaje Entrante sin Leer</option>
          </select>

          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none"
          >
            <option value="all">Todas las Etapas</option>
            <option value="demanda">1. Gen. Demanda</option>
            <option value="calificacion">2. Calificación</option>
            <option value="diagnostico">3. Diagnóstico / Visita / Demo</option>
            <option value="propuesta">4. Propuesta / Separación</option>
            <option value="seguimiento">5. Seguimiento / Negociac.</option>
            <option value="cierre">6. Cierre / Contrato</option>
          </select>

          <select
            value={filterTemp}
            onChange={e => setFilterTemp(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none"
          >
            <option value="all">Todas las Temperaturas</option>
            <option value="caliente">🔥 Caliente</option>
            <option value="tibio">🟡 Tibio</option>
            <option value="frio">❄️ Frío</option>
          </select>

          <select
            value={filterAssignee}
            onChange={e => setFilterAssignee(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none"
          >
            <option value="all">Todos los Responsables</option>
            <option value="oscar">Óscar Benavides</option>
            <option value="carlos">Carlos Mendoza</option>
            <option value="agendadora">Valeria (Agendadora)</option>
            <option value="vendedor">Esteban / Vendedores</option>
          </select>

          {(filterStage !== 'all' || filterTemp !== 'all' || filterAssignee !== 'all' || filterAlert !== 'all') && (
            <button
              onClick={() => {
                setFilterStage('all');
                setFilterTemp('all');
                setFilterAssignee('all');
                setFilterAlert('all');
              }}
              className="text-slate-400 hover:text-white underline text-[11px] ml-1"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Alerta / Estado</th>
                <th className="py-3 px-4">Prospecto & Empresa</th>
                <th className="py-3 px-4">Unidad & Fuente</th>
                <th className="py-3 px-4">Etapa & Temp.</th>
                <th className="py-3 px-4">Próxima Acción (Obligatorio)</th>
                <th className="py-3 px-4">Resp.</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    No se encontraron prospectos con los filtros actuales
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => {
                  const isOverdue = lead.nextActionDate && lead.nextActionDate < today;
                  const noAction = !lead.nextAction || !lead.nextActionDate;

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`hover:bg-slate-800/60 transition-colors cursor-pointer group ${
                        noAction ? 'bg-red-950/20' : (isOverdue ? 'bg-amber-950/15' : '')
                      }`}
                    >
                      {/* Alert cell */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {noAction ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500 text-white font-bold text-[10px] animate-pulse">
                            🔴 SIN ACCIÓN
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500 text-slate-950 font-extrabold text-[10px]">
                            🟠 VENCIDO ({lead.nextActionDate})
                          </span>
                        ) : lead.hasUnreadMessage ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500 text-white font-bold text-[10px]">
                            🟢 MENSAJE ENTRANTE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                            🟢 AL DÍA ({lead.nextActionDate})
                          </span>
                        )}
                      </td>

                      {/* Name & Company */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                          {lead.name}
                        </div>
                        {lead.company && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            🏢 {lead.company}
                          </div>
                        )}
                        <div className="text-[10px] text-blue-400 font-mono">
                          {lead.phone}
                        </div>
                      </td>

                      {/* Unit & Source */}
                      <td className="py-3 px-4 space-y-1">
                        <div>{getUnitBadge(lead.unit)}</div>
                        <div className="text-[11px] text-slate-400 font-semibold">{lead.source}</div>
                      </td>

                      {/* Stage & Temp */}
                      <td className="py-3 px-4 space-y-1">
                        <div>{getStageBadge(lead.stage)}</div>
                        <div>{getTemperatureBadge(lead.temperature)}</div>
                      </td>

                      {/* Next action */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className={`text-xs font-semibold line-clamp-2 ${noAction ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                          {lead.nextAction || '⚠️ ALERTA ROJA: Falta definir próxima acción'}
                        </div>
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-4 uppercase text-[11px] font-bold text-slate-300">
                        {lead.assignedTo}
                      </td>

                      {/* Value */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        S/ {(lead.dealValue || 0).toLocaleString('es-PE')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              const url = `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${lead.name}, te saludo de Red Líder...`)}`;
                              window.open(url, '_blank');
                            }}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                            title="Abrir WhatsApp Web"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onSelectLead(lead)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                            title="Ver Ficha Completa"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
