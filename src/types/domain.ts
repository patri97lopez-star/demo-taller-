export const REPAIR_STATES = [
  'Vehículo recibido',
  'Pendiente de diagnóstico',
  'Diagnóstico realizado',
  'Presupuesto pendiente de aprobación',
  'Esperando autorización del cliente',
  'Esperando piezas',
  'En reparación',
  'En revisión y pruebas',
  'Reparación finalizada',
  'Listo para recoger',
  'Vehículo entregado',
] as const;

export type RepairStatus = (typeof REPAIR_STATES)[number];

export type NotificationChannel =
  | 'Centro Simulado'
  | 'WhatsApp Business API'
  | 'Correo electrónico'
  | 'SMS';

export type NotificationType = 'Informativa' | 'Autorización' | 'Prioritaria';

export type NotificationSendStatus = 'Simulado (Demo)' | 'Pendiente de canal';

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  fecha_registro: string;
  consentimiento_rgpd: boolean;
}

export interface Vehiculo {
  id: string;
  matricula: string;
  marca: string;
  modelo: string;
  cliente_id: string;
}

export interface Reparacion {
  id: string;
  codigo_seguimiento: string;
  vehiculo_id: string;
  fecha_entrada: string;
  descripcion_averia: string;
  estado_actual: RepairStatus;
  fecha_estimada_entrega: string;
  observaciones_publicas: string;
  observaciones_privadas: string;
  fecha_ultima_actualizacion: string;
}

export interface HistorialEstado {
  id: string;
  reparacion_id: string;
  estado: RepairStatus;
  fecha: string;
  observacion: string;
  observacion_publica: string;
  autor: string;
}

export interface Notificacion {
  id: string;
  reparacion_id: string;
  matricula: string;
  vehiculo_texto: string;
  destinatario: string;
  telefono_destinatario: string;
  email_destinatario: string;
  canal: NotificationChannel;
  tipo: NotificationType;
  estado_relacionado: RepairStatus;
  mensaje: string;
  fecha: string;
  estado_envio: NotificationSendStatus;
  prioritaria: boolean;
  leida: boolean;
}

export interface ConfiguracionTaller {
  nombre_taller: string;
  logo_url: string;
  direccion: string;
  telefono: string;
  email_contacto: string;
  horario: string;
  aviso_rgpd: string;
  umbral_alerta_horas: number;
  plantillas_mensajes: Record<RepairStatus, string>;
}

export interface DatabaseSchema {
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  reparaciones: Reparacion[];
  historial_estados: HistorialEstado[];
  notificaciones: Notificacion[];
  configuracion_taller: ConfiguracionTaller;
}

export interface RepairFullRecord {
  reparacion: Reparacion;
  vehiculo: Vehiculo;
  cliente: Cliente;
  historial: HistorialEstado[];
  notificaciones: Notificacion[];
}

export interface PublicWorkshopInfo {
  nombre_taller: string;
  logo_url: string;
  direccion: string;
  telefono: string;
  email_contacto: string;
  horario: string;
  aviso_rgpd: string;
}

export interface PublicTrackingResult {
  codigo_seguimiento: string;
  matricula: string;
  marca: string;
  modelo: string;
  estado_actual: RepairStatus;
  fecha_entrada: string;
  fecha_estimada_entrega: string;
  fecha_ultima_actualizacion: string;
  observaciones_publicas: string;
  historial_publico: Array<{
    id: string;
    estado: RepairStatus;
    fecha: string;
    observacion_publica: string;
  }>;
  taller: PublicWorkshopInfo;
}

export interface ClientWithDetails {
  cliente: Cliente;
  vehiculos: Vehiculo[];
  reparaciones: Array<{
    reparacion: Reparacion;
    vehiculo: Vehiculo;
  }>;
}

export interface DashboardSummary {
  kpis: {
    en_taller: number;
    pendiente_diagnostico: number;
    en_reparacion: number;
    esperando_piezas: number;
    listos_para_recoger: number;
    entregados: number;
    total_registrados: number;
  };
  distribucion_estados: Array<{
    estado: RepairStatus;
    cantidad: number;
  }>;
  entradas_recientes_por_dia: Array<{
    fecha: string;
    etiqueta: string;
    cantidad: number;
  }>;
  ultimos_vehiculos: RepairFullRecord[];
  trabajos_pendientes: RepairFullRecord[];
  alertas_demora: Array<{
    record: RepairFullRecord;
    horas_en_fase: number;
  }>;
  actividad_reciente: Array<{
    id: string;
    reparacion_id: string;
    matricula: string;
    vehiculo_texto: string;
    estado: RepairStatus;
    fecha: string;
    observacion: string;
  }>;
  notificaciones_no_leidas: number;
}

export interface StatusVisualConfig {
  label: string;
  shortLabel: string;
  tone: 'slate' | 'amber' | 'blue' | 'indigo' | 'orange' | 'emerald' | 'teal' | 'zinc';
  timelineStage: number;
  description: string;
}

