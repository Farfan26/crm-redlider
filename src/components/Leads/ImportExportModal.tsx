/**
 * Modal de Importación Masiva (CSV / Excel) & Exportación de Prospectos
 */
import React, { useState } from 'react';
import Papa from 'papaparse';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Upload, Download, FileSpreadsheet, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  allLeadsCount: number;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
  allLeadsCount
}) => {
  const { selectedUnit, currentUser, usersList } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [defaultUnit, setDefaultUnit] = useState(selectedUnit === 'all' ? 'red_lider' : selectedUnit);
  const [defaultAssignee, setDefaultAssignee] = useState(currentUser.id || 'carlos');
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [importing, setImporting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ importedCount: number; duplicatesSkipped: number } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResultMsg(null);
      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data || []);
        }
      });
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      alert('Por favor selecciona un archivo CSV con filas válidas');
      return;
    }
    setImporting(true);
    try {
      const res = await api.importLeads(parsedData, defaultUnit, defaultAssignee, allowDuplicates);
      setResultMsg({
        importedCount: res.importedCount,
        duplicatesSkipped: res.duplicatesSkipped
      });
      onRefresh();
    } catch (e: any) {
      alert('Error importando datos: ' + e.message);
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadSample = () => {
    const sampleCsv = `Nombre completo,Empresa,Teléfono,Correo,Unidad de negocio,Fuente,Etapa,Temperatura,Responsable,Próxima acción,Fecha de acción,Valor
Juan Pérez,Inversiones Sur SAC,51911223344,jperez@sur.pe,el_zapotal,Facebook Ads,visita,caliente,vendedor,Visita al terreno este sábado,2026-07-05,45000
Dra. Ana Torres,Clinica Torres,51922334455,atorres@clinica.pe,red_lider,LinkedIn,diagnostico,tibio,oscar,Reunión Zoom de diagnóstico comercial,2026-07-06,15000`;
    
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_importacion_crm_redlider.csv';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center text-white shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Importar / Migrar Bases de Datos</h2>
              <p className="text-xs text-slate-400">Migración desde Excel, CSV y sistemas anteriores</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Step 1: Download sample */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white mb-0.5">1. Descargar plantilla de ejemplo (CSV)</h3>
              <p className="text-slate-400 text-[11px]">Asegúrate de que tus columnas coincidan con los nombres estándar</p>
            </div>
            <button
              onClick={handleDownloadSample}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Plantilla CSV</span>
            </button>
          </div>

          {/* Step 2: Upload CSV */}
          <div className="space-y-3">
            <h3 className="font-bold text-white">2. Seleccionar archivo CSV de tu computadora:</h3>
            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-slate-950/60">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-blue-400" />
                <span className="font-bold text-slate-200 text-sm">
                  {file ? `Archivo: ${file.name}` : 'Haz clic para seleccionar tu archivo CSV'}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {parsedData.length > 0 ? `✅ Se encontraron ${parsedData.length} registros listos para procesar` : 'Soporta archivos generados en Excel o Google Sheets guardados como CSV'}
                </span>
              </label>
            </div>
          </div>

          {/* Step 3: Default options & duplicate setting */}
          {parsedData.length > 0 && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 animate-in fade-in duration-150">
              <h3 className="font-bold text-white">3. Configuración y asignación por defecto:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Unidad de Negocio por Defecto</label>
                  <select
                    value={defaultUnit}
                    onChange={e => setDefaultUnit(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="red_lider">Red Líder (Consultoría & Cursos)</option>
                    <option value="el_zapotal">El Zapotal (Inmobiliaria)</option>
                    <option value="software">Software & Proyectos</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Responsable por Defecto</label>
                  <select
                    value={defaultAssignee}
                    onChange={e => setDefaultAssignee(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold uppercase"
                  >
                    {usersList.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <input
                  type="checkbox"
                  id="allow-dup"
                  checked={allowDuplicates}
                  onChange={e => setAllowDuplicates(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="allow-dup" className="text-slate-300 font-semibold cursor-pointer">
                  Permitir duplicados (Si no está marcado, omitiremos teléfonos o correos que ya existan en el CRM)
                </label>
              </div>
            </div>
          )}

          {/* Result message */}
          {resultMsg && (
            <div className="bg-emerald-950/60 border border-emerald-500/60 p-4 rounded-2xl text-emerald-200 space-y-1 font-semibold animate-in fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                <Check className="w-5 h-5" />
                <span>¡Importación finalizada con éxito!</span>
              </div>
              <p>• {resultMsg.importedCount} nuevos prospectos importados al CRM.</p>
              <p>• {resultMsg.duplicatesSkipped} duplicados omitidos para mantener limpia la base.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">
            Base total en sistema: {allLeadsCount} registros
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold"
            >
              Cerrar
            </button>
            <button
              onClick={handleImport}
              disabled={importing || parsedData.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{importing ? 'Importando...' : `Importar ${parsedData.length} registros`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
