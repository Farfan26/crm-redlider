/**
 * Barra de Navegación Principal & Selección de Unidad de Negocio / Rol
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  Building2, 
  Code, 
  LayoutGrid, 
  UserCheck, 
  Bell, 
  Search, 
  MessageSquareWarning, 
  ShieldCheck, 
  RefreshCw,
  HelpCircle,
  Calendar as CalendarIcon,
  Bot as BotIcon
} from 'lucide-react';
import { BusinessUnit, UserRole } from '../types';

interface NavbarProps {
  overdueCount?: number;
  unreadCount?: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  onOpenNewLead: () => void;
  onOpenWeeklyReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  overdueCount = 0,
  unreadCount = 0,
  searchQuery,
  onSearchChange,
  onRefresh
}) => {
  const { currentUser, setCurrentRole, selectedUnit, setSelectedUnit, usersList, activeTab, setActiveTab } = useAuth();

  const unitButtons: { id: BusinessUnit | 'all'; label: string; icon: React.ReactNode; bgClass: string; activeBorder: string }[] = [
    { 
      id: 'all', 
      label: 'Todas las Unidades', 
      icon: <LayoutGrid className="w-4 h-4" />, 
      bgClass: 'hover:bg-slate-800 text-slate-300', 
      activeBorder: 'border-slate-400 bg-slate-800 text-white shadow-sm' 
    },
    { 
      id: 'red_lider', 
      label: 'Red Líder', 
      icon: <Briefcase className="w-4 h-4 text-blue-400" />, 
      bgClass: 'hover:bg-blue-950/60 text-blue-300', 
      activeBorder: 'border-blue-500 bg-blue-900/60 text-white shadow-blue-900/30 shadow-md' 
    },
    { 
      id: 'el_zapotal', 
      label: 'El Zapotal', 
      icon: <Building2 className="w-4 h-4 text-emerald-400" />, 
      bgClass: 'hover:bg-emerald-950/60 text-emerald-300', 
      activeBorder: 'border-emerald-500 bg-emerald-900/60 text-white shadow-emerald-900/30 shadow-md' 
    },
    { 
      id: 'software', 
      label: 'Software / Proyectos', 
      icon: <Code className="w-4 h-4 text-purple-400" />, 
      bgClass: 'hover:bg-purple-950/60 text-purple-300', 
      activeBorder: 'border-purple-500 bg-purple-900/60 text-white shadow-purple-900/30 shadow-md' 
    }
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard BI', badge: null },
    { id: 'kanban', label: 'Embudo Kanban', badge: null },
    { id: 'list', label: 'Prospectos (Leads)', badge: unreadCount > 0 ? { count: unreadCount, color: 'bg-red-500 animate-pulse' } : null },
    { id: 'followups', label: 'Seguimientos', badge: overdueCount > 0 ? { count: overdueCount, color: 'bg-amber-500' } : null },
    { id: 'calendar', label: '📅 Calendario Citas', badge: null },
    { id: 'bot', label: '🤖 Bot IA / WA', badge: { text: 'Automático', color: 'bg-blue-600' } },
    { id: 'events', label: 'Eventos & Webinars', badge: null },
    { id: 'referrals', label: 'Referidos VIP', badge: null },
    { id: 'meta', label: 'WhatsApp & Webhooks', badge: { text: 'API Meta', color: 'bg-emerald-600' } },
    { id: 'guide', label: 'Guía y Manual', badge: null }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Top tier: Logo, Units selector, Search and User Role switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/30 border border-white/20">
            RL
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Sistema Comercial Red Líder
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Ingresos Predecibles • CRM & WhatsApp Cloud API
            </p>
          </div>
        </div>

        {/* Business Units Filter */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
          {unitButtons.map(btn => (
            <button
              key={btn.id}
              onClick={() => setSelectedUnit(btn.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-transparent ${
                selectedUnit === btn.id ? btn.activeBorder : btn.bgClass
              }`}
              title={`Filtrar por ${btn.label}`}
            >
              {btn.icon}
              <span className="hidden md:inline">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Right tools: Search, Refresh, Role Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar prospecto, tel, empresa..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-60 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Refrescar datos del CRM"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* User Role Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
            <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold leading-tight">Rol activo:</span>
              <select
                value={currentUser.id}
                onChange={e => setCurrentRole(e.target.value as UserRole)}
                className="bg-transparent font-bold text-white focus:outline-none cursor-pointer pr-1"
              >
                {usersList.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom tier: Navigation tabs */}
      <div className="bg-slate-950/60 border-t border-slate-800/60 px-4 sm:px-6">
        <nav className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1.5 no-scrollbar">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {item.id === 'followups' && overdueCount > 0 && (
                  <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                )}
                {item.id === 'calendar' && (
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                )}
                {item.id === 'bot' && (
                  <BotIcon className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                )}
                {item.id === 'list' && unreadCount > 0 && (
                  <MessageSquareWarning className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                )}
                {item.id === 'meta' && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {item.id === 'guide' && (
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>{item.label}</span>

                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full ${item.badge.color}`}
                  >
                    {(item.badge as any).count || (item.badge as any).text}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
