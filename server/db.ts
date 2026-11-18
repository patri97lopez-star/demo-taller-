import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  DEFAULT_MESSAGE_TEMPLATES,
  REPAIR_STATES,
} from '../src/types/domain.ts';
import type {
  Cliente,
  ClientWithDetails,
  ConfiguracionTaller,
  DashboardSummary,
  DatabaseSchema,
  HistorialEstado,
  Notificacion,
  NotificationChannel,
  NotificationType,
  PublicTrackingResult,
  RepairFullRecord,
  RepairStatus,
  Reparacion,
  Vehiculo,
} from '../src/types/domain.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'taller-track-db.json');

export function normalizePlate(plate: string): string {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function generateTrackingCode(existingCodes: Set<string>): string {
  const year = new Date().getFullYear();
  let code = '';
  do {
    const num = Math.floor(1000 + Math.random() * 9000);
    code = `TT-${year}-${num}`;
  } while (existingCodes.has(code));
  return code;
}

function renderTemplate(
  template: string,
  vars: {
    taller: string;
    marca: string;
    modelo: string;
    matricula: string;
    cliente: string;
    codigo: string;
  }
): string {
  return template
    .replaceAll('{taller}', vars.taller)
    .replaceAll('{marca}', vars.marca)
    .replaceAll('{modelo}', vars.modelo)
    .replaceAll('{matricula}', vars.matricula)
    .replaceAll('{cliente}', vars.cliente)
    .replaceAll('{codigo}', vars.codigo);
}

export function createSeedDatabase(): DatabaseSchema {
  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString();
  const hoursAhead = (h: number) => new Date(now + h * 3600 * 1000).toISOString().slice(0, 16);

  const clientes: Cliente[] = [
    {
      id: 'cli_carlos',
      nombre: 'Carlos Martínez',
      telefono: '612 345 678',
      email: 'carlos.martinez@ejemplo.es',
      fecha_registro: hoursAgo(720),
      consentimiento_rgpd: true,
    },
    {
      id: 'cli_laura',
      nombre: 'Laura Sánchez',
      telefono: '623 987 654',
      email: 'laura.sanchez@ejemplo.es',
      fecha_registro: hoursAgo(96),
      consentimiento_rgpd: true,
    },
    {
      id: 'cli_javier',
      nombre: 'Javier López',
      telefono: '634 456 789',
      email: 'javier.lopez@ejemplo.es',
      fecha_registro: hoursAgo(144),
      consentimiento_rgpd: true,
    },
    {
      id: 'cli_marta',
      nombre: 'Marta Fernández',
      telefono: '645 112 233',
      email: '',
      fecha_registro: hoursAgo(6),
      consentimiento_rgpd: true,
    },
  ];

  const vehiculos: Vehiculo[] = [
    {
      id: 'veh_golf',
      matricula: '1234ABC',
      marca: 'Volkswagen',
      modelo: 'Golf',
      cliente_id: 'cli_carlos',
    },
    {
      id: 'veh_leon',
      matricula: '5678DEF',
      marca: 'Seat',
      modelo: 'León',
      cliente_id: 'cli_laura',
    },
    {
      id: 'veh_bmw',
      matricula: '9012GHI',
      marca: 'BMW',
      modelo: 'Serie 3',
      cliente_id: 'cli_javier',
    },
    {
      id: 'veh_corolla',
      matricula: '3456JKL',
      marca: 'Toyota',
      modelo: 'Corolla',
      cliente_id: 'cli_marta',
    },
    {
      id: 'veh_audi',
      matricula: '7890MNP',
      marca: 'Audi',
      modelo: 'A4',
      cliente_id: 'cli_carlos',
    },
  ];

  const reparaciones: Reparacion[] = [
    {
      id: 'rep_101',
      codigo_seguimiento: 'TT-2026-1042',
      vehiculo_id: 'veh_golf',
      fecha_entrada: hoursAgo(28),
      descripcion_averia: 'Vibración al frenar en autopista y testigo de desgaste de pastillas encendido.',
      estado_actual: 'En reparación',
      fecha_estimada_entrega: hoursAhead(20),
      observaciones_publicas:
        'Estamos sustituyendo discos y pastillas delanteras originales y realizando purga del circuito hidráulico.',
      observaciones_privadas:
        'Tornillo guía pinza derecha algo gripado. Se aplicó desengrasante y se verificó par de apriete.',
      fecha_ultima_actualizacion: hoursAgo(3),
    },
    {
      id: 'rep_102',
      codigo_seguimiento: 'TT-2026-1038',
      vehiculo_id: 'veh_leon',
      fecha_entrada: hoursAgo(64),
      descripcion_averia: 'Pérdida de potencia en subidas y aviso de presión de sobrealimentación.',
      estado_actual: 'Esperando piezas',
      fecha_estimada_entrega: hoursAhead(44),
      observaciones_publicas:
        'Diagnóstico completado. Hemos pedido la electroválvula de presión del turbo al distribuidor oficial; llegada prevista mañana a primera hora.',
      observaciones_privadas:
        'Pedido #REC-8841 confirmado con Recambios Ibérica. Revisar manguito intercooler al montar.',
      fecha_ultima_actualizacion: hoursAgo(38),
    },
    {
      id: 'rep_103',
      codigo_seguimiento: 'TT-2026-1031',
      vehiculo_id: 'veh_bmw',
      fecha_entrada: hoursAgo(72),
      descripcion_averia: 'Mantenimiento periódico de los 90.000 km, cambio de aceite, filtros y revisión de suspensión.',
      estado_actual: 'Listo para recoger',
      fecha_estimada_entrega: hoursAhead(4),
      observaciones_publicas:
        'Mantenimiento completado y prueba en carretera superada sin incidencias. Vehículo lavado y listo para entrega.',
      observaciones_privadas:
        'Factura cerrada #FAC-2026-312. Dejar copia de protocolo de inspección en guantera.',
      fecha_ultima_actualizacion: hoursAgo(1),
    },
    {
      id: 'rep_104',
      codigo_seguimiento: 'TT-2026-1045',
      vehiculo_id: 'veh_corolla',
      fecha_entrada: hoursAgo(5),
      descripcion_averia: 'Ruido metálico leve en rueda delantera izquierda al girar en parado.',
      estado_actual: 'Pendiente de diagnóstico',
      fecha_estimada_entrega: '',
      observaciones_publicas:
        'Vehículo recepcionado en el taller. En breve iniciaremos la inspección en elevador.',
      observaciones_privadas:
        'Posible copela o transmisión delantera izquierda. Asignado a elevador 2 (técnico Raúl).',
      fecha_ultima_actualizacion: hoursAgo(4),
    },
    {
      id: 'rep_098',
      codigo_seguimiento: 'TT-2026-0914',
      vehiculo_id: 'veh_audi',
      fecha_entrada: hoursAgo(720),
      descripcion_averia: 'Sustitución de batería AGM y codificación de módulo de gestión energética.',
      estado_actual: 'Vehículo entregado',
      fecha_estimada_entrega: hoursAgo(690).slice(0, 16),
      observaciones_publicas: 'Batería sustituida y sistema de carga verificado correctamente.',
      observaciones_privadas: 'Garantía de batería de 3 años registrada.',
      fecha_ultima_actualizacion: hoursAgo(692),
    },
  ];

  const historial_estados: HistorialEstado[] = [
    {
      id: 'his_1',
      reparacion_id: 'rep_101',
      estado: 'Vehículo recibido',
      fecha: hoursAgo(28),
      observacion: 'Recepción en taller con 84.320 km.',
      observacion_publica: 'Vehículo recepcionado en nuestras instalaciones.',
      autor: 'Recepción Taller',
    },
    {
      id: 'his_2',
      reparacion_id: 'rep_101',
      estado: 'Diagnóstico realizado',
      fecha: hoursAgo(22),
      observacion: 'Alabeo detectado en discos delanteros (0,18 mm).',
      observacion_publica: 'Revisión completada: es necesario sustituir discos y pastillas delanteras.',
      autor: 'Raúl Gómez (Jefe de Taller)',
    },
    {
      id: 'his_3',
      reparacion_id: 'rep_101',
      estado: 'En reparación',
      fecha: hoursAgo(3),
      observacion: 'Aprobado por el cliente por teléfono. Montaje iniciado.',
      observacion_publica:
        'Estamos sustituyendo discos y pastillas delanteras originales y realizando purga del circuito hidráulico.',
      autor: 'Raúl Gómez (Jefe de Taller)',
    },
    {
      id: 'his_4',
      reparacion_id: 'rep_102',
      estado: 'Vehículo recibido',
      fecha: hoursAgo(64),
      observacion: 'Entrada con testigo motor encendido.',
      observacion_publica: 'Vehículo recibido para comprobación de avería motor.',
      autor: 'Recepción Taller',
    },
    {
      id: 'his_5',
      reparacion_id: 'rep_102',
      estado: 'Diagnóstico realizado',
      fecha: hoursAgo(50),
      observacion: 'Fallo P0299 en máquina de diagnosis.',
      observacion_publica: 'Detectado fallo en electroválvula de regulación de presión.',
      autor: 'Raúl Gómez (Jefe de Taller)',
    },
    {
      id: 'his_6',
      reparacion_id: 'rep_102',
      estado: 'Esperando piezas',
      fecha: hoursAgo(38),
      observacion: 'Pedido cursado a proveedor oficial.',
      observacion_publica:
        'Diagnóstico completado. Hemos pedido la electroválvula de presión del turbo al distribuidor oficial.',
      autor: 'Recepción Taller',
    },
    {
      id: 'his_7',
      reparacion_id: 'rep_103',
      estado: 'Vehículo recibido',
      fecha: hoursAgo(72),
      observacion: 'Revisión programada 90.000 km.',
      observacion_publica: 'Vehículo recibido para mantenimiento periódico.',
      autor: 'Recepción Taller',
    },
    {
      id: 'his_8',
      reparacion_id: 'rep_103',
      estado: 'En reparación',
      fecha: hoursAgo(26),
      observacion: 'Cambio de aceite LongLife 5W30 y todos los filtros.',
      observacion_publica: 'Trabajos de mantenimiento en curso.',
      autor: 'Raúl Gómez (Jefe de Taller)',
    },
    {
      id: 'his_9',
      reparacion_id: 'rep_103',
      estado: 'En revisión y pruebas',
      fecha: hoursAgo(6),
      observacion: 'Prueba dinámica en carretera 12 km.',
      observacion_publica: 'Realizando pruebas finales y control de calidad.',
      autor: 'Raúl Gómez (Jefe de Taller)',
    },
    {
      id: 'his_10',
      reparacion_id: 'rep_103',
      estado: 'Listo para recoger',
      fecha: hoursAgo(1),
      observacion: 'Control final aprobado.',
      observacion_publica:
        'Mantenimiento completado y prueba en carretera superada sin incidencias. Vehículo lavado y listo para entrega.',
      autor: 'Recepción Taller',
    },
    {
      id: 'his_11',
      reparacion_id: 'rep_104',
      estado: 'Vehículo recibido',
      fecha: hoursAgo(5),
      observacion: 'Entrada sin cita previa.',
      observacion_publica: 'Vehículo recepcionado en el taller.',
      autor: 'Recepción Taller',
    },
    {
      id: 'his_12',
      reparacion_id: 'rep_104',
      estado: 'Pendiente de diagnóstico',
      fecha: hoursAgo(4),
      observacion: 'En espera de turno de elevador.',
      observacion_publica:
        'Vehículo recepcionado en el taller. En breve iniciaremos la inspección en elevador.',
      autor: 'Recepción Taller',
    },
    {
      id: 'his_13',
      reparacion_id: 'rep_098',
      estado: 'Vehículo entregado',
      fecha: hoursAgo(692),
      observacion: 'Entregado a propietario.',
      observacion_publica: 'Vehículo entregado al cliente.',
      autor: 'Recepción Taller',
    },
  ];

  const notificaciones: Notificacion[] = [
    {
      id: 'not_1',
      reparacion_id: 'rep_103',
      matricula: '9012GHI',
      vehiculo_texto: 'BMW Serie 3',
      destinatario: 'Javier López',
      telefono_destinatario: '634 456 789',
      email_destinatario: 'javier.lopez@ejemplo.es',
      canal: 'Centro Simulado',
      tipo: 'Prioritaria',
      estado_relacionado: 'Listo para recoger',
      mensaje:
        '[Talleres Motor Norte] AVISO PRIORITARIO: Tu BMW Serie 3 (9012GHI) está terminado y listo para recoger en nuestro horario habitual.',
      fecha: hoursAgo(1),
      estado_envio: 'Simulado (Demo)',
      prioritaria: true,
      leida: false,
    },
    {
      id: 'not_2',
      reparacion_id: 'rep_101',
      matricula: '1234ABC',
      vehiculo_texto: 'Volkswagen Golf',
      destinatario: 'Carlos Martínez',
      telefono_destinatario: '612 345 678',
      email_destinatario: 'carlos.martinez@ejemplo.es',
      canal: 'Centro Simulado',
      tipo: 'Informativa',
      estado_relacionado: 'En reparación',
      mensaje:
        '[Talleres Motor Norte] ¡Buenas noticias! Los trabajos de reparación en tu Volkswagen Golf (1234ABC) ya han comenzado.',
      fecha: hoursAgo(3),
      estado_envio: 'Simulado (Demo)',
      prioritaria: false,
      leida: false,
    },
    {
      id: 'not_3',
      reparacion_id: 'rep_104',
      matricula: '3456JKL',
      vehiculo_texto: 'Toyota Corolla',
      destinatario: 'Marta Fernández',
      telefono_destinatario: '645 112 233',
      email_destinatario: '',
      canal: 'Centro Simulado',
      tipo: 'Informativa',
      estado_relacionado: 'Pendiente de diagnóstico',
      mensaje:
        '[Talleres Motor Norte] Tu Toyota Corolla (3456JKL) está pendiente de diagnóstico técnico. Te avisaremos en cuanto finalice la revisión.',
      fecha: hoursAgo(4),
      estado_envio: 'Simulado (Demo)',
      prioritaria: false,
      leida: true,
    },
    {
      id: 'not_4',
      reparacion_id: 'rep_102',
      matricula: '5678DEF',
      vehiculo_texto: 'Seat León',
      destinatario: 'Laura Sánchez',
      telefono_destinatario: '623 987 654',
      email_destinatario: 'laura.sanchez@ejemplo.es',
      canal: 'Centro Simulado',
      tipo: 'Informativa',
      estado_relacionado: 'Esperando piezas',
      mensaje:
        '[Talleres Motor Norte] Tu Seat León (5678DEF) está a la espera de recibir recambios para continuar la reparación.',
      fecha: hoursAgo(38),
      estado_envio: 'Simulado (Demo)',
      prioritaria: false,
      leida: true,
    },
  ];

  const configuracion_taller: ConfiguracionTaller = {
    nombre_taller: 'Talleres Motor Norte',
    logo_url: '',
    direccion: 'Polígono Industrial Las Rozas, Calle Mecánica 14, Madrid',
    telefono: '910 482 310',
    email_contacto: 'recepcion@talleresmotornorte.es',
    horario: 'Lunes a Viernes: 08:30 – 19:00 · Sábados: 09:00 – 13:30',
    aviso_rgpd:
      'Los datos mostrados en este portal público están limitados estrictamente al estado técnico del vehículo conforme al RGPD. Ningún dato personal ni observación interna del taller es accesible públicamente.',
    umbral_alerta_horas: 24,
    plantillas_mensajes: { ...DEFAULT_MESSAGE_TEMPLATES },
  };

  return {
    clientes,
    vehiculos,
    reparaciones,
    historial_estados,
    notificaciones,
    configuracion_taller,
  };
}

function ensureStorage(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = createSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch {
    const initial = createSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function saveStorage(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

function hydrateRepair(db: DatabaseSchema, rep: Reparacion): RepairFullRecord | null {
  const vehiculo = db.vehiculos.find((v) => v.id === rep.vehiculo_id);
  if (!vehiculo) return null;
  const cliente = db.clientes.find((c) => c.id === vehiculo.cliente_id);
  if (!cliente) return null;

  const historial = db.historial_estados
    .filter((h) => h.reparacion_id === rep.id)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const notificaciones = db.notificaciones
    .filter((n) => n.reparacion_id === rep.id)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return {
    reparacion: rep,
    vehiculo,
    cliente,
    historial,
    notificaciones,
  };
}

export function getPublicWorkshopInfo() {
  const db = ensureStorage();
  const cfg = db.configuracion_taller;
  return {
    nombre_taller: cfg.nombre_taller,
    logo_url: cfg.logo_url,
    direccion: cfg.direccion,
    telefono: cfg.telefono,
    email_contacto: cfg.email_contacto,
    horario: cfg.horario,
    aviso_rgpd: cfg.aviso_rgpd,
  };
}

export function findPublicTracking(query: string): PublicTrackingResult | null {
  const db = ensureStorage();
  const cleaned = query.trim().toUpperCase();
  if (!cleaned) return null;

  const normalizedPlate = normalizePlate(cleaned);

  let matchedRepair: Reparacion | undefined = db.reparaciones.find(
    (r) => r.codigo_seguimiento.toUpperCase() === cleaned
  );

  if (!matchedRepair) {
    const matchingVehicles = db.vehiculos.filter(
      (v) => normalizePlate(v.matricula) === normalizedPlate
    );
    if (matchingVehicles.length > 0) {
      const vehicleIds = new Set(matchingVehicles.map((v) => v.id));
      const vehicleRepairs = db.reparaciones
        .filter((r) => vehicleIds.has(r.vehiculo_id))
        .sort(
          (a, b) =>
            new Date(b.fecha_entrada).getTime() - new Date(a.fecha_entrada).getTime()
        );
      matchedRepair = vehicleRepairs[0];
    }
  }

  if (!matchedRepair) return null;

  const vehiculo = db.vehiculos.find((v) => v.id === matchedRepair.vehiculo_id);
  if (!vehiculo) return null;

  const historial_publico = db.historial_estados
    .filter((h) => h.reparacion_id === matchedRepair.id)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .map((h) => ({
      id: h.id,
      estado: h.estado,
      fecha: h.fecha,
      observacion_publica: h.observacion_publica || h.estado,
    }));

  return {
    codigo_seguimiento: matchedRepair.codigo_seguimiento,
    matricula: vehiculo.matricula,
    marca: vehiculo.marca,
    modelo: vehiculo.modelo,
    estado_actual: matchedRepair.estado_actual,
    fecha_entrada: matchedRepair.fecha_entrada,
    fecha_estimada_entrega: matchedRepair.fecha_estimada_entrega,
    fecha_ultima_actualizacion: matchedRepair.fecha_ultima_actualizacion,
    observaciones_publicas: matchedRepair.observaciones_publicas,
    historial_publico,
    taller: getPublicWorkshopInfo(),
  };
}

export function getAllRepairs(): RepairFullRecord[] {
  const db = ensureStorage();
  return db.reparaciones
    .map((r) => hydrateRepair(db, r))
    .filter((x): x is RepairFullRecord => x !== null)
    .sort(
      (a, b) =>
        new Date(b.reparacion.fecha_ultima_actualizacion).getTime() -
        new Date(a.reparacion.fecha_ultima_actualizacion).getTime()
    );
}

export function getRepairById(id: string): RepairFullRecord | null {
  const db = ensureStorage();
  const rep = db.reparaciones.find((r) => r.id === id);
  if (!rep) return null;
  return hydrateRepair(db, rep);
}

export function getDashboardSummary(): DashboardSummary {
  const db = ensureStorage();
  const records = getAllRepairs();
  const now = Date.now();
  const thresholdHours = db.configuracion_taller.umbral_alerta_horas || 24;

  const active = records.filter((r) => r.reparacion.estado_actual !== 'Vehículo entregado');

  const kpis = {
    en_taller: active.length,
    pendiente_diagnostico: records.filter(
      (r) => r.reparacion.estado_actual === 'Pendiente de diagnóstico'
    ).length,
    en_reparacion: records.filter(
      (r) => r.reparacion.estado_actual === 'En reparación'
    ).length,
    esperando_piezas: records.filter(
      (r) => r.reparacion.estado_actual === 'Esperando piezas'
    ).length,
    listos_para_recoger: records.filter(
      (r) => r.reparacion.estado_actual === 'Listo para recoger'
    ).length,
    entregados: records.filter(
      (r) => r.reparacion.estado_actual === 'Vehículo entregado'
    ).length,
    total_registrados: records.length,
  };

  const distribucion_estados = REPAIR_STATES.map((estado) => ({
    estado,
    cantidad: records.filter((r) => r.reparacion.estado_actual === estado).length,
  }));

  const entradas_recientes_por_dia: Array<{
    fecha: string;
    etiqueta: string;
    cantidad: number;
  }> = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 3600 * 1000);
    const isoDay = d.toISOString().slice(0, 10);
    const etiqueta = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
    const cantidad = records.filter(
      (r) => r.reparacion.fecha_entrada.slice(0, 10) === isoDay
    ).length;
    entradas_recientes_por_dia.push({ fecha: isoDay, etiqueta, cantidad });
  }

  const ultimos_vehiculos = [...records]
    .sort(
      (a, b) =>
        new Date(b.reparacion.fecha_entrada).getTime() -
        new Date(a.reparacion.fecha_entrada).getTime()
    )
    .slice(0, 5);

  const trabajos_pendientes = active
    .filter((r) => r.reparacion.estado_actual !== 'Listo para recoger')
    .slice(0, 6);

  const alertas_demora = active
    .filter((r) => r.reparacion.estado_actual !== 'Listo para recoger')
    .map((record) => {
      const horas_en_fase = Math.floor(
        (now - new Date(record.reparacion.fecha_ultima_actualizacion).getTime()) /
          (1000 * 60 * 60)
      );
      return { record, horas_en_fase };
    })
    .filter((item) => item.horas_en_fase >= thresholdHours)
    .sort((a, b) => b.horas_en_fase - a.horas_en_fase);

  const actividad_reciente = [...db.historial_estados]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 8)
    .map((h) => {
      const rep = db.reparaciones.find((r) => r.id === h.reparacion_id);
      const veh = rep ? db.vehiculos.find((v) => v.id === rep.vehiculo_id) : undefined;
      return {
        id: h.id,
        reparacion_id: h.reparacion_id,
        matricula: veh?.matricula ?? '---',
        vehiculo_texto: veh ? `${veh.marca} ${veh.modelo}` : 'Vehículo',
        estado: h.estado,
        fecha: h.fecha,
        observacion: h.observacion || h.observacion_publica || h.estado,
      };
    });

  const notificaciones_no_leidas = db.notificaciones.filter((n) => !n.leida).length;

  return {
    kpis,
    distribucion_estados,
    entradas_recientes_por_dia,
    ultimos_vehiculos,
    trabajos_pendientes,
    alertas_demora,
    actividad_reciente,
    notificaciones_no_leidas,
  };
}

export interface RegisterVehiclePayload {
  matricula: string;
  marca: string;
  modelo: string;
  nombre_cliente: string;
  telefono_cliente: string;
  email_cliente?: string;
  fecha_entrada: string;
  fecha_estimada_entrega?: string;
  descripcion_averia: string;
  observaciones_privadas: string;
  observaciones_publicas?: string;
  estado_inicial?: RepairStatus;
  canal_preferido?: NotificationChannel;
}

export function registerVehicleEntry(payload: RegisterVehiclePayload): RepairFullRecord {
  const db = ensureStorage();
  const plate = normalizePlate(payload.matricula);
  const nowIso = new Date().toISOString();
  const entradaIso = payload.fecha_entrada
    ? new Date(payload.fecha_entrada).toISOString()
    : nowIso;

  const cleanPhone = payload.telefono_cliente.trim();
  const cleanEmail = (payload.email_cliente ?? '').trim().toLowerCase();
  let cliente = db.clientes.find(
    (c) =>
      c.telefono.replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, '') ||
      (cleanEmail && c.email.toLowerCase() === cleanEmail)
  );

  if (!cliente) {
    cliente = {
      id: generateId('cli'),
      nombre: payload.nombre_cliente.trim(),
      telefono: cleanPhone,
      email: (payload.email_cliente ?? '').trim(),
      fecha_registro: nowIso,
      consentimiento_rgpd: true,
    };
    db.clientes.push(cliente);
  } else {
    cliente.nombre = payload.nombre_cliente.trim();
    if (payload.email_cliente?.trim()) {
      cliente.email = payload.email_cliente.trim();
    }
  }

  let vehiculo = db.vehiculos.find((v) => normalizePlate(v.matricula) === plate);
  if (!vehiculo) {
    vehiculo = {
      id: generateId('veh'),
      matricula: plate,
      marca: payload.marca.trim(),
      modelo: payload.modelo.trim(),
      cliente_id: cliente.id,
    };
    db.vehiculos.push(vehiculo);
  } else {
    vehiculo.marca = payload.marca.trim();
    vehiculo.modelo = payload.modelo.trim();
    vehiculo.cliente_id = cliente.id;
  }

  const initialState: RepairStatus = payload.estado_inicial || 'Pendiente de diagnóstico';
  const existingCodes = new Set(db.reparaciones.map((r) => r.codigo_seguimiento));
  const codigo_seguimiento = generateTrackingCode(existingCodes);

  const defaultPublicObs =
    payload.observaciones_publicas?.trim() ||
    'Vehículo recepcionado en el taller. Puedes consultar cada avance desde este portal.';

  const reparacion: Reparacion = {
    id: generateId('rep'),
    codigo_seguimiento,
    vehiculo_id: vehiculo.id,
    fecha_entrada: entradaIso,
    descripcion_averia: payload.descripcion_averia.trim(),
    estado_actual: initialState,
    fecha_estimada_entrega: payload.fecha_estimada_entrega?.trim() ?? '',
    observaciones_publicas: defaultPublicObs,
    observaciones_privadas: payload.observaciones_privadas.trim(),
    fecha_ultima_actualizacion: nowIso,
  };
  db.reparaciones.push(reparacion);

  if (initialState !== 'Vehículo recibido') {
    db.historial_estados.push({
      id: generateId('his'),
      reparacion_id: reparacion.id,
      estado: 'Vehículo recibido',
      fecha: entradaIso,
      observacion: 'Alta de vehículo registrada en recepción.',
      observacion_publica: 'Vehículo recepcionado en nuestras instalaciones.',
      autor: 'Recepción Taller',
    });
  }

  db.historial_estados.push({
    id: generateId('his'),
    reparacion_id: reparacion.id,
    estado: initialState,
    fecha: nowIso,
    observacion: payload.observaciones_privadas.trim() || `Estado inicial: ${initialState}`,
    observacion_publica: defaultPublicObs,
    autor: 'Recepción Taller',
  });

  const cfg = db.configuracion_taller;
  const template =
    cfg.plantillas_mensajes[initialState] || DEFAULT_MESSAGE_TEMPLATES[initialState];
  const mensaje = renderTemplate(template, {
    taller: cfg.nombre_taller,
    marca: vehiculo.marca,
    modelo: vehiculo.modelo,
    matricula: vehiculo.matricula,
    cliente: cliente.nombre,
    codigo: reparacion.codigo_seguimiento,
  });

  const isPriority = initialState === 'Listo para recoger';
  const notif: Notificacion = {
    id: generateId('not'),
    reparacion_id: reparacion.id,
    matricula: vehiculo.matricula,
    vehiculo_texto: `${vehiculo.marca} ${vehiculo.modelo}`,
    destinatario: cliente.nombre,
    telefono_destinatario: cliente.telefono,
    email_destinatario: cliente.email,
    canal: payload.canal_preferido || 'Centro Simulado',
    tipo: isPriority ? 'Prioritaria' : 'Informativa',
    estado_relacionado: initialState,
    mensaje,
    fecha: nowIso,
    estado_envio: 'Simulado (Demo)',
    prioritaria: isPriority,
    leida: false,
  };
  db.notificaciones.unshift(notif);

  saveStorage(db);
  const full = hydrateRepair(db, reparacion);
  if (!full) throw new Error('Error al hidratar la reparación recién creada');
  return full;
}

