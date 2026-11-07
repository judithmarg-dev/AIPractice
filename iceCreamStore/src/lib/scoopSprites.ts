// Scoop pictures come from two sprite sheets (assets/scoops1.jpeg, scoops2.jpeg), 5 columns × 2 rows each.
// A product stores only the sprite id ("s1-7" = sheet 1, cell 7); the same flavor catalog feeds both
// presentations (Porciones and Por peso), so a flavor is never duplicated per presentation.
import sheet1 from '@/assets/scoops1.jpeg'
import sheet2 from '@/assets/scoops2.jpeg'
import type { Product } from '@/types/models'

export const SHEET_SIZE = { w: 1408, h: 768 }
/** Crop box around one scoop (includes its soft shadow, excludes the printed label). */
export const CELL = { w: 250, h: 230 }

const SHEETS = { 1: sheet1, 2: sheet2 } as const
const COLS_X: Record<1 | 2, number[]> = {
  1: [162, 432, 703, 975, 1247],
  2: [155, 430, 703, 978, 1253],
}
const ROWS_Y: Record<1 | 2, number[]> = { 1: [65, 405], 2: [50, 410] }

export interface ScoopSprite {
  id: string
  /** Flavor shown on the sheet; used as a hint in the product form. */
  label: string
  sheet: 1 | 2
  url: string
  /** Top-left corner of the crop in sheet pixels. */
  x: number
  y: number
}

const LABELS: Record<1 | 2, string[]> = {
  1: ['Fresa', 'Copoazú', 'Chocolate', 'Vainilla', 'Chirimoya', 'Mango', 'Maracuyá', 'Pistacho', 'Menta con chispas', 'Coco'],
  2: ['Lima', 'Caramelo', 'Galleta oscura', 'Naranja', 'Azul hielo', 'Turquesa', 'Limón', 'Uva', 'Stracciatella', 'Ron con pasas'],
}

export const SCOOP_SPRITES: ScoopSprite[] = ([1, 2] as const).flatMap((sheet) =>
  LABELS[sheet].map((label, i) => ({
    id: `s${sheet}-${i}`,
    label,
    sheet,
    url: SHEETS[sheet],
    x: COLS_X[sheet][i % 5] - CELL.w / 2,
    y: ROWS_Y[sheet][Math.floor(i / 5)],
  }))
)

const BY_ID = new Map(SCOOP_SPRITES.map((s) => [s.id, s]))

export const isSpriteId = (v: unknown): v is string => typeof v === 'string' && BY_ID.has(v)

/** Flavors saved before sprites existed keep working through this fallback. */
const LEGACY_SPRITE: Record<string, string> = {
  'fresa-del-huerto': 's1-0',
  'chocolate-intenso': 's1-2',
  'pistacho-siciliano': 's1-7',
  'dulce-de-leche': 's2-1',
}

export function spriteOf(product: Pick<Product, 'id' | 'sprite'>): ScoopSprite | undefined {
  return BY_ID.get(product.sprite ?? '') ?? BY_ID.get(LEGACY_SPRITE[product.id] ?? '')
}

// ── Transparent cut-outs ─────────────────────────────────────────────────────────
// The sheets are JPEGs on a white backdrop. Each scoop is cropped once on a canvas and the backdrop
// (white connected to the crop's border) is made transparent, so scoops can overlap on the cone.
const cache = new Map<string, Promise<string>>()
const images = new Map<string, Promise<HTMLImageElement>>()

function loadImage(url: string): Promise<HTMLImageElement> {
  let p = images.get(url)
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
    images.set(url, p)
  }
  return p
}

const BACKDROP = 238 // min(r,g,b) at or above this counts as backdrop
const FEATHER = 26
/** Nearly white scoops (coconut) would be hollowed out; they only lose the pure-white backdrop. */
const STRICT = new Set(['s1-9'])
/** Every scoop is scaled to this width and sits on the same baseline, whatever its sheet. */
const TARGET_W = 214
const BASELINE = 214

