// Form validation shared by the staff screens. Messages are user-facing Spanish.
import { normalizeName } from '@/lib/texts'

/** RF-1.2: 2–30 characters, unique ignoring case and accents. */
export function validateCategoryName(
  name: string,
  categories: { id: string; name: string; archived: boolean }[],
  excludeId?: string
): string | null {
  const trimmed = name.trim()
  if (trimmed.length < 2 || trimmed.length > 30) return 'El nombre debe tener entre 2 y 30 caracteres.'
  const key = normalizeName(trimmed)
  const clash = categories.find((c) => c.id !== excludeId && normalizeName(c.name) === key)
  if (clash) {
    return clash.archived
      ? `Ya existe una categoría archivada llamada "${clash.name}". Restáurala en lugar de crear otra.`
      : `Ya existe una categoría llamada "${clash.name}".`
  }
  return null
}

export function validateLength(value: string, min: number, max: number, field = 'El nombre'): string | null {
  const n = value.trim().length
  if (n === 0) return `${field} es obligatorio.`
  if (n < min || n > max) return `${field} debe tener entre ${min} y ${max} caracteres.`
  return null
}

/** Whole number in [min, max]; returns the number or an error message. */
export function parseIntInRange(text: string, min: number, max: number): { ok: true; value: number } | { ok: false; error: string } {
  const clean = text.trim()
  if (!/^\d+$/.test(clean)) return { ok: false, error: 'Usa un número entero.' }
  const value = parseInt(clean, 10)
  if (value < min || value > max) return { ok: false, error: `Debe estar entre ${min} y ${max}.` }
  return { ok: true, value }
}

/** Builds a readable id from a name ("Vaso grande" → "vaso-grande-x1y2"). */
export function slugId(name: string): string {
  const base = normalizeName(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'item'
  return `${base}-${crypto.randomUUID().slice(0, 4)}`
}
