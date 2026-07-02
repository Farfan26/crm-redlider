/**
 * Módulo de Calendario Comercial & Citas (El Zapotal Visitas, Zoom Red Líder, Demos Software)
 * Para Dani, Óscar, Carlos y el equipo comercial.
 */
import React, { useState } from 'react';
import { CalendarEvent, BusinessUnit } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MapPin, 
  Video, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Filter,
  Sparkles,
  Building2,
  Briefcase,
  Code
} from 'lucide-react';

// Citas iniciales de demostración
const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-101',
    title: 'Visita guiada Lote 14 - Familia Mendoza',
    date: new Date().toISOString().split('T')[0], // Hoy
    time: '10:30 AM',
    type: 'visita_zapotal',
    unit: 'el_zapotal',
    leadName: 'Roberto Mendoza',
    assignedTo: 'Esteban / Carlos',
    notes: 'Confirmaron que van en camioneta propia desde Tarapoto. Interesados en Lote 14 de 1,000m².',
    status: 'confirmado'
  },
  {
    id: 'evt-102',
    title: 'Sesión Diagnóstico Zoom - Consultoría Comercial',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
    time: '04:00 PM',
    type: 'zoom_red_lider',
    unit: 'red_lider',
    leadName: 'Dra. Patricia Sotomayor',
    assignedTo: 'Óscar Benavides',
    notes: 'Evaluación del modelo Ingresos Predecibles para su clínica privada.',
    status: 'confirmado'
  },
  {
    id: 'evt-103',
    title: 'Demostración Software CRM & Bot WhatsApp',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Pasado mañana
    time: '11:00 AM',
    type: 'demostracion_software',
    unit: 'software',
    leadName: 'Inmobiliaria Horizon S.A.C.',
    assignedTo: 'Dani (Admin CRM)',
    notes: 'Quieren ver cómo conectar 5 vendedores a la API de WhatsApp.',
    status: 'pendiente'
  },
  {
    id: 'evt-104',
    title: 'Comité Comercial Semanal - Revisión Embudo',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Ayer
    time: '09:00 AM',
    type: 'reunion_interna',
    unit: 'all',
    leadName: 'Equipo Red Líder',
    assignedTo: 'Óscar, Dani, Carlos',
    notes: 'Revisión de KPI semanal y asignación de prospectos entrantes.',
    status: 'realizado'
  }
];

