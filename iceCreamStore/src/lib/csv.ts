// CSV writer (RF-7.8): UTF-8 with BOM, comma separator, formula-injection guard on text cells.

/** A number already formatted for the file ("12.80"); written as is, never escaped. */
export class CsvNumber {
  readonly text: string
  constructor(text: string) {
    this.text = text
  }
}

export type CsvCell = string | number | CsvNumber | null | undefined

function cell(value: CsvCell): string {
  if (value === null || value === undefined) return ''
  if (value instanceof CsvNumber) return value.text
  if (typeof value === 'number') return String(value)
  // Text that a spreadsheet would read as a formula gets a leading apostrophe.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export function toCsv(headers: string[], rows: CsvCell[][]): string {
  return '﻿' + [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n'
}

export function downloadCsv(filename: string, csv: string): void {
  downloadBlob(filename, new Blob([csv], { type: 'text/csv;charset=utf-8' }))
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
