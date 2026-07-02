/**
 * Módulo de Eventos & Webinars
 * Ficha de evento, inscritos por madurez comercial, y conversión a Lead del embudo en 1 clic
 */
import React, { useState, useEffect } from 'react';
import { EventItem, EventAttendee, BusinessUnit } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  Users, 
  Plus, 
  CheckCircle2, 
  ArrowRight, 
  UserPlus, 
  Building2, 
  Briefcase, 
  Code, 
  Video, 
  MapPin, 
  Flame, 
  Clock,
  ExternalLink
} from 'lucide-react';

interface EventsViewProps {
  onSelectLeadById: (leadId: string) => void;
  onRefreshGlobal: () => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ onSelectLeadById, onRefreshGlobal }) => {
  const { selectedUnit } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(false);

  // New event form
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [unit, setUnit] = useState<BusinessUnit>(selectedUnit === 'all' ? 'red_lider' : selectedUnit);
  const [type, setType] = useState<'Webinar Zoom' | 'Taller Presencial' | 'Visita Guiada Terreno' | 'Lanzamiento Tech'>('Webinar Zoom');

  // New attendee form
  const [showNewAttendee, setShowNewAttendee] = useState(false);
  const [attName, setAttName] = useState('');
  const [attPhone, setAttPhone] = useState('');
  const [attEmail, setAttEmail] = useState('');
  const [attCompany, setAttCompany] = useState('');
  const [attMaturity, setAttMaturity] = useState<'Alto' | 'Medio' | 'Bajo'>('Alto');
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents(selectedUnit);
      setEvents(res);
      if (res.length > 0 && (!selectedEvent || !res.find(e => e.id === selectedEvent.id))) {
        setSelectedEvent(res[0]);
      }
    } catch (e) {
      alert('Error cargando eventos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async (eventId: string) => {
    try {
      const res = await api.getAttendees(eventId);
      setAttendees(res);
    } catch (e) {
      alert('Error cargando inscritos');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedUnit]);

  useEffect(() => {
    if (selectedEvent) {
      fetchAttendees(selectedEvent.id);
    }
  }, [selectedEvent]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    try {
      const newEvt = await api.createEvent({
        title,
        date,
        time,
        unit,
        type,
        status: 'próximo'
      });
      setEvents([newEvt, ...events]);
      setSelectedEvent(newEvt);
      setShowNewEvent(false);
      setTitle('');
    } catch (e: any) {
      alert('Error creando evento: ' + e.message);
    }
  };

  const handleAddAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !attName || !attPhone) return;
    try {
      const newAtt = await api.addAttendee({
        eventId: selectedEvent.id,
        name: attName,
        phone: attPhone.replace(/\D/g, ''),
        email: attEmail,
        company: attCompany,
        maturity: attMaturity,
        attended: false
      });
      setAttendees([...attendees, newAtt]);
      setShowNewAttendee(false);
      setAttName('');
      setAttPhone('');
      setAttEmail('');
      setAttCompany('');
      fetchEvents(); // update counts
    } catch (e: any) {
      alert('Error registrando inscrito: ' + e.message);
    }
  };

  const handleConvertToLead = async (attendee: EventAttendee) => {
    if (!selectedEvent) return;
    setConvertingId(attendee.id);
    try {
      const res = await api.convertAttendeeToLead(selectedEvent.id, attendee.id);
      // Actualizar estado local
      setAttendees(attendees.map(a => a.id === attendee.id ? { ...a, leadId: res.lead.id } : a));
      onRefreshGlobal();
      alert(`🎉 ¡Éxito! "${attendee.name}" fue convertido en Lead del embudo en etapa CALIFICACIÓN.`);
    } catch (e: any) {
      alert('Error al convertir inscrito: ' + e.message);
    } finally {
      setConvertingId(null);
    }
  };

  const getUnitBadge = (u: BusinessUnit) => {
    if (u === 'red_lider') return <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Briefcase className="w-3 h-3" />Red Líder</span>;
    if (u === 'el_zapotal') return <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Building2 className="w-3 h-3" />Zapotal</span>;
    return <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Code className="w-3 h-3" />Software</span>;
  };

  const getMaturityBadge = (mat: string) => {
    if (mat === 'Alto') return <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-extrabold flex items-center gap-1 text-[10px]"><Flame className="w-3 h-3 text-red-400" />Madurez Alta</span>;
    if (mat === 'Medio') return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-extrabold text-[10px]">Madurez Media</span>;
    return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold text-[10px]">Exploratorio</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Módulo de Eventos, Webinars & Visitas Guiadas</span>
            <span className="text-xs px-2.5 py-0.5 bg-indigo-950 border border-indigo-800 text-indigo-300 rounded-full">
              {events.length} eventos
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calificación de inscritos por madurez comercial y conversión en 1 clic al embudo Kanban
          </p>
        </div>

        <button
          onClick={() => setShowNewEvent(!showNewEvent)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>{showNewEvent ? 'Cancelar' : '+ Programar Evento'}</span>
        </button>
      </div>

      {/* New Event Form */}
      {showNewEvent && (
        <form onSubmit={handleCreateEvent} className="bg-slate-900 p-5 rounded-2xl border-2 border-indigo-500/40 space-y-4 animate-in fade-in duration-150 text-xs">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Video className="w-4 h-4 text-indigo-400" />
            <span>Crear Nuevo Evento / Webinar</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Título del Evento *</label>
              <input
                type="text"
                required
                placeholder="ej. Masterclass: Cómo vender B2B sin descuentos"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Fecha *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Hora *</label>
              <input
                type="time"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Unidad & Tipo *</label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold uppercase"
                >
                  <option value="red_lider">Red Líder</option>
                  <option value="el_zapotal">Zapotal</option>
                  <option value="software">Software</option>
                </select>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-semibold"
                >
                  <option value="Webinar Zoom">Webinar Zoom</option>
                  <option value="Taller Presencial">Taller Presenc.</option>
                  <option value="Visita Guiada Terreno">Visita Terreno</option>
                  <option value="Lanzamiento Tech">Lanzamiento</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar y Guardar Evento</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Events Grid / Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Events List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Eventos Registrados</span>
            <span className="font-mono text-[11px]">{events.length}</span>
          </h3>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Cargando eventos...</div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-medium">No hay eventos en esta unidad</div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {events.map(evt => {
                const isSelected = selectedEvent?.id === evt.id;
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected 
                        ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/20' 
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {getUnitBadge(evt.unit)}
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded">
                        {evt.type}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm line-clamp-2">{evt.title}</h4>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        {evt.date} • {evt.time}
                      </span>
                      <span className="bg-slate-900 text-white font-bold px-2 py-0.5 rounded text-[11px]">
                        👥 {evt.attendeesCount} inscritos
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Selected Event Details & Attendees */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedEvent ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              Selecciona un evento de la columna izquierda para ver sus inscritos y calificar madurez
            </div>
          ) : (
            <>
              {/* Event detail header card */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getUnitBadge(selectedEvent.unit)}
                    <span className="text-xs text-indigo-300 font-bold uppercase">• {selectedEvent.type}</span>
                  </div>
                  <h3 className="text-lg font-black text-white">{selectedEvent.title}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-3">
                    <span>📅 Fecha: {selectedEvent.date}</span>
                    <span>•</span>
                    <span>⏰ Hora: {selectedEvent.time}</span>
                    <span>•</span>
                    <span>👥 Total Inscritos: {attendees.length}</span>
                  </p>
                </div>

                <button
                  onClick={() => setShowNewAttendee(!showNewAttendee)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{showNewAttendee ? 'Cancelar' : '+ Registrar Inscrito'}</span>
                </button>
              </div>

              {/* New Attendee Form */}
              {showNewAttendee && (
                <form onSubmit={handleAddAttendee} className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-3 animate-in fade-in duration-150 text-xs">
                  <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" /> Registrar Asistente / Inscrito al Evento
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Roberto Torres"
                        value={attName}
                        onChange={e => setAttName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Teléfono WhatsApp *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 51987654321"
                        value={attPhone}
                        onChange={e => setAttPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Empresa / Cargo</label>
                      <input
                        type="text"
                        placeholder="Ej. Gerente Comercial"
                        value={attCompany}
                        onChange={e => setAttCompany(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        placeholder="ej@empresa.pe"
                        value={attEmail}
                        onChange={e => setAttEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Madurez Comercial *</label>
                      <select
                        value={attMaturity}
                        onChange={e => setAttMaturity(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-bold"
                      >
                        <option value="Alto">🔥 Alto (Listo para compra/visita)</option>
                        <option value="Medio">🟡 Medio (Evaluando)</option>
                        <option value="Bajo">❄️ Bajo (Curiosidad)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">
                      Guardar Inscrito
                    </button>
                  </div>
                </form>
              )}

              {/* Attendees List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 uppercase tracking-wider">
                    Inscritos y Clasificación de Madurez Comercial ({attendees.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Convierte inscritos con madurez ALTA en prospectos activos con 1 clic
                  </span>
                </div>

                {attendees.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-medium">
                    Aún no hay inscritos registrados para este evento. Registra el primero arriba.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80">
                    {attendees.map(att => {
                      const isConverting = convertingId === att.id;
                      const alreadyLead = !!att.leadId;

                      return (
                        <div key={att.id} className="p-4 hover:bg-slate-800/60 transition-colors flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-[240px] flex-1">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-white text-xs shrink-0">
                              {att.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-white text-sm truncate">{att.name}</span>
                                {getMaturityBadge(att.maturity)}
                              </div>
                              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                                <span className="text-blue-400">📱 {att.phone}</span>
                                {att.company && (
                                  <>
                                    <span>•</span>
                                    <span className="font-sans text-slate-400">🏢 {att.company}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {alreadyLead ? (
                              <button
                                onClick={() => att.leadId && onSelectLeadById(att.leadId)}
                                className="px-3.5 py-1.5 bg-emerald-950 border border-emerald-500 text-emerald-300 hover:bg-emerald-900 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Ver en Embudo Kanban</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleConvertToLead(att)}
                                disabled={isConverting}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                              >
                                <ArrowRight className="w-4 h-4" />
                                <span>{isConverting ? 'Convirtiendo...' : 'Convertir a Prospecto en 1 clic'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