export const CalendarView: React.FC = () => {
  const { selectedUnit, currentUser } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');

  // Formulario de nueva cita
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newType, setNewType] = useState<CalendarEvent['type']>('visita_zapotal');
  const [newUnit, setNewUnit] = useState<BusinessUnit>('el_zapotal');
  const [newLeadName, setNewLeadName] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState(currentUser.name);
  const [newNotes, setNewNotes] = useState('');

  // Filtrado de eventos por unidad del selector superior y tipo
  const filteredEvents = events.filter(evt => {
    if (selectedUnit !== 'all' && evt.unit !== 'all' && evt.unit !== selectedUnit) {
      return false;
    }
    if (filterType !== 'all' && evt.type !== filterType) {
      return false;
    }
    return true;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newTitle,
      date: newDate,
      time: newTime,
      type: newType,
      unit: newUnit,
      leadName: newLeadName || 'Prospecto general',
      assignedTo: newAssignedTo || currentUser.name,
      notes: newNotes,
      status: 'confirmado'
    };

    setEvents([newEvt, ...events]);
    setShowModal(false);
    setNewTitle('');
    setNewNotes('');
    alert('✅ Cita / Visita agendada exitosamente en el calendario comercial.');
  };

  const handleStatusChange = (id: string, newStatus: CalendarEvent['status']) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, status: newStatus } : ev));
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('¿Eliminar esta cita del calendario?')) {
      setEvents(events.filter(ev => ev.id !== id));
    }
  };

  // Funciones del mes
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Dom
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const getEventBadge = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'visita_zapotal':
        return { label: 'Visita Terreno', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40', icon: <MapPin className="w-3 h-3 text-emerald-400" /> };
      case 'zoom_red_lider':
        return { label: 'Zoom Diagnóstico', color: 'bg-blue-900/60 text-blue-300 border-blue-500/40', icon: <Video className="w-3 h-3 text-blue-400" /> };
      case 'demostracion_software':
        return { label: 'Demo Software', color: 'bg-purple-900/60 text-purple-300 border-purple-500/40', icon: <Code className="w-3 h-3 text-purple-400" /> };
      default:
        return { label: 'Reunión / Seg', color: 'bg-slate-800 text-slate-300 border-slate-700', icon: <Clock className="w-3 h-3 text-slate-400" /> };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase">
            <CalendarIcon className="w-3.5 h-3.5" />
            Agenda Comercial & Citas
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Calendario de Visitas & Zoom
          </h1>
          <p className="text-sm text-slate-400">
            Coordina visitas al proyecto El Zapotal, sesiones Zoom de Red Líder y demostraciones de software.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🗓️ Vista Calendario
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'agenda' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 Lista Próximos
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Agendar Nueva Cita / Visita
          </button>
        </div>
      </div>

      {/* Selector de Mes y Filtros Rápida */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-white min-w-44 text-center capitalize">
            {monthNames[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={goToday} className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors border border-slate-700">
            Hoy
          </button>
        </div>

        {/* Filtro por Tipo */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Filtrar por tipo:</span>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">⚡ Todos los eventos</option>
            <option value="visita_zapotal">🌲 Visitas El Zapotal</option>
            <option value="zoom_red_lider">🖥️ Zoom Diagnóstico Red Líder</option>
            <option value="demostracion_software">💻 Demos de Software</option>
            <option value="reunion_interna">🤝 Reuniones internas</option>
          </select>
        </div>
      </div>

      {/* VISTA GRID CALENDARIO */}
      {viewMode === 'grid' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 bg-slate-950/80 border-b border-slate-800 text-center text-xs font-bold text-slate-400 py-3 uppercase tracking-wider">
            <div>Dom</div>
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 auto-rows-[110px] sm:auto-rows-[140px] divide-x divide-y divide-slate-800/80 bg-slate-900/40">
            {/* Espacios vacíos antes del día 1 */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-950/30 p-2 opacity-30" />
            ))}

            {/* Días reales */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = filteredEvents.filter(ev => ev.date === dateStr);
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div 
                  key={dateStr} 
                  className={`p-1.5 sm:p-2.5 transition-colors relative overflow-y-auto no-scrollbar group ${
                    isToday ? 'bg-blue-950/20 border-2 border-blue-500/50' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs sm:text-sm font-bold px-1.5 py-0.5 rounded ${
                      isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300'
                    }`}>
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Eventos en este día */}
                  <div className="space-y-1">
                    {dayEvents.map(ev => {
                      const badge = getEventBadge(ev.type);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => alert(`📌 ${ev.title}\n⏰ Hora: ${ev.time || 'No disp.'}\n👤 Prospecto: ${ev.leadName}\n🧑‍💼 Asignado a: ${ev.assignedTo}\n📝 Notas: ${ev.notes || 'Ninguna'}`)}
                          className={`p-1.5 rounded-lg border text-[10px] sm:text-xs cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col gap-0.5 ${badge.color}`}
                          title={ev.title}
                        >
                          <div className="flex items-center justify-between gap-1 font-bold truncate">
                            <span className="flex items-center gap-1 truncate">
                              {badge.icon}
                              {ev.time && <span className="text-slate-300 font-mono text-[9px]">{ev.time}</span>}
                            </span>
                          </div>
                          <span className="font-extrabold text-white truncate leading-tight">
                            {ev.title}
                          </span>
                          <span className="text-[9px] text-slate-400 truncate hidden sm:inline">
                            👤 {ev.leadName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA AGENDA / LISTA */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Próximas Citas & Reuniones Agendadas ({filteredEvents.length})
            </h3>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No hay eventos agendados para este criterio de filtro.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 space-y-4">
                {filteredEvents
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map(ev => {
                    const badge = getEventBadge(ev.type);
                    return (
                      <div key={ev.id} className="pt-4 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border ${badge.color}`}>
                              {badge.icon}
                              {badge.label}
                            </span>
                            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-bold">
                              📅 {ev.date} • ⏰ {ev.time || 'Sin hora'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              ev.status === 'confirmado' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              ev.status === 'realizado' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              ev.status === 'cancelado' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {ev.status}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white">
                            {ev.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1 text-slate-300">
                              <User className="w-3.5 h-3.5 text-blue-400" />
                              Prospecto: <strong className="text-white">{ev.leadName || 'N/A'}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              🧑‍💼 Asignado a: <strong className="text-slate-300">{ev.assignedTo}</strong>
                            </span>
                          </div>

                          {ev.notes && (
                            <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                              💬 {ev.notes}
                            </p>
                          )}
                        </div>

                        {/* Botones de acción rápida */}
                        <div className="flex items-center gap-2 shrink-0">
                          {ev.status !== 'realizado' && (
                            <button
                              onClick={() => handleStatusChange(ev.id, 'realizado')}
                              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                              title="Marcar como realizado"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Completada
                            </button>
                          )}
                          {ev.status !== 'cancelado' && ev.status !== 'realizado' && (
                            <button
                              onClick={() => handleStatusChange(ev.id, 'cancelado')}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-red-950/50 text-slate-400 hover:text-red-400 rounded-lg text-xs font-bold transition-colors"
                              title="Cancelar cita"
                            >
                              Cancelar
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL NUEVA CITA / VISITA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                Agendar Cita o Visita Comercial
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Título de la Cita / Visita *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Visita Lote 8 - Juan Pérez / Zoom Consultoría"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Hora programada
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 10:30 AM"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Tipo de Evento *
                  </label>
                  <select
                    value={newType}
                    onChange={e => {
                      const val = e.target.value as CalendarEvent['type'];
                      setNewType(val);
                      if (val === 'visita_zapotal') setNewUnit('el_zapotal');
                      else if (val === 'zoom_red_lider') setNewUnit('red_lider');
                      else if (val === 'demostracion_software') setNewUnit('software');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="visita_zapotal">🌲 Visita Terreno (El Zapotal)</option>
                    <option value="zoom_red_lider">🖥️ Zoom Diagnóstico (Red Líder)</option>
                    <option value="demostracion_software">💻 Demo de Software CRM</option>
                    <option value="reunion_interna">🤝 Reunión Interna</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Unidad de Negocio
                  </label>
                  <select
                    value={newUnit}
                    onChange={e => setNewUnit(e.target.value as BusinessUnit)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="el_zapotal">El Zapotal (Terrenos)</option>
                    <option value="red_lider">Red Líder (Consultoría)</option>
                    <option value="software">Software / IA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Prospecto o Cliente
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre del cliente"
                    value={newLeadName}
                    onChange={e => setNewLeadName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Asignado A
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Óscar / Carlos / Esteban"
                    value={newAssignedTo}
                    onChange={e => setNewAssignedTo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Notas o Detalles de Coordinación
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles importantes (transporte, lote requerido, presupuesto...)"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/30"
                >
                  Confirmar y Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
