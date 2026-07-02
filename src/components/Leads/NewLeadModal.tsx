/**
 * Modal de Registro de Nuevo Prospecto (Con Reglas Comerciales Obligatorias & Detección de Duplicados)
 */
import React, { useState } from 'react';
import { Lead, BusinessUnit, FunnelStage, LeadSource, LeadTemperature } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Plus, AlertCircle, Phone, Mail, Building2, Briefcase, Code, Clock, CheckCircle2 } from 'lucide-react';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newLead: Lead) => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { selectedUnit, currentUser, usersList } = useAuth();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [unit, setUnit] = useState<BusinessUnit>(selectedUnit === 'all' ? 'red_lider' : selectedUnit);
  const [source, setSource] = useState<LeadSource>('Facebook Ads');
  const [stage, setStage] = useState<FunnelStage>('demanda');
  const [temperature, setTemperature] = useState<LeadTemperature>('caliente');
  const [assignedTo, setAssignedTo] = useState<string>(currentUser.id || 'agendadora');
  const [nextAction, setNextAction] = useState('Llamada de calificación inicial en menos de 15 minutos');
  const [nextActionDate, setNextActionDate] = useState(new Date().toISOString().split('T')[0]);
  const [dealValue, setDealValue] = useState<number>(unit === 'el_zapotal' ? 45000 : (unit === 'software' ? 18000 : 12000));
  const [tags, setTags] = useState('');

  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent, ignoreDuplicate = false) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Nombre y teléfono son obligatorios');
      return;
    }
    if (!nextAction || !nextActionDate) {
      alert('⚠️ Regla comercial obligatoria: Ningún prospecto puede quedar registrado sin Próxima Acción y Fecha de Acción.');
      return;
    }

    setLoading(true);
    try {
      const newLead = await api.createLead({
        name,
        company,
        phone: phone.replace(/\D/g, ''),
        email,
        unit,
        source,
        stage,
        temperature,
        assignedTo: assignedTo as any,
        nextAction,
        nextActionDate,
        dealValue: Number(dealValue) || 0,
        tags: tags ? tags.split(',').map(s => s.trim()) : [source],
        ignoreDuplicate
      });

      setDuplicateWarning(false);
      onSuccess(newLead);
      onClose();
    } catch (err: any) {
      if (err.isDuplicate && !ignoreDuplicate) {
        setDuplicateWarning(true);
      } else {
        alert('Error creando prospecto: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Registrar Nuevo Prospecto (Lead)</h2>
              <p className="text-xs text-slate-400">Cumplimiento de modelo Ingresos Predecibles</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate warning banner */}
        {duplicateWarning && (
          <div className="bg-amber-600 text-slate-950 p-4 border-b border-amber-500 flex items-center justify-between text-xs font-bold animate-bounce">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>⚠️ ATENCIÓN: El número de teléfono o correo ya existe en la base de datos. ¿Deseas crearlo de todos modos?</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => handleSubmit(e, true)}
                className="px-3 py-1 bg-slate-950 text-white rounded-lg hover:bg-slate-900"
              >
                Crear Duplicado
              </button>
              <button
                onClick={() => setDuplicateWarning(false)}
                className="px-3 py-1 bg-amber-700 text-white rounded-lg"
              >
                Revisar
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px]">Nombre Completo / Contacto *</label>
              <input
                type="text"
                required
                placeholder="Ej. Jorge Luis Mendoza"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px]">Empresa / Organización</label>
              <input
                type="text"
                placeholder="Ej. Constructora Horizonte SAC"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px]">Teléfono (WhatsApp) *</label>
              <input
                type="text"
                required
                placeholder="Ej. 51987654321"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px]">Correo Electrónico</label>
              <input
                type="email"
                placeholder="Ej. jmendoza@empresa.pe"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px]">Unidad de Negocio *</label>
              <select
                value={unit}
                onChange={e => {
                  const u = e.target.value as BusinessUnit;
                  setUnit(u);
                  setDealValue(u === 'el_zapotal' ? 45000 : (u === 'software' ? 18000 : 12000));
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold uppercase"
              >
                <option value="red_lider">💼 Red Líder (Consultoría & Cursos)</option>
                <option value="el_zapotal">🌿 El Zapotal (Lotes Inmobiliarios)</option>
                <option value="software">⚡ Software & Proyectos</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px]">Fuente de Captación *</label>
              <select
                value={source}
                onChange={e => setSource(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-semibold"
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
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px]">Etapa Inicial *</label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold uppercase"
              >
                <option value="demanda">1. Generación de Demanda</option>
                <option value="calificacion">2. Calificación</option>
                <option value="diagnostico">3. Diagnóstico / Visita / Demo</option>
                <option value="propuesta">4. Propuesta / Separación</option>
                <option value="seguimiento">5. Seguimiento / Negociación</option>
                <option value="cierre">6. Cierre / Contrato</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px]">Temperatura *</label>
              <select
                value={temperature}
                onChange={e => setTemperature(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold"
              >
                <option value="caliente">🔥 Caliente</option>
                <option value="tibio">🟡 Tibio</option>
                <option value="frio">❄️ Frío</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px]">Responsable Asignado *</label>
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold uppercase"
              >
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px]">Valor Estimado (S/)</label>
              <input
                type="number"
                value={dealValue}
                onChange={e => setDealValue(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono font-bold"
              />
            </div>
          </div>

          {/* Mandatory Next Action Box */}
          <div className="bg-indigo-950/40 border-2 border-indigo-500/60 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-indigo-300 uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              Regla Comercial Obligatoria: Próxima Acción & Fecha *
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">¿CÓMO SERÁ EL SIGUIENTE PASO?</label>
                <input
                  type="text"
                  required
                  value={nextAction}
                  onChange={e => setNextAction(e.target.value)}
                  placeholder="Ej. Llamada de calificación inicial por Zoom..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">FECHA PROGRAMADA</label>
                <input
                  type="date"
                  required
                  value={nextActionDate}
                  onChange={e => setNextActionDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold uppercase text-[10px]">Etiquetas (Separadas por coma)</label>
            <input
              type="text"
              placeholder="Ej. Lote 200m2, Inversor, Trujillo, B2B"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Creando...' : 'Registrar Prospecto en el CRM'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