export interface UpdateStatusPayload {
  nuevo_estado: RepairStatus;
  observacion_publica?: string;
  observacion_privada?: string;
  fecha_estimada_entrega?: string;
  autor?: string;
  canal?: NotificationChannel;
  generar_notificacion?: boolean;
}

export function updateRepairStatus(
  id: string,
  payload: UpdateStatusPayload
): RepairFullRecord | null {
  const db = ensureStorage();
  const rep = db.reparaciones.find((r) => r.id === id);
  if (!rep) return null;

  const vehiculo = db.vehiculos.find((v) => v.id === rep.vehiculo_id);
  const cliente = vehiculo
    ? db.clientes.find((c) => c.id === vehiculo.cliente_id)
    : undefined;
  if (!vehiculo || !cliente) return null;

  const nowIso = new Date().toISOString();
  const previousState = rep.estado_actual;
  rep.estado_actual = payload.nuevo_estado;
  rep.fecha_ultima_actualizacion = nowIso;

  if (payload.observacion_publica !== undefined) {
    rep.observaciones_publicas = payload.observacion_publica.trim();
  }
  if (payload.observacion_privada !== undefined) {
    rep.observaciones_privadas = payload.observacion_privada.trim();
  }
  if (payload.fecha_estimada_entrega !== undefined) {
    rep.fecha_estimada_entrega = payload.fecha_estimada_entrega.trim();
  }

  db.historial_estados.push({
    id: generateId('his'),
    reparacion_id: rep.id,
    estado: payload.nuevo_estado,
    fecha: nowIso,
    observacion:
      payload.observacion_privada?.trim() ||
      `Cambio de estado: ${previousState} → ${payload.nuevo_estado}`,
    observacion_publica:
      payload.observacion_publica?.trim() ||
      rep.observaciones_publicas ||
      payload.nuevo_estado,
    autor: payload.autor?.trim() || 'Jefe de Taller',
  });

  if (payload.generar_notificacion !== false) {
    const cfg = db.configuracion_taller;
    const template =
      cfg.plantillas_mensajes[payload.nuevo_estado] ||
      DEFAULT_MESSAGE_TEMPLATES[payload.nuevo_estado];

    const mensaje = renderTemplate(template, {
      taller: cfg.nombre_taller,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      matricula: vehiculo.matricula,
      cliente: cliente.nombre,
      codigo: rep.codigo_seguimiento,
    });

    const isPriority = payload.nuevo_estado === 'Listo para recoger';
    const isAuth =
      payload.nuevo_estado === 'Esperando autorización del cliente' ||
      payload.nuevo_estado === 'Presupuesto pendiente de aprobación';
    const tipo: NotificationType = isPriority
      ? 'Prioritaria'
      : isAuth
        ? 'Autorización'
        : 'Informativa';

    db.notificaciones.unshift({
      id: generateId('not'),
      reparacion_id: rep.id,
      matricula: vehiculo.matricula,
      vehiculo_texto: `${vehiculo.marca} ${vehiculo.modelo}`,
      destinatario: cliente.nombre,
      telefono_destinatario: cliente.telefono,
      email_destinatario: cliente.email,
      canal: payload.canal || 'Centro Simulado',
      tipo,
      estado_relacionado: payload.nuevo_estado,
      mensaje,
      fecha: nowIso,
      estado_envio: 'Simulado (Demo)',
      prioritaria: isPriority,
      leida: false,
    });
  }

  saveStorage(db);
  return hydrateRepair(db, rep);
}

