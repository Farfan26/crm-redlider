/**
 * Sistema Comercial Red Líder - Aplicación Principal (CRM Código)
 * Modelo Ingresos Predecibles (Aaron Ross) • Integración Oficial WhatsApp Cloud API
 * Desarrollado para Óscar (Estrategia), Carlos (Operaciones), Dani (CRM) y el equipo comercial
 */
import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Lead, DashboardKPIs } from './types';
import { api } from './services/api';

// Components
import { Navbar } from './components/Navbar';
import { KPICards } from './components/Dashboard/KPICards';
import { FunnelChart } from './components/Dashboard/FunnelChart';
import { WeeklyReportModal } from './components/Dashboard/WeeklyReportModal';
import { KanbanBoard } from './components/Leads/KanbanBoard';
import { LeadsList } from './components/Leads/LeadsList';
import { LeadDetailModal } from './components/Leads/LeadDetailModal';
import { NewLeadModal } from './components/Leads/NewLeadModal';
import { ImportExportModal } from './components/Leads/ImportExportModal';
import { OverdueFollowUpsView } from './components/FollowUps/OverdueFollowUpsView';
import { ReactivationView } from './components/FollowUps/ReactivationView';
import { SequencesModal } from './components/FollowUps/SequencesModal';
import { EventsView } from './components/Events/EventsView';
import { ReferralsView } from './components/Referrals/ReferralsView';
import { MetaSettingsView } from './components/MetaConfig/MetaSettingsView';
import { DocumentationModal } from './components/Guide/DocumentationModal';
import { CalendarView } from './components/Calendar/CalendarView';
import { BotAssistantView } from './components/Bot/BotAssistantView';
import * as XLSX from 'xlsx';

