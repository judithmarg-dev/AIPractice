// Shared Spanish copy. Screen-specific text stays in its component; anything repeated lives here.
import type { OptionKind, OrderStatus, ServiceMode } from '@/types/models'

export const STORE_NAME = 'IceCreamStore'

export const T = {
  appTitle: 'IceCreamStore · Panel del propietario',
  addToOrder: 'Agregar al pedido',
  saveChanges: 'Guardar cambios',
  cancel: 'Cancelar',
  close: 'Cerrar',
  confirm: 'Confirmar',
  delete: 'Eliminar',
  edit: 'Editar',
  save: 'Guardar',
  create: 'Crear',
  soldOut: 'Agotado',
  included: 'Incluido',
  noContainer: 'Sin envase',
  maxReached: 'Máximo alcanzado',
  buildLineTitle: 'Helado artesanal',
  required: 'Este campo es obligatorio.',
  demoNotice: 'Mostrando datos de demostración',
  loadDemo: 'Cargar datos de demostración',
  clearDemo: 'Borrar datos de demostración',
  storageFailed:
    'No se pudo guardar en este navegador. Los cambios siguen activos, pero se perderán al recargar.',
} as const

export const MODE_LABEL: Record<ServiceMode, string> = {
  presencial: 'Presencial',
  delivery: 'Delivery',
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  por_cobrar: 'Por cobrar',
  cobrado: 'Cobrado',
  cancelado: 'Cancelado',
}

export const OPTION_KIND_LABEL: Record<OptionKind, { singular: string; plural: string }> = {
  envase: { singular: 'Envase', plural: 'Envases' },
  extra: { singular: 'Extra', plural: 'Extras' },
  topping: { singular: 'Topping', plural: 'Toppings' },
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

/** "hace 12 min", "hace 1 h 5 min". */
export function formatAge(fromIso: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - new Date(fromIso).getTime()) / 60000))
  if (minutes < 1) return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `hace ${h} h` : `hace ${h} h ${m} min`
}

/** 24-hour "13:05". */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Case- and accent-insensitive comparison key. */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
