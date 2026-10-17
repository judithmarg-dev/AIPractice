// All money is integer cents. These are the only conversions to and from dollars.

/** "1234.5" style decimal string without currency symbol or grouping: "1234.50". */
export function centsToDecimal(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(Math.round(cents))
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`
}

/** "$1,845.50" — the single money format of the app (D8). */
export function formatMoney(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(Math.round(cents))
  const whole = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sign}$${whole}.${String(abs % 100).padStart(2, '0')}`
}

/** "+$0.50", or "Incluido" when the price is 0. */
export function formatOptionPrice(cents: number): string {
  return cents === 0 ? 'Incluido' : `+${formatMoney(cents)}`
}

export function toCents(dollars: number): number {
  return Math.round(dollars * 100)
}

/** `pct` percent of `cents`, rounded to the nearest cent. */
export function percentOf(cents: number, pct: number): number {
  return Math.round((cents * pct) / 100)
}

export type MoneyParse = { ok: true; cents: number } | { ok: false; error: string }

/** Parses a user-typed amount ("2.6", "2,60", "$3") into cents: ≥ 0 and at most two decimals. */
export function parseMoneyInput(text: string): MoneyParse {
  const clean = text.trim().replace(/^\$/, '').replace(',', '.')
  if (clean === '') return { ok: false, error: 'Ingresa un importe.' }
  if (clean.startsWith('-')) return { ok: false, error: 'El importe no puede ser negativo.' }
  const match = /^(\d+)(?:\.(\d*))?$/.exec(clean)
  if (!match) return { ok: false, error: 'Usa solo números, por ejemplo 2.60.' }
  const decimals = match[2] ?? ''
  if (decimals.length > 2) return { ok: false, error: 'Usa como máximo dos decimales.' }
  const cents = parseInt(match[1], 10) * 100 + parseInt(decimals.padEnd(2, '0') || '0', 10)
  return { ok: true, cents }
}

/** Cents as the text an input should show ("2.60"), or "" when undefined. */
export function centsToInput(cents: number | undefined): string {
  return cents === undefined ? '' : centsToDecimal(cents)
}