import { 
  Plus, 
  FileText, 
  BookOpen, 
  Upload, 
  Download, 
  RefreshCw, 
  MessageCircle, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  TrendingUp,
  Building2,
  Briefcase,
  Code
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { selectedUnit, activeTab, setActiveTab } = useAuth();

  // Data states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeadsCount, setAllLeadsCount] = useState<number>(0);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingKpis, setLoadingKpis] = useState(false);

  // Selected lead for detail modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Modals state
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSequencesModal, setShowSequencesModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      // Pedimos al backend los leads filtrando por unidad
      const data = await api.getLeads({ unit: selectedUnit, search: searchQuery });
      setLeads(data);
      if (selectedUnit === 'all' && !searchQuery) {
        setAllLeadsCount(data.length);
      }
    } catch (err: any) {
      console.error('Error cargando prospectos:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedUnit, searchQuery]);

  const fetchKPIs = useCallback(async () => {
    setLoadingKpis(true);
    try {
      const data = await api.getKPIs({ unit: selectedUnit });
      setKpis(data);
    } catch (err: any) {
      console.error('Error cargando KPIs:', err);
    } finally {
      setLoadingKpis(false);
    }
  }, [selectedUnit]);

  useEffect(() => {
    fetchLeads();
    fetchKPIs();
  }, [fetchLeads, fetchKPIs]);

  // Si abrimos la ficha desde ID (ej. en eventos o referidos)
  const handleSelectLeadById = async (leadId: string) => {
    const found = leads.find(l => l.id === leadId);
    if (found) {
      setSelectedLead(found);
    } else {
      try {
        const all = await api.getLeads({ unit: 'all' });
        const f = all.find(l => l.id === leadId);
        if (f) setSelectedLead(f);
      } catch (e) {}
    }
  };

  const handleExportCsv = async () => {
    try {
      const csv = await api.exportLeadsCsv(selectedUnit);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Base_Comercial_${selectedUnit === 'all' ? 'RedLider_General' : selectedUnit}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (e: any) {
      alert('Error exportando CSV: ' + e.message);
    }
  };

  const handleExportExcel = async () => {
    try {
      const allLeads = await api.getLeads({ unit: selectedUnit === 'all' ? undefined : selectedUnit });
      const rows = allLeads.map(l => ({
        'ID Prospecto': l.id,
        'Nombre Completo': l.name,
        'Teléfono / WhatsApp': l.phone,
        'Email': l.email || 'N/A',
        'Unidad de Negocio': l.unit === 'el_zapotal' ? 'El Zapotal (Terrenos)' : (l.unit === 'red_lider' ? 'Red Líder (Consultoría)' : 'Software & IA'),
        'Etapa Embudo': l.stage,
        'Fuente Comercial': l.source,
        'Temperatura': l.temperature.toUpperCase(),
        'Asignado A': l.assignedTo,
        'Valor Negocio (USD/PEN)': l.dealValue || 0,
        'Próxima Acción': l.nextAction || 'Sin acción asignada',
        'Fecha Registro': l.createdAt || new Date().toISOString().split('T')[0]
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Base_Comercial_Leads');
      XLSX.writeFile(workbook, `CRM_RedLider_Leads_${selectedUnit}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (e: any) {
      alert('Error exportando archivo Excel (.xlsx): ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar with role/unit switcher and search */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={fetchLeads}
        onOpenNewLead={() => setShowNewLeadModal(true)}
        onOpenWeeklyReport={() => setShowReportModal(true)}
      />

      {/* Quick operational alert ticker under navbar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-b border-slate-800/80 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold text-[10px] uppercase">
            <Sparkles className="w-3 h-3" />
            Meta Cloud API v20.0
          </span>
          <span className="hidden sm:inline font-medium">
            🔥 Modelo: <strong className="text-white">Ingresos Predecibles (Aaron Ross)</strong> • Sistema activo para Óscar, Carlos, Dani & Vendedores
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDocModal(true)}
            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 underline transition-colors text-[11px]"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Manual de Buenas Prácticas & Roles</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => setShowReportModal(true)}
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline transition-colors text-[11px]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reporte Semanal WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 animate-spin flex items-center justify-center shadow-lg shadow-blue-500/20">
              <RefreshCw className="w-6 h-6 text-white animate-spin" />
            </div>
            <p className="text-sm font-bold text-slate-400 animate-pulse">
              Sincronizando embudos y métricas comerciales de Red Líder...
            </p>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Dashboard Header CTA banner */}
                <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/40 p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        PANEL DE DIRECCIÓN COMERCIAL
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        • {selectedUnit === 'red_lider' ? 'Red Líder (Consultoría)' : (selectedUnit === 'el_zapotal' ? 'El Zapotal (Inmobiliaria)' : (selectedUnit === 'software' ? 'Software & Tech' : 'Vista Todas las Unidades'))}
                      </span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                      Visión Estratégica & Rendimiento Comercial
                    </h1>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Monitoreo de embudos, conversión operativa, costo por lead (CPL) e identificación inmediata de cuellos de botella en la calificación y cierre.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-slate-700 shadow-md"
                    >
                      <Upload className="w-4 h-4 text-blue-400" />
                      <span>Importar Excel/CSV</span>
                    </button>

                    <button
                      onClick={handleExportExcel}
                      className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
                      title="Descargar base comercial completa en formato Excel .xlsx"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>📥 Descargar Excel (.xlsx)</span>
                    </button>

                    <button
                      onClick={() => setShowReportModal(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Generar Reporte para Directorio</span>
                    </button>
                  </div>
                </div>

                {/* KPI Cards */}
                <KPICards
                  kpis={kpis}
                  loading={loadingKpis}
                  onOpenReport={() => setShowReportModal(true)}
                  onFilterOverdue={() => setActiveTab('overdue')}
                />

                {/* Funnel conversion stage chart + CPL Editor */}
                <FunnelChart
                  kpis={kpis}
                  onRefresh={fetchKPIs}
                />
              </div>
            )}

            {/* 2. KANBAN BOARD VIEW */}
            {activeTab === 'kanban' && (
              <div className="animate-in fade-in duration-200">
                <KanbanBoard
                  leads={leads}
                  onSelectLead={setSelectedLead}
                  onRefresh={fetchLeads}
                  onNewLead={() => setShowNewLeadModal(true)}
                />
              </div>
            )}

            {/* 3. LEADS TABULAR LIST VIEW */}
            {activeTab === 'list' && (
              <div className="animate-in fade-in duration-200">
                <LeadsList
                  leads={leads}
                  onSelectLead={setSelectedLead}
                  onNewLead={() => setShowNewLeadModal(true)}
                  onOpenImport={() => setShowImportModal(true)}
                  onExportCsv={handleExportCsv}
                  onExportExcel={handleExportExcel}
                />
              </div>
            )}

            {/* 4. OVERDUE FOLLOW-UPS VIEW */}
            {(activeTab === 'followups' || activeTab === 'overdue') && (
              <div className="animate-in fade-in duration-200">
                <OverdueFollowUpsView
                  leads={leads}
                  onSelectLead={setSelectedLead}
                  onOpenSequences={() => setShowSequencesModal(true)}
                  onOpenReactivation={() => {}}
                />
              </div>
            )}

            {/* 5. REACTIVATION OF DORMANT LEADS VIEW */}
            {activeTab === 'reactivation' && (
              <div className="animate-in fade-in duration-200">
                <ReactivationView
                  leads={leads}
                  onSelectLead={setSelectedLead}
                  onRefresh={fetchLeads}
                />
              </div>
            )}

            {/* 6. EVENTS & WEBINARS VIEW */}
            {activeTab === 'events' && (
              <div className="animate-in fade-in duration-200">
                <EventsView
                  onSelectLeadById={handleSelectLeadById}
                  onRefreshGlobal={fetchLeads}
                />
              </div>
            )}

            {/* 7. REFERRALS & FIDELIZATION VIEW */}
            {activeTab === 'referrals' && (
              <div className="animate-in fade-in duration-200">
                <ReferralsView
                  onSelectLeadById={handleSelectLeadById}
                  onRefreshGlobal={fetchLeads}
                />
              </div>
            )}

            {/* 8. CALENDAR VIEW */}
            {activeTab === 'calendar' && (
              <div className="animate-in fade-in duration-200">
                <CalendarView />
              </div>
            )}

            {/* 9. BOT ASSISTANT & AUTO-RESPONDER VIEW */}
            {activeTab === 'bot' && (
              <div className="animate-in fade-in duration-200">
                <BotAssistantView />
              </div>
            )}

            {/* 10. META FOR DEVELOPERS SETTINGS & SIMULATION VIEW */}
            {activeTab === 'meta' && (
              <div className="animate-in fade-in duration-200">
                <MetaSettingsView />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-slate-400">Sistema Comercial Red Líder v2026.1 (Código Nativo)</span>
          <span>•</span>
          <span>Arquitectura: Node.js Express + React 19 + TypeScript + SQLite Engine</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <button onClick={() => setShowDocModal(true)} className="hover:text-white underline">Manual de Uso</button>
          <span>•</span>
          <button onClick={() => setShowReportModal(true)} className="hover:text-white underline">Reporte Directorio</button>
          <span>•</span>
          <button onClick={() => setShowSequencesModal(true)} className="hover:text-white underline">Secuencias WA</button>
        </div>
      </footer>

      {/* --- MODALS --- */}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onRefresh={fetchLeads}
        />
      )}

      {/* New Lead Modal */}
      <NewLeadModal
        isOpen={showNewLeadModal}
        onClose={() => setShowNewLeadModal(false)}
        onSuccess={(newLead) => {
          setLeads([newLead, ...leads]);
          setSelectedLead(newLead);
        }}
      />

      {/* Import / Export Modal */}
      <ImportExportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onRefresh={fetchLeads}
        allLeadsCount={allLeadsCount || leads.length}
      />

      {/* Weekly Report Modal */}
      <WeeklyReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      {/* Automated Sequences Modal */}
      <SequencesModal
        isOpen={showSequencesModal}
        onClose={() => setShowSequencesModal(false)}
      />

      {/* Documentation Guide Modal */}
      <DocumentationModal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