function cutOut(img: HTMLImageElement, sprite: ScoopSprite): string {
  const canvas = document.createElement('canvas')
  canvas.width = CELL.w
  canvas.height = CELL.h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return sprite.url
  ctx.drawImage(img, sprite.x, sprite.y, CELL.w, CELL.h, 0, 0, CELL.w, CELL.h)
  const data = ctx.getImageData(0, 0, CELL.w, CELL.h)
  const px = data.data
  const n = CELL.w * CELL.h
  const backdrop = STRICT.has(sprite.id) ? 252 : BACKDROP
  const feather = STRICT.has(sprite.id) ? 6 : FEATHER
  const lightness = (i: number) => Math.min(px[i * 4], px[i * 4 + 1], px[i * 4 + 2])
  // Sheet 2 comes with a cast shadow: gray, light and unsaturated, so it is part of the backdrop.
  const isShadow = (i: number) =>
    sprite.sheet === 2 && Math.max(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]) - lightness(i) < 22 && lightness(i) > 120
  const seen = new Uint8Array(n)
  const stack: number[] = []
  const push = (i: number) => {
    if (!seen[i] && (lightness(i) >= backdrop - feather || isShadow(i))) {
      seen[i] = 1
      stack.push(i)
    }
  }
  for (let x = 0; x < CELL.w; x++) {
    push(x)
    push((CELL.h - 1) * CELL.w + x)
  }
  for (let y = 0; y < CELL.h; y++) {
    push(y * CELL.w)
    push(y * CELL.w + CELL.w - 1)
  }
  while (stack.length > 0) {
    const i = stack.pop()!
    const x = i % CELL.w
    if (x > 0) push(i - 1)
    if (x < CELL.w - 1) push(i + 1)
    if (i >= CELL.w) push(i - CELL.w)
    if (i < n - CELL.w) push(i + CELL.w)
  }
  for (let i = 0; i < n; i++) {
    if (!seen[i]) continue
    // Fully light pixels vanish; the feather band keeps a soft edge.
    const alpha = isShadow(i) ? 0 : Math.max(0, Math.min(1, (backdrop - lightness(i)) / feather))
    px[i * 4 + 3] = Math.round(alpha * 255)
  }
  ctx.putImageData(data, 0, 0)
  return normalize(canvas)
}

/** Trims the cut-out to its visible pixels and rescales it to TARGET_W, centered on the baseline. */
function normalize(source: HTMLCanvasElement): string {
  const ctx = source.getContext('2d', { willReadFrequently: true })!
  const { data } = ctx.getImageData(0, 0, CELL.w, CELL.h)
  let minX = CELL.w, maxX = -1, minY = CELL.h, maxY = -1
  for (let y = 0; y < CELL.h; y++) {
    for (let x = 0; x < CELL.w; x++) {
      if (data[(y * CELL.w + x) * 4 + 3] > 140) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) return source.toDataURL('image/png')
  const w = maxX - minX + 1
  const h = maxY - minY + 1
  const scale = TARGET_W / w
  const out = document.createElement('canvas')
  out.width = CELL.w
  out.height = CELL.h
  const octx = out.getContext('2d')!
  octx.imageSmoothingQuality = 'high'
  const dw = w * scale
  const dh = h * scale
  octx.drawImage(source, minX, minY, w, h, (CELL.w - dw) / 2, BASELINE - dh, dw, dh)
  return out.toDataURL('image/png')
}

/** Data URL of the scoop with a transparent background (cached per sprite). */
export function loadScoopUrl(sprite: ScoopSprite): Promise<string> {
  let p = cache.get(sprite.id)
  if (!p) {
    p = loadImage(sprite.url).then((img) => cutOut(img, sprite)).catch(() => sprite.url)
    cache.set(sprite.id, p)
  }
  return p
}