export interface UpdateRepairDetailsPayload {
  matricula?: string;
  marca?: string;
  modelo?: string;
  nombre_cliente?: string;
  telefono_cliente?: string;
  email_cliente?: string;
  descripcion_averia?: string;
  fecha_estimada_entrega?: string;
  observaciones_publicas?: string;
  observaciones_privadas?: string;
}

export function updateRepairDetails(
  id: string,
  payload: UpdateRepairDetailsPayload
): RepairFullRecord | null {
  const db = ensureStorage();
  const rep = db.reparaciones.find((r) => r.id === id);
  if (!rep) return null;
  const vehiculo = db.vehiculos.find((v) => v.id === rep.vehiculo_id);
  if (!vehiculo) return null;
  const cliente = db.clientes.find((c) => c.id === vehiculo.cliente_id);
  if (!cliente) return null;

  if (payload.matricula !== undefined && payload.matricula.trim()) {
    vehiculo.matricula = normalizePlate(payload.matricula);
  }
  if (payload.marca !== undefined && payload.marca.trim()) {
    vehiculo.marca = payload.marca.trim();
  }
  if (payload.modelo !== undefined && payload.modelo.trim()) {
    vehiculo.modelo = payload.modelo.trim();
  }
  if (payload.nombre_cliente !== undefined && payload.nombre_cliente.trim()) {
    cliente.nombre = payload.nombre_cliente.trim();
  }
  if (payload.telefono_cliente !== undefined && payload.telefono_cliente.trim()) {
    cliente.telefono = payload.telefono_cliente.trim();
  }
  if (payload.email_cliente !== undefined) {
    cliente.email = payload.email_cliente.trim();
  }
  if (payload.descripcion_averia !== undefined) {
    rep.descripcion_averia = payload.descripcion_averia.trim();
  }
  if (payload.fecha_estimada_entrega !== undefined) {
    rep.fecha_estimada_entrega = payload.fecha_estimada_entrega.trim();
  }
  if (payload.observaciones_publicas !== undefined) {
    rep.observaciones_publicas = payload.observaciones_publicas.trim();
  }
  if (payload.observaciones_privadas !== undefined) {
    rep.observaciones_privadas = payload.observaciones_privadas.trim();
  }

  rep.fecha_ultima_actualizacion = new Date().toISOString();
  saveStorage(db);
  return hydrateRepair(db, rep);
}

