/**
 * Modal del Reporte Comercial Semanal Automático
 * Listo para copiar y enviar por WhatsApp/Correo al Directorio (Óscar)
 */
import React, { useState, useEffect } from 'react';
import { WeeklyReportData, BusinessUnit } from '../../types';
import { api } from '../../services/api';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  FileText, 
  RefreshCw, 
  MessageCircle, 
  TrendingUp, 
  Flame,
  AlertTriangle
} from 'lucide-react';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [unitFilter, setUnitFilter] = useState<string>('all');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await api.getWeeklyReport(unitFilter);
      setReport(data);
    } catch (e) {
      alert('Error generando el reporte semanal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen, unitFilter]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenWhatsApp = () => {
    if (!report) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(report.formattedText)}`;
    window.open(url, '_blank');
  };

  const handleDownloadText = () => {
    if (!report) return;
    const blob = new Blob([report.formattedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Comercial_RedLider_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Reporte Comercial Semanal Automático
              </h2>
              <p className="text-xs text-slate-400">
                Modelo Ingresos Predecibles • Listo para compartir en WhatsApp o Correo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={unitFilter}
              onChange={e => setUnitFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las Unidades</option>
              <option value="red_lider">Red Líder (Consultoría & Cursos)</option>
              <option value="el_zapotal">El Zapotal (Inmobiliaria)</option>
              <option value="software">Software & Proyectos</option>
            </select>

            <button
              onClick={fetchReport}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
              title="Regenerar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-semibold">Consolidando métricas y generando resumen de la semana...</p>
            </div>
          ) : report ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Visual summary cards */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Métricas Clave de la Semana
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block font-medium">Prospectos Nuevos</span>
                    <span className="text-2xl font-black text-blue-400">{report.newLeadsCount}</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block font-medium">Leads Contactados</span>
                    <span className="text-2xl font-black text-emerald-400">{report.contactedCount}</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block font-medium">Citas / Demos / Visitas</span>
                    <span className="text-2xl font-black text-purple-400">{report.meetingsCount + report.visitsCount}</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block font-medium">Propuestas / Separac.</span>
                    <span className="text-2xl font-black text-amber-400">{report.proposalsCount + report.separationsCount}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-300 uppercase">Cierres & Contratos Totales</span>
                    <div className="text-3xl font-black text-white">{report.closuresCount} negocios</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 uppercase">Volumen Negociado</span>
                    <div className="text-2xl font-black text-emerald-400">S/ {report.totalRevenue.toLocaleString('es-PE')}</div>
                  </div>
                </div>

                {/* Overdue alert in report */}
                {report.overdueCount > 0 && (
                  <div className="bg-amber-950/40 border border-amber-500/40 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-amber-300 font-semibold">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>⚠️ Hay {report.overdueCount} seguimientos vencidos pendientes de acción por el equipo.</span>
                  </div>
                )}

                {/* Hot opportunities */}
                {report.hotOpportunities.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Top Oportunidades Calientes
                    </h4>
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {report.hotOpportunities.map((hot, idx) => (
                        <div key={idx} className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl text-xs flex items-center justify-between">
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate">{hot.name}</span>
                            <span className="text-[10px] text-slate-400 block">{hot.unit} • Etapa: {hot.stage}</span>
                          </div>
                          <div className="text-right font-mono shrink-0">
                            <span className="text-emerald-400 font-bold block">S/ {(hot.dealValue || 0).toLocaleString('es-PE')}</span>
                            <span className="text-[10px] text-blue-400">{hot.phone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Formatted text preview for WhatsApp */}
              <div className="flex flex-col h-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    Texto Formateado para WhatsApp / Correo
                  </span>
                  <span className="text-[11px] text-slate-400">Listo para pegar</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex-1 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[380px] select-all">
                  {report.formattedText}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>💡 Sugerencia: Envía este reporte todos los lunes a las 9:00 AM al directorio.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadText}
              disabled={!report}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .txt</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              disabled={!report}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Abrir WhatsApp con Reporte</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={!report}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span className="text-emerald-200">¡Copiado al portapapeles!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
