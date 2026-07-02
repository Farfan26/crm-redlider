/**
 * Modal del Manual de Usuario, Buenas Prácticas y Guía de Configuración
 * Orientado para Óscar, Carlos, Dani y todo el equipo comercial de Red Líder
 */
import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  ShieldCheck, 
  MessageCircle, 
  Users, 
  AlertTriangle, 
  Flame, 
  Building2, 
  Briefcase, 
  Code, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'roles' | 'whatsapp' | 'setup'>('manual');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Manual Comercial & Guía de Usuario "Red Líder"
              </h2>
              <p className="text-xs text-slate-400">
                Modelo Ingresos Predecibles • Guía rápida para el equipo y directorio
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-6 flex items-center gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-3 px-4 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'manual' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>1. Flujo & Modelo Ingresos Predecibles</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-3 px-4 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'roles' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>2. Roles del Equipo (Óscar, Carlos, Dani...)</span>
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-3 px-4 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'whatsapp' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>3. WhatsApp Cloud API & Regla 24h</span>
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3 px-4 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'setup' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>4. Guía de Setup No-Técnico (Meta)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-6 leading-relaxed">
          {activeTab === 'manual' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/40 p-5 rounded-2xl">
                <h3 className="text-base font-extrabold text-white mb-2">
                  ¿Cómo funciona el Modelo de Ingresos Predecibles en Red Líder?
                </h3>
                <p className="text-slate-300">
                  Inspirado en la metodología de Aaron Ross, nuestro CRM elimina la improvisación comercial separando la generación de demanda, la calificación operativa y el cierre ejecutivo. Ningún prospecto puede quedar en el limbo o sin una próxima acción asignada.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white uppercase text-sm tracking-wider">
                  Las 3 Reglas de Oro que Todo el Equipo Debe Cumplir:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-red-500/40 p-4 rounded-2xl space-y-2">
                    <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Regla #1 (Alerta Roja 🔴)</span>
                    <h5 className="font-bold text-white text-sm">Próxima Acción Obligatoria</h5>
                    <p className="text-slate-400">
                      Está prohibido cerrar una ficha de prospecto sin definir qué se hará después (Llamada, Zoom o Visita) y en qué fecha. Si un lead no tiene acción, el sistema disparará una Alerta Roja en todo el panel.
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-amber-500/40 p-4 rounded-2xl space-y-2">
                    <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Regla #2 (Alerta Naranja 🟠)</span>
                    <h5 className="font-bold text-white text-sm">Cero Vencidos al Final del Día</h5>
                    <p className="text-slate-400">
                      La pestaña "Seguimientos" ordena los leads por días de retraso. Carlos y los vendedores deben limpiar esta lista todos los días antes de las 6:00 PM llamando o enviando plantillas de WhatsApp.
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-emerald-500/40 p-4 rounded-2xl space-y-2">
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Regla #3 (Temperatura)</span>
                    <h5 className="font-bold text-white text-sm">Calificación RIGUROSA</h5>
                    <p className="text-slate-400">
                      No pierdas tiempo con leads fríos. Califica como 🔥 Caliente solo a quienes tengan presupuesto y urgencia real (ej. listos para separar lote con S/ 1,000 en Zapotal o firmar consultoría B2B).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm">Embudos Diferenciados por Unidad Comercial:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-blue-400 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> 1. Red Líder (B2B)</span>
                    <p className="text-[11px] text-slate-400">Demanda &gt; Calificación &gt; <strong>Diagnóstico Zoom</strong> &gt; Propuesta &gt; Seguimiento &gt; Cierre / Factura.</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> 2. El Zapotal (Lotes)</span>
                    <p className="text-[11px] text-slate-400">Demanda &gt; Calificación &gt; <strong>Visita al Terreno 🚗</strong> &gt; Seguimiento &gt; <strong>Separación S/ 1k</strong> &gt; Contrato.</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-purple-400 flex items-center gap-1"><Code className="w-3.5 h-3.5" /> 3. Software / Proyectos</span>
                    <p className="text-[11px] text-slate-400">Demanda &gt; Calificación &gt; <strong>Demostración Demo</strong> &gt; Propuesta &gt; Negociación &gt; Cierre.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h3 className="text-base font-extrabold text-white">
                Distribución de Roles y Permisos en el Equipo Red Líder
              </h3>
              <p className="text-slate-300">
                El CRM cuenta con control de acceso granular en la esquina superior derecha de la pantalla. Puedes cambiar de rol en cualquier momento para ver cómo opera cada miembro del equipo.
              </p>

              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-start gap-4">
                  <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl font-black text-sm shrink-0">OB</div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Óscar Benavides — Dirección Comercial & Estrategia</h4>
                    <p className="text-slate-400 mt-1">
                      Tiene acceso total (Admin). Su función principal es supervisar los KPI del Dashboard, revisar el CPL (Costo por Lead) en el embudo y generar el <strong>Reporte Comercial Semanal</strong> los lunes a las 9:00 AM para el directorio.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl font-black text-sm shrink-0">CM</div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Carlos Mendoza — Seguimiento Operativo (Supervisión)</h4>
                    <p className="text-slate-400 mt-1">
                      Supervisa la ejecución diaria. Su herramienta clave es la vista <strong>"Seguimientos Vencidos"</strong>. Se asegura de que la Agendadora y los Vendedores no acumulen alertas naranjas ni rojas, y ejecuta la reasignación de bases antiguas en lote.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl font-black text-sm shrink-0">DG</div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Dani — Inteligencia Comercial & Administrador CRM</h4>
                    <p className="text-slate-400 mt-1">
                      Administrador del sistema. Encargado de importar bases de datos desde Excel/CSV con detección de duplicados, mantener conectada la WhatsApp Cloud API en "Configuración Meta" y crear nuevas plantillas aprobadas.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl font-black text-sm shrink-0">VA</div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Valeria (Agendadora) — Calificación de Leads (SDR)</h4>
                    <p className="text-slate-400 mt-1">
                      Su única misión es tomar los leads que entran en "1. Gen. Demanda", llamarlos o escribirles por WhatsApp en menos de 15 minutos, filtrar a los curiosos y mover los calificados a "3. Diagnóstico Zoom" o "3. Visita al Terreno", asignándolos a un Vendedor Senior.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-start gap-4">
                  <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl font-black text-sm shrink-0">VS</div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Esteban / Vendedores Senior (Closing / Asesores)</h4>
                    <p className="text-slate-400 mt-1">
                      Responsables del cierre. Tienen permiso de edición sobre los prospectos que les han sido asignados. Deben conducir las visitas a El Zapotal, recibir separaciones de S/ 1,000 y firmar contratos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-5 rounded-2xl">
                <h3 className="text-base font-extrabold text-white mb-2 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>Integración WhatsApp Cloud API & Reglas Antibloqueo</span>
                </h3>
                <p className="text-slate-300">
                  El CRM está preparado para enviar mensajes directamente usando la API Oficial de Meta v20.0 sin intermediarios ni teléfonos físicos encendidos.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-sm">La Ventana de 24 Horas (Políticas Oficiales de WhatsApp):</h4>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold text-base">🟢</span>
                    <div>
                      <strong className="text-white">Dentro de las primeras 24 horas:</strong>
                      <p className="text-slate-400">Cuando un cliente te escribe un mensaje de WhatsApp (por un anuncio o por su cuenta), se abre una ventana de 24 horas. En ese periodo puedes responder con texto libre, notas de voz, fotos o enlaces de pago.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-2 border-t border-slate-800/80">
                    <span className="text-amber-400 font-bold text-base">🟠</span>
                    <div>
                      <strong className="text-white">Fuera de la ventana (&gt;24 horas sin respuesta del cliente):</strong>
                      <p className="text-slate-400">Si intentas escribir un mensaje libre después de 24 horas, Meta rechazará el envío para proteger al usuario del spam. <strong>La solución:</strong> En el menú de mensajería de la ficha del lead, selecciona una <strong className="text-emerald-300">Plantilla de Mensaje Aprobada por Meta</strong>.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-2xl text-amber-200 space-y-2">
                  <h5 className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Buenas Prácticas para Evitar el Bloqueo del Número de Teléfono:</span>
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li>No envíes campañas masivas en la pestaña "Reactivación" a personas que pidieron expresamente no ser contactadas.</li>
                    <li>Si un cliente responde "No me interesa" o "Baja", cámbialo de inmediato a temperatura <strong>❌ Perdido / Descartado</strong>.</li>
                    <li>Utiliza el botón rápido "WA Web" para abrir una conversación en tu WhatsApp del teléfono si necesitas enviar ubicaciones en mapa o documentos PDF pesados durante una visita a El Zapotal.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Guía Paso a Paso para No-Técnicos (Configuración en Meta)</span>
              </h3>
              <p className="text-slate-300">
                Sigue estos 5 pasos para conectar tu número oficial de WhatsApp de Red Líder o El Zapotal al CRM:
              </p>

              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-blue-400 font-bold uppercase text-[10px]">Paso 1</span>
                  <h4 className="font-extrabold text-white text-sm">Crear App en Meta for Developers</h4>
                  <p className="text-slate-400">
                    Ingresa a <strong className="text-white">developers.facebook.com</strong>, inicia sesión con tu cuenta de Facebook Business, haz clic en "Create App" (Crear Aplicación) y selecciona el tipo de aplicación <strong className="text-emerald-300">"Business" (Negocios)</strong>.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-blue-400 font-bold uppercase text-[10px]">Paso 2</span>
                  <h4 className="font-extrabold text-white text-sm">Agregar el Producto WhatsApp</h4>
                  <p className="text-slate-400">
                    Dentro de tu nueva App en el panel izquierdo, busca la sección "Add Product" (Agregar Producto) y selecciona <strong className="text-white">WhatsApp</strong>. Esto habilitará un número de teléfono de prueba gratuito de inmediato.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-blue-400 font-bold uppercase text-[10px]">Paso 3</span>
                  <h4 className="font-extrabold text-white text-sm">Obtener Identificadores (WABA ID y Phone Number ID)</h4>
                  <p className="text-slate-400">
                    En el menú izquierdo, entra a <strong className="text-white">WhatsApp &gt; API Setup</strong> (Configuración de la API). Ahí verás dos números largos: el <strong>Phone Number ID</strong> y el <strong>WhatsApp Business Account ID</strong>. Cópialos y pégalos en la pestaña "Configuración Meta" de este CRM.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-blue-400 font-bold uppercase text-[10px]">Paso 4</span>
                  <h4 className="font-extrabold text-white text-sm">Generar Token de Acceso Permanente</h4>
                  <p className="text-slate-400">
                    El token temporal que muestra la página dura solo 24 horas. Para el funcionamiento continuo del CRM, entra en tu Meta Business Manager a <strong className="text-white">Configuración del negocio &gt; Usuarios del sistema</strong>, crea un usuario con rol de Administrador y genera un token con el permiso <strong className="text-emerald-300 font-mono">whatsapp_business_messaging</strong>. Pégalo en el campo "Access Token" del CRM.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-blue-400 font-bold uppercase text-[10px]">Paso 5</span>
                  <h4 className="font-extrabold text-white text-sm">Configurar el Webhook (Recepción automática de mensajes)</h4>
                  <p className="text-slate-400">
                    En <strong className="text-white">WhatsApp &gt; Configuration &gt; Webhook</strong>, haz clic en "Edit". En "Callback URL" pega la URL que te da el CRM en "Configuración Meta" (<code className="bg-slate-900 text-blue-300 px-1 rounded">{window.location.origin}/api/webhook</code>). En "Verify Token" pon <code className="bg-slate-900 text-emerald-300 px-1 rounded">red_lider_webhook_secret_2026</code>. Finalmente suscríbete al evento <strong className="text-white">messages</strong>. ¡Listo!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-semibold">
            🤝 Soporte técnico e implementación: Sistema Comercial Red Líder • Versión Profesional 2026
          </span>
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs">
            Cerrar Manual
          </button>
        </div>
      </div>
    </div>
  );
};