export function getClientsWithDetails(): ClientWithDetails[] {
  const db = ensureStorage();
  return db.clientes
    .map((cliente) => {
      const vehiculos = db.vehiculos.filter((v) => v.cliente_id === cliente.id);
      const vehIds = new Set(vehiculos.map((v) => v.id));
      const reparaciones = db.reparaciones
        .filter((r) => vehIds.has(r.vehiculo_id))
        .sort(
          (a, b) =>
            new Date(b.fecha_entrada).getTime() - new Date(a.fecha_entrada).getTime()
        )
        .map((reparacion) => ({
          reparacion,
          vehiculo: vehiculos.find((v) => v.id === reparacion.vehiculo_id)!,
        }));
      return { cliente, vehiculos, reparaciones };
    })
    .sort((a, b) => a.cliente.nombre.localeCompare(b.cliente.nombre, 'es'));
}

export function getNotifications(): Notificacion[] {
  const db = ensureStorage();
  return [...db.notificaciones].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
}

export function markNotificationRead(id: string): Notificacion | null {
  const db = ensureStorage();
  const notif = db.notificaciones.find((n) => n.id === id);
  if (!notif) return null;
  notif.leida = true;
  saveStorage(db);
  return notif;
}

export function markAllNotificationsRead(): void {
  const db = ensureStorage();
  for (const n of db.notificaciones) {
    n.leida = true;
  }
  saveStorage(db);
}

export function getWorkshopConfig(): ConfiguracionTaller {
  const db = ensureStorage();
  return db.configuracion_taller;
}

export function updateWorkshopConfig(
  updates: Partial<ConfiguracionTaller>
): ConfiguracionTaller {
  const db = ensureStorage();
  db.configuracion_taller = {
    ...db.configuracion_taller,
    ...updates,
    plantillas_mensajes: {
      ...db.configuracion_taller.plantillas_mensajes,
      ...(updates.plantillas_mensajes ?? {}),
    },
  };
  saveStorage(db);
  return db.configuracion_taller;
}

export function resetDemoDatabase(): DatabaseSchema {
  const fresh = createSeedDatabase();
  saveStorage(fresh);
  return fresh;
}