export const STATUS_CONFIG: Record<RepairStatus, StatusVisualConfig> = {
  'Vehículo recibido': {
    label: 'Vehículo recibido',
    shortLabel: 'Recibido',
    tone: 'slate',
    timelineStage: 0,
    description: 'El vehículo ha sido recepcionado en nuestras instalaciones.',
  },
  'Pendiente de diagnóstico': {
    label: 'Pendiente de diagnóstico',
    shortLabel: 'Pend. diagnóstico',
    tone: 'amber',
    timelineStage: 1,
    description: 'El vehículo está en cola técnica para revisión inicial.',
  },
  'Diagnóstico realizado': {
    label: 'Diagnóstico realizado',
    shortLabel: 'Diagnosticado',
    tone: 'blue',
    timelineStage: 1,
    description: 'Nuestros técnicos han identificado el origen de la avería.',
  },
  'Presupuesto pendiente de aprobación': {
    label: 'Presupuesto pendiente de aprobación',
    shortLabel: 'Presupuesto pend.',
    tone: 'orange',
    timelineStage: 1,
    description: 'Estamos preparando o validando el presupuesto detallado.',
  },
  'Esperando autorización del cliente': {
    label: 'Esperando autorización del cliente',
    shortLabel: 'Esperando autoriz.',
    tone: 'orange',
    timelineStage: 1,
    description: 'Necesitamos tu confirmación para iniciar la reparación.',
  },
  'Esperando piezas': {
    label: 'Esperando piezas',
    shortLabel: 'Esperando piezas',
    tone: 'amber',
    timelineStage: 2,
    description: 'Hemos solicitado los recambios necesarios al proveedor.',
  },
  'En reparación': {
    label: 'En reparación',
    shortLabel: 'En reparación',
    tone: 'blue',
    timelineStage: 3,
    description: 'El equipo mecánico está trabajando activamente en tu vehículo.',
  },
  'En revisión y pruebas': {
    label: 'En revisión y pruebas',
    shortLabel: 'En pruebas',
    tone: 'indigo',
    timelineStage: 4,
    description: 'Realizando verificaciones de seguridad y control de calidad.',
  },
  'Reparación finalizada': {
    label: 'Reparación finalizada',
    shortLabel: 'Finalizado',
    tone: 'teal',
    timelineStage: 4,
    description: 'Intervención completada, preparando el vehículo para entrega.',
  },
  'Listo para recoger': {
    label: 'Listo para recoger',
    shortLabel: 'Listo para recoger',
    tone: 'emerald',
    timelineStage: 5,
    description: 'Tu vehículo está terminado y disponible para recogida en taller.',
  },
  'Vehículo entregado': {
    label: 'Vehículo entregado',
    shortLabel: 'Entregado',
    tone: 'zinc',
    timelineStage: 5,
    description: 'El vehículo ha sido entregado al cliente.',
  },
};

export const PUBLIC_TIMELINE_STEPS = [
  { stage: 0, title: 'Vehículo recibido', subtitle: 'Entrada confirmada' },
  { stage: 1, title: 'Diagnóstico', subtitle: 'Revisión y presupuesto' },
  { stage: 2, title: 'Esperando piezas', subtitle: 'Gestión de recambios' },
  { stage: 3, title: 'En reparación', subtitle: 'Intervención técnica' },
  { stage: 4, title: 'Revisión', subtitle: 'Control de calidad' },
  { stage: 5, title: 'Listo para recoger', subtitle: 'Disponible en taller' },
] as const;

export const DEFAULT_MESSAGE_TEMPLATES: Record<RepairStatus, string> = {
  'Vehículo recibido':
    '[{taller}] Confirmamos la recepción de tu {marca} {modelo} ({matricula}). Código de seguimiento: {codigo}.',
  'Pendiente de diagnóstico':
    '[{taller}] Tu {marca} {modelo} ({matricula}) está pendiente de diagnóstico técnico. Te avisaremos en cuanto finalice la revisión.',
  'Diagnóstico realizado':
    '[{taller}] Hemos completado el diagnóstico de tu {marca} {modelo} ({matricula}). Consulta las notas técnicas con el código {codigo}.',
  'Presupuesto pendiente de aprobación':
    '[{taller}] El presupuesto para tu {marca} {modelo} ({matricula}) está listo para tu revisión.',
  'Esperando autorización del cliente':
    '[{taller}] Necesitamos tu autorización para continuar con la reparación de tu {marca} {modelo} ({matricula}). Contacta con nosotros o revisa tu portal.',
  'Esperando piezas':
    '[{taller}] Tu {marca} {modelo} ({matricula}) está a la espera de recibir recambios para continuar la reparación.',
  'En reparación':
    '[{taller}] ¡Buenas noticias! Los trabajos de reparación en tu {marca} {modelo} ({matricula}) ya han comenzado.',
  'En revisión y pruebas':
    '[{taller}] Tu {marca} {modelo} ({matricula}) se encuentra en fase de revisión y pruebas de seguridad.',
  'Reparación finalizada':
    '[{taller}] La reparación de tu {marca} {modelo} ({matricula}) ha finalizado. Estamos preparando los últimos detalles.',
  'Listo para recoger':
    '[{taller}] AVISO PRIORITARIO: Tu {marca} {modelo} ({matricula}) está terminado y listo para recoger en nuestro horario habitual.',
  'Vehículo entregado':
    '[{taller}] Gracias por confiar en nosotros. Confirmamos la entrega de tu {marca} {modelo} ({matricula}).',
};
