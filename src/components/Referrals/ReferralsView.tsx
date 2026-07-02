/**
 * Módulo de Referidos & Fidelización
 * Registro de referidor, referido, estado comercial y recompensas
 */
import React, { useState, useEffect } from 'react';
import { ReferralItem, BusinessUnit } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Gift, 
  Plus, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Building2, 
  Briefcase, 
  Code, 
  ArrowRight,
  ExternalLink,
  Award
} from 'lucide-react';

interface ReferralsViewProps {
  onSelectLeadById: (leadId: string) => void;
  onRefreshGlobal: () => void;
}

export const ReferralsView: React.FC<ReferralsViewProps> = ({ onSelectLeadById, onRefreshGlobal }) => {
  const { selectedUnit } = useAuth();
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(false);

  // New referral form
  const [showNew, setShowNew] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [referrerPhone, setReferrerPhone] = useState('');
  const [referredName, setReferredName] = useState('');
  const [referredPhone, setReferredPhone] = useState('');
  const [unit, setUnit] = useState<BusinessUnit>(selectedUnit === 'all' ? 'el_zapotal' : selectedUnit);
  const [rewardAmount, setRewardAmount] = useState<number>(unit === 'el_zapotal' ? 500 : 200);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await api.getReferrals(selectedUnit);
      setReferrals(res);
    } catch (e) {
      alert('Error cargando referidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [selectedUnit]);

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referrerName || !referredName || !referredPhone) return;

    try {
      const newRef = await api.createReferral({
        referrerName,
        referrerPhone: referrerPhone.replace(/\D/g, ''),
        referredName,
        referredPhone: referredPhone.replace(/\D/g, ''),
        unit,
        rewardAmount: Number(rewardAmount) || 0
      });
      setReferrals([newRef, ...referrals]);
      setShowNew(false);
      setReferrerName('');
      setReferrerPhone('');
      setReferredName('');
      setReferredPhone('');
      onRefreshGlobal();
      alert(`🎉 ¡Excelente! Se registró el referido "${referredName}". Se creó automáticamente en el embudo comercial como prospecto.`);
    } catch (e: any) {
      alert('Error registrando referido: ' + e.message);
    }
  };

  const handleUpdateStatus = async (id: string, status: any, rewardStatus: any) => {
    try {
      const updated = await api.updateReferralStatus(id, status, rewardStatus);
      setReferrals(referrals.map(r => r.id === id ? updated : r));
    } catch (e: any) {
      alert('Error actualizando referido: ' + e.message);
    }
  };

  const getUnitBadge = (u: BusinessUnit) => {
    if (u === 'red_lider') return <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Briefcase className="w-3 h-3" />Red Líder</span>;
    if (u === 'el_zapotal') return <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Building2 className="w-3 h-3" />Zapotal</span>;
    return <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Code className="w-3 h-3" />Software</span>;
  };

  const getStatusBadge = (st: string) => {
    if (st === 'cerrado') return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-extrabold text-[10px]">🏆 Negocio Cerrado</span>;
    if (st === 'calificado') return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold text-[10px]">👍 Calificado / En Proceso</span>;
    return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold text-[10px]">⏳ Pendiente</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/80 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-400" />
            <span>Módulo de Referidos & Fidelización de Vecinos / Clientes</span>
            <span className="text-xs px-2.5 py-0.5 bg-teal-950 border border-teal-800 text-teal-300 rounded-full">
              {referrals.length} referidos
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cada referido registrado se convierte automáticamente en una tarjeta del embudo Kanban con fuente "Referido"
          </p>
        </div>

        <button
          onClick={() => setShowNew(!showNew)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>{showNew ? 'Cancelar' : '+ Registrar Nuevo Referido'}</span>
        </button>
      </div>

      {/* New Referral Form */}
      {showNew && (
        <form onSubmit={handleCreateReferral} className="bg-slate-900 p-5 rounded-2xl border-2 border-emerald-500/40 space-y-4 animate-in fade-in duration-150 text-xs">
          <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Formulario de Recomendación (Crea Referido + Tarjeta en CRM)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-slate-400 font-bold block mb-1">Nombre del Referidor (Cliente) *</label>
              <input
                type="text"
                required
                placeholder="Ej. Ing. Carlos Martínez"
                value={referrerName}
                onChange={e => setReferrerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Teléfono Referidor</label>
              <input
                type="text"
                placeholder="Ej. 51911112222"
                value={referrerPhone}
                onChange={e => setReferrerPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Nombre del REFERIDO *</label>
              <input
                type="text"
                required
                placeholder="Ej. Sra. Elena Gómez"
                value={referredName}
                onChange={e => setReferredName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-extrabold text-emerald-300"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Teléfono REFERIDO *</label>
              <input
                type="text"
                required
                placeholder="Ej. 51933334444"
                value={referredPhone}
                onChange={e => setReferredPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Unidad & Recompensa (S/) *</label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={unit}
                  onChange={e => {
                    const u = e.target.value as BusinessUnit;
                    setUnit(u);
                    setRewardAmount(u === 'el_zapotal' ? 500 : 200);
                  }}
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold uppercase"
                >
                  <option value="el_zapotal">Zapotal</option>
                  <option value="red_lider">Red Líder</option>
                  <option value="software">Software</option>
                </select>
                <input
                  type="number"
                  value={rewardAmount}
                  onChange={e => setRewardAmount(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold text-center"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              <span>Registrar Referido en el CRM</span>
            </button>
          </div>
        </form>
      )}

      {/* Referrals table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Historial y Gestión de Referidos ({referrals.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Puedes cambiar el estado del premio cuando el referido cierre contrato en El Zapotal o Red Líder
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Cargando referidos...</div>
        ) : referrals.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-medium">
            No se han registrado referidos en esta unidad. ¡Motiva a tus clientes actuales!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {referrals.map(ref => (
              <div key={ref.id} className="p-4 hover:bg-slate-800/60 transition-colors flex flex-wrap items-center justify-between gap-4 text-xs">
                {/* Referrer (Who recommended) */}
                <div className="min-w-[200px]">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Quién Recomienda (Referidor):</span>
                  <span className="font-extrabold text-white text-sm block mt-0.5">{ref.referrerName}</span>
                  <span className="font-mono text-slate-400 text-[11px]">📱 {ref.referrerPhone || 'Sin teléfono'}</span>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block" />

                {/* Referred (The lead) */}
                <div className="min-w-[220px]">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Cliente Referido (Prospecto):</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-extrabold text-emerald-300 text-sm">{ref.referredName}</span>
                    {getUnitBadge(ref.unit)}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] mt-0.5">
                    <span>📱 {ref.referredPhone}</span>
                    {ref.leadId && (
                      <button
                        onClick={() => onSelectLeadById(ref.leadId!)}
                        className="text-indigo-400 hover:text-indigo-300 underline font-sans font-bold flex items-center gap-0.5"
                      >
                        <span>Ver en CRM</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status & Reward */}
                <div className="min-w-[180px] space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Estado Comercial:</span>
                  <div>{getStatusBadge(ref.status)}</div>
                  <div className="text-[11px] font-mono font-bold pt-1">
                    <span className="text-slate-400">Premio: </span>
                    <span className="text-amber-400">S/ {ref.rewardAmount.toLocaleString('es-PE')} </span>
                    <span className={`px-1.5 py-0.5 rounded uppercase text-[9px] font-extrabold ${
                      ref.rewardStatus === 'pagado' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      ({ref.rewardStatus})
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={ref.status}
                    onChange={e => handleUpdateStatus(ref.id, e.target.value as any, ref.rewardStatus)}
                    className="bg-slate-950 text-white font-bold px-2 py-1.5 rounded-xl border border-slate-700 text-xs uppercase"
                  >
                    <option value="pendiente">⏳ Pendiente</option>
                    <option value="calificado">👍 Calificado</option>
                    <option value="cerrado">🏆 Cerrado</option>
                  </select>

                  <select
                    value={ref.rewardStatus}
                    onChange={e => handleUpdateStatus(ref.id, ref.status, e.target.value as any)}
                    className="bg-slate-950 text-amber-300 font-bold px-2 py-1.5 rounded-xl border border-slate-700 text-xs uppercase"
                  >
                    <option value="pendiente">🎁 Premio Pendiente</option>
                    <option value="pagado">✅ Premio Pagado</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
