import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  Package,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';
import { STATUS_CONFIG } from '../types/domain';
import type { RepairStatus } from '../types/domain';

interface StatusBadgeProps {
  status: RepairStatus;
  compact?: boolean;
}

const TONE_CLASSES = {
  slate: 'bg-slate-100 text-slate-800 border-slate-300',
  amber: 'bg-amber-50 text-amber-800 border-amber-300',
  blue: 'bg-blue-50 text-blue-800 border-blue-300',
  indigo: 'bg-indigo-50 text-indigo-800 border-indigo-300',
  orange: 'bg-orange-50 text-orange-800 border-orange-300',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  teal: 'bg-teal-50 text-teal-800 border-teal-300',
  zinc: 'bg-zinc-100 text-zinc-700 border-zinc-300',
} as const;

function StatusIcon({ status }: { status: RepairStatus }) {
  const cls = 'w-3.5 h-3.5 shrink-0';
  switch (status) {
    case 'Vehículo recibido':
      return <Truck className={cls} aria-hidden="true" />;
    case 'Pendiente de diagnóstico':
      return <Clock className={cls} aria-hidden="true" />;
    case 'Diagnóstico realizado':
      return <ClipboardCheck className={cls} aria-hidden="true" />;
    case 'Presupuesto pendiente de aprobación':
      return <FileText className={cls} aria-hidden="true" />;
    case 'Esperando autorización del cliente':
      return <AlertTriangle className={cls} aria-hidden="true" />;
    case 'Esperando piezas':
      return <Package className={cls} aria-hidden="true" />;
    case 'En reparación':
      return <Wrench className={cls} aria-hidden="true" />;
    case 'En revisión y pruebas':
      return <ShieldCheck className={cls} aria-hidden="true" />;
    case 'Reparación finalizada':
    case 'Listo para recoger':
    case 'Vehículo entregado':
      return <CheckCircle2 className={cls} aria-hidden="true" />;
  }
}

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const toneClass = TONE_CLASSES[cfg.tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${toneClass}`}
    >
      <StatusIcon status={status} />
      <span>{compact ? cfg.shortLabel : cfg.label}</span>
    </span>
  );
}
