/**
 * Gráfico de Embudo de Conversión & Desglose por Fuente / CPL
 */
import React, { useState } from 'react';
import { DashboardKPIs } from '../../types';
import { api } from '../../services/api';
import { Filter, DollarSign, Check, Edit2, BarChart3, PieChart } from 'lucide-react';

interface FunnelChartProps {
  kpis?: DashboardKPIs | null;
  onRefresh?: () => void;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ kpis, onRefresh }) => {
  const [editingCpl, setEditingCpl] = useState(false);
  const [cplData, setCplData] = useState<Record<string, number>>(kpis?.cplBySource || {});
  const [savingCpl, setSavingCpl] = useState(false);

  React.useEffect(() => {
    if (kpis?.cplBySource) {
      setCplData(kpis.cplBySource);
    }
  }, [kpis]);

  const handleSaveCpl = async () => {
    setSavingCpl(true);
    try {
      await api.saveCpl(cplData);
      setEditingCpl(false);
      if (onRefresh) onRefresh();
    } catch (e) {
      alert('Error guardando CPL');
    } finally {
      setSavingCpl(false);
    }
  };

  if (!kpis) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-80 flex items-center justify-center text-slate-500 font-medium text-xs">
          Cargando embudo de conversión...
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-80 flex items-center justify-center text-slate-500 font-medium text-xs">
          Cargando desglose de fuentes y CPL...
        </div>
      </div>
    );
  }

  const colors = [
    'from-blue-600 to-blue-400',
    'from-indigo-600 to-indigo-400',
    'from-purple-600 to-purple-400',
    'from-emerald-600 to-emerald-400',
    'from-amber-600 to-amber-400',
    'from-rose-600 to-rose-400'
  ];

  const totalLeads = kpis.totalLeads || 1;
  const stageConversion = kpis.stageConversion || [];
  const weeklyTrend = kpis.weeklyTrend || [];
  const leadsBySource = kpis.leadsBySource || {};
  const cplBySource = kpis.cplBySource || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Funnel conversion stages (2 columns span) */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Embudo de Conversión Comercial
              </h3>
              <p className="text-xs text-slate-400">
                Flujo progresivo desde la generación de demanda hasta el cierre de contrato
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 rounded-full font-semibold">
              Tasa Global de Cierre: {kpis.closeRate || 0}%
            </span>
          </div>

          <div className="space-y-3">
            {stageConversion.map((st, idx) => {
              const barWidth = Math.max(8, (st.count / totalLeads) * 100);
              return (
                <div key={st.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">{st.label}</span>
                    <span className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {st.count} leads ({st.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-6 rounded-lg overflow-hidden p-0.5 border border-slate-800/80 flex items-center">
                    <div
                      className={`h-full bg-gradient-to-r ${colors[idx % colors.length]} rounded-md transition-all duration-700 flex items-center justify-end pr-2 text-[10px] font-bold text-white shadow-sm`}
                      style={{ width: `${barWidth}%` }}
                    >
                      {barWidth > 15 && `${st.percentage}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Trend mini summary */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Tendencia semanal de captación y cierres:</span>
          <div className="flex items-center gap-4 font-semibold">
            {weeklyTrend.map((t, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px]">{t.week}:</span>
                <span className="text-blue-400">{t.leads}L</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400">{t.sales}V</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Sources breakdown & CPL editor */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-400" />
                Fuentes & Costo por Lead (CPL)
              </h3>
              <p className="text-xs text-slate-400">
                Inversión y rendimiento por canal
              </p>
            </div>
            {!editingCpl ? (
              <button
                onClick={() => setEditingCpl(true)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                title="Editar costos por lead"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>CPL</span>
              </button>
            ) : (
              <button
                onClick={handleSaveCpl}
                disabled={savingCpl}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{savingCpl ? '...' : 'Guardar'}</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {Object.entries(leadsBySource).map(([source, countVal]) => {
              const count = Number(countVal) || 0;
              const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              const cpl = Number(cplData[source] !== undefined ? cplData[source] : (cplBySource[source] || 0));
              const totalSpent = cpl * count;

              return (
                <div
                  key={source}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span className="text-slate-200 truncate">{source}</span>
                      <span className="text-blue-400 font-mono">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {editingCpl ? (
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5">
                        <span className="text-slate-400 text-[10px]">S/</span>
                        <input
                          type="number"
                          step="0.5"
                          value={cpl}
                          onChange={e => setCplData({ ...cplData, [source]: Number(e.target.value) })}
                          className="w-12 bg-transparent text-white font-mono text-xs focus:outline-none text-right"
                        />
                      </div>
                    ) : (
                      <div className="font-mono">
                        <div className="text-emerald-400 font-bold">
                          CPL: S/ {cpl.toFixed(2)}
                        </div>
                        {totalSpent > 0 && (
                          <div className="text-[10px] text-slate-500">
                            Inv: S/ {totalSpent.toFixed(0)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>🎯 Canales orgánicos / referidos: CPL S/ 0.00</span>
          <span className="font-bold text-slate-300">Total fuentes: {Object.keys(leadsBySource).length}</span>
        </div>
      </div>
    </div>
  );
};
