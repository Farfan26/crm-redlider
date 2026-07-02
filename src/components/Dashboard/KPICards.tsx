/**
 * Tarjetas de Indicadores KPI Ejecutivos
 */
import React from 'react';
import { DashboardKPIs } from '../../types';
import { 
  Users, 
  PhoneCall, 
  Calendar, 
  MapPin, 
  FileText, 
  DollarSign, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Award
} from 'lucide-react';

interface KPICardsProps {
  kpis?: DashboardKPIs | null;
  loading?: boolean;
  onOpenReport?: () => void;
  onFilterOverdue?: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  kpis,
  loading = false,
  onOpenReport,
  onFilterOverdue
}) => {
  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 h-28 rounded-xl border border-slate-700/50"></div>
        ))}
      </div>
    );
  }

  const leadsByUnit = kpis.leadsByUnit || {};
  const referralsMetrics = kpis.referralsMetrics || { convertidos: 0, salesAmount: 0 };

  const cards = [
    {
      title: 'Total Prospectos',
      value: (kpis.totalLeads || 0).toLocaleString('es-PE'),
      subtext: `RL: ${leadsByUnit.red_lider || 0} | Zap: ${leadsByUnit.el_zapotal || 0} | Soft: ${leadsByUnit.software || 0}`,
      icon: <Users className="w-5 h-5 text-blue-400" />,
      bg: 'bg-blue-950/20 border-blue-800/40',
      trend: '+12% vs. mes anterior'
    },
    {
      title: 'Tasa de Contacto',
      value: `${kpis.contactRate || 0}%`,
      subtext: 'Prospectos calificados tras ingreso',
      icon: <PhoneCall className="w-5 h-5 text-emerald-400" />,
      bg: 'bg-emerald-950/20 border-emerald-800/40',
      trend: 'Meta comercial: >80%'
    },
    {
      title: 'Citas / Demos Agendadas',
      value: (kpis.meetingsScheduled || 0).toLocaleString('es-PE'),
      subtext: `+ ${kpis.visitsScheduled || 0} visitas al terreno Zapotal`,
      icon: <Calendar className="w-5 h-5 text-purple-400" />,
      bg: 'bg-purple-950/20 border-purple-800/40',
      trend: 'Alta intención de compra'
    },
    {
      title: 'Propuestas & Separaciones',
      value: ((kpis.proposalsSent || 0) + (kpis.separationsMade || 0)).toLocaleString('es-PE'),
      subtext: `${kpis.proposalsSent || 0} cotizac. | ${kpis.separationsMade || 0} separac.`,
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-950/20 border-amber-800/40',
      trend: 'Etapa decisiva'
    },
    {
      title: 'Cierres & Contratos',
      value: (kpis.contractsClosed || 0).toLocaleString('es-PE'),
      subtext: `Tasa de Cierre: ${kpis.closeRate || 0}%`,
      icon: <Award className="w-5 h-5 text-indigo-400" />,
      bg: 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-950/50',
      trend: `S/ ${(kpis.totalSalesValue || 0).toLocaleString('es-PE')} en ventas`,
      highlight: true
    }
  ];

  return (
    <div className="space-y-4">
      {/* Action header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Tablero Comercial Ejecutivo • Modelo Ingresos Predecibles
          </h2>
          <p className="text-xs text-slate-400">
            Métricas clave de prospección, conversión por embudo y salud operativa
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(kpis.overdueCount || 0) > 0 && (
            <button
              onClick={onFilterOverdue}
              className="px-3.5 py-2 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{kpis.overdueCount} Seguimientos Vencidos</span>
            </button>
          )}

          <button
            onClick={onOpenReport}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <FileText className="w-4 h-4" />
            <span>Generar Reporte Semanal</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all hover:shadow-lg ${card.bg} ${
              card.highlight ? 'ring-2 ring-indigo-500/50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                {card.icon}
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight mb-1">
              {card.value}
            </div>
            <div className="text-[11px] font-semibold text-slate-300 mb-2 truncate">
              {card.subtext}
            </div>
            <div className="text-[10px] font-medium text-slate-400 border-t border-slate-800/60 pt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {card.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Health metrics bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl text-xs">
        <div className="flex items-center gap-3 px-2 border-r border-slate-800/80">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Tiempo promedio sin contacto</span>
            <span className="text-white font-bold text-sm">{kpis.avgDaysWithoutContact || 0} días</span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-2 border-r border-slate-800/80">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Sin próxima acción (Alerta Roja 🔴)</span>
            <span className="text-white font-bold text-sm">{kpis.noActionCount || 0} prospectos</span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-2">
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Referidos VIP Convertidos</span>
            <span className="text-white font-bold text-sm">{referralsMetrics.convertidos || 0} cierres (S/ {(referralsMetrics.salesAmount || 0).toLocaleString('es-PE')})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
