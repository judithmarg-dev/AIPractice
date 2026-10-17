// Checks the pure calculations and the order/stock flow against the reference numbers of
// specs/panel-propietario-2026-10-17/validation.md. Run with `pnpm verify`.
import { store } from '@/store'
import { addLine, loadForEdit, updateLine } from '@/store/slices/orderSlice'
import { updateProduct } from '@/store/slices/inventorySlice'
import { cancelQueued, chargeQueued, submitDraft } from '@/store/orderActions'
import { computeTotals, describeLine, makeBuildLine, stockDelta, toSnapshot } from '@/lib/orderMath'
import { formatMoney, parseMoneyInput } from '@/lib/money'
import { toCsv } from '@/lib/csv'
import { aggregatePeriod, indexOrders, peakHour, serviceSplit, starFlavor, stockAlerts, supplySignals, variation } from '@/lib/dashboard'
import { periodContaining, periodLabel, shiftPeriod, canGoNext } from '@/lib/period'
import { validateCategoryName } from '@/lib/validation'
import { migrateLegacyItems, SEED_CATEGORIES, SEED_OPTIONS } from '@/store/seed'
import { migrate } from '@/store/persistence'
import { generateDemoOrders } from '@/lib/demo'
import type { Order, OrderLine, Product } from '@/types/models'

let failures = 0
let passes = 0
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) passes++
  else {
    failures++
    console.error(`✗ ${name}\n    esperado: ${JSON.stringify(expected)}\n    obtenido: ${JSON.stringify(actual)}`)
  }
}

// ── §2 Cálculo de referencia ────────────────────────────────────────────────
const pist = { id: 'pistacho-siciliano', name: 'Pistacho Siciliano', priceCents: 260, costCents: 95 }
const dulce = { id: 'dulce-de-leche', name: 'Dulce de Leche', priceCents: 260, costCents: 80 }
const barq = SEED_OPTIONS.find((o) => o.id === 'barquillo-dulce')!
const salsa = SEED_OPTIONS.find((o) => o.id === 'salsa-chocolate')!
const nueces = SEED_OPTIONS.find((o) => o.id === 'nueces')!
const settings = { ivaPercent: 10, deliverySurchargeCents: 30 }

const ref = (qty: number, withNuts = true) =>
  makeBuildLine({
    lineId: 'l1',
    categoryId: 'artesanal',
    scoops: [toSnapshot(pist), toSnapshot(dulce)],
    container: toSnapshot(barq),
    extras: [toSnapshot(salsa)],
    toppings: withNuts ? [toSnapshot(nueces)] : [],
    qty,
  })
check('precio unitario de referencia', ref(1).unitPriceCents, 640)
check('sin nueces baja a 6.10', ref(1, false).unitPriceCents, 610)
check('1 presencial', computeTotals([ref(1)], 'presencial', settings), { subtotalCents: 640, surchargeCents: 0, ivaCents: 64, totalCents: 704, itemCount: 1 })
check('2 presencial', computeTotals([ref(2)], 'presencial', settings), { subtotalCents: 1280, surchargeCents: 0, ivaCents: 128, totalCents: 1408, itemCount: 2 })
check('2 delivery', computeTotals([ref(2)], 'delivery', settings), { subtotalCents: 1280, surchargeCents: 30, ivaCents: 131, totalCents: 1441, itemCount: 2 })
check('recargo solo con líneas', computeTotals([], 'delivery', settings).surchargeCents, 0)
check('texto de la línea', describeLine(ref(2)), {
  title: 'Helado artesanal · 2 bolas',
  detail: 'Pistacho Siciliano + Dulce de Leche • Barquillo dulce • Salsa de chocolate • Nueces',
})
check('formato de dinero', [formatMoney(184550), formatMoney(-1230), formatMoney(5)], ['$1,845.50', '-$12.30', '$0.05'])

// ── Opciones: validación de precio ───────────────────────────────────────────
check('precio 0.30', parseMoneyInput('0.30'), { ok: true, cents: 30 })
check('precio negativo', parseMoneyInput('-1').ok, false)
check('tres decimales', parseMoneyInput('1.234').ok, false)

// ── Categorías ────────────────────────────────────────────────────────────────
const cats = [...SEED_CATEGORIES, { id: 'postres', name: 'Postres', archived: false }]
check('duplicado exacto', validateCategoryName('Postres', cats) !== null, true)
check('duplicado minúsculas', validateCategoryName('postres', cats) !== null, true)
check('duplicado con tilde', validateCategoryName('Póstres', cats) !== null, true)
check('1 carácter', validateCategoryName('P', cats) !== null, true)
check('31 caracteres', validateCategoryName('x'.repeat(31), cats) !== null, true)
check('nombre válido', validateCategoryName('Tortas', cats), null)

// ── Migración ────────────────────────────────────────────────────────────────
const migrated = migrateLegacyItems(
  [{ id: 'x', name: 'Viejo', category: 'desconocida', price: 2.6, image_placeholder: '#fff', inventory_count: 3, container: 'Vaso Gigante', archived: false, created_at: '2026-01-01T00:00:00Z' }],
  SEED_CATEGORIES,
  SEED_OPTIONS
)
check('categoría desconocida → Otros', migrated.products[0].categoryId, 'otros')
check('crea Otros', migrated.categories.some((c) => c.id === 'otros' && c.name === 'Otros'), true)
check('precio a centavos', migrated.products[0].priceCents, 260)
check('stock camelCase', migrated.products[0].stock, 3)
const env = migrated.options.find((o) => o.id === migrated.products[0].defaultContainerId)
check('envase de texto → catálogo con precio 0', [env?.kind, env?.name, env?.priceCents], ['envase', 'Vaso Gigante', 0])
const v0 = migrate({ inventory: [{ id: 'y', name: 'Y', category: 'paleta', price: 3, inventory_count: 1 }] })
check('estado v0 migra', [v0?.inventory[0].priceCents, v0?.inventory[0].categoryId, v0?.settings.ivaPercent], [300, 'paleta', 10])

// ── Ciclo de vida del pedido y stock (§7) ────────────────────────────────────
const stockOf = (id: string) => store.getState().inventory.find((p) => p.id === id)!.stock
const pistacho = store.getState().inventory.find((p) => p.id === 'pistacho-siciliano')!
check('stock inicial de Pistacho', pistacho.stock, 10)
const twoPist = makeBuildLine({ lineId: 'a', categoryId: 'artesanal', scoops: [toSnapshot(pistacho), toSnapshot(pistacho)], extras: [], toppings: [], qty: 1 })
store.dispatch(addLine(twoPist))
const number1 = store.getState().order.nextNumber
const queued = store.dispatch(submitDraft('queue'))
check('guardar en la cola', queued.ok, true)
check('stock baja a 8', stockOf('pistacho-siciliano'), 8)
check('número consecutivo', store.getState().order.nextNumber, number1 + 1)
const queuedOrder = queued.ok ? queued.order : (null as unknown as Order)
store.dispatch(updateProduct({ ...pistacho, stock: stockOf('pistacho-siciliano'), priceCents: 999 }))
check('instantánea conserva el precio', store.getState().order.orders[0].subtotalCents, 520)
store.dispatch(loadForEdit(queuedOrder.id))
const edited: OrderLine = { ...twoPist, build: { ...twoPist.build!, scoops: [twoPist.build!.scoops[0]] }, unitPriceCents: 260 }
store.dispatch(updateLine(edited))
const saved = store.dispatch(submitDraft('queue'))
check('guardar edición', saved.ok, true)
check('quitar una bola devuelve 1', stockOf('pistacho-siciliano'), 9)
const after = store.getState().order.orders[0]
check('edición conserva número y hora', [after.number, after.createdAt], [queuedOrder.number, queuedOrder.createdAt])
store.dispatch(cancelQueued(after.id))
check('cancelar devuelve todo', stockOf('pistacho-siciliano'), 10)

store.dispatch(addLine({ ...twoPist, lineId: 'b' }))
const q2 = store.dispatch(submitDraft('queue'))
const before = stockOf('pistacho-siciliano')
if (q2.ok) store.dispatch(chargeQueued(q2.order.id))
check('cobrar desde la cola no cambia stock', stockOf('pistacho-siciliano'), before)

const chocolate = store.getState().inventory.find((p) => p.id === 'chocolate-intenso')!
store.dispatch(addLine(makeBuildLine({ lineId: 'c', categoryId: 'artesanal', scoops: [toSnapshot(chocolate)], extras: [], toppings: [], qty: 1 })))
const blocked = store.dispatch(submitDraft('charge'))
check('cobrar sin stock se bloquea', blocked.ok, false)
check('mensaje indica el producto', !blocked.ok && blocked.error.includes('Chocolate Intenso'), true)
check('delta de stock', stockDelta([twoPist], []), { 'pistacho-siciliano': 2 })

// ── Dashboard (§9) ───────────────────────────────────────────────────────────
const week = periodContaining('semana', new Date(2026, 9, 17, 12))
check('etiqueta de semana', periodLabel(week), 'Semana del 12 al 18 de octubre de 2026')
check('semana cruzando mes', periodLabel(periodContaining('semana', new Date(2026, 9, 1))), 'Semana del 28 de septiembre al 4 de octubre de 2026')
check('mes', periodLabel(periodContaining('mes', new Date(2026, 9, 17))), 'Octubre de 2026')
check('no se avanza más allá del actual', canGoNext(week, new Date(2026, 9, 17, 12)), false)
check('anterior y siguiente vuelve', shiftPeriod(shiftPeriod(week, -1), 1).start.getTime(), week.start.getTime())

const line = (cost: number, price: number): OrderLine => ({ lineId: crypto.randomUUID(), productId: 'p', productName: 'P', categoryId: 'paleta', qty: 1, unitPriceCents: price, unitCostCents: cost })
const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m).toISOString()
const mk = (o: Partial<Order>): Order => ({ id: crypto.randomUUID(), number: 1, status: 'cobrado', mode: 'presencial', lines: [], createdAt: at(13, 12), chargedAt: at(13, 12), subtotalCents: 0, surchargeCents: 0, ivaCents: 0, totalCents: 0, ...o })
const A = mk({ lines: [line(400, 1000)], subtotalCents: 1000, ivaCents: 100, totalCents: 1100 })
const B = mk({ mode: 'delivery', lines: [line(200, 500)], subtotalCents: 500, surchargeCents: 30, ivaCents: 53, totalCents: 583, createdAt: at(14, 18), chargedAt: at(14, 18) })
const agg = aggregatePeriod(indexOrders([A, B]), week)
check('ingresos $15.30', agg.revenueCents, 1530)
check('cobrado con IVA $16.83', agg.chargedWithIvaCents, 1683)
check('ganancia $9.30', agg.revenueCents - agg.costCents, 930)
check('órdenes registradas', [agg.registered, agg.registeredCharged, agg.registeredPending], [2, 2, 0])
check('ticket promedio $7.65', Math.round(agg.revenueCents / agg.chargedCount), 765)
const split = serviceSplit(agg)
check('gana presencial 65 % / 50 %', [split.winner, split.revenuePct, split.ordersPct], ['presencial', 65, 50])
check('costos completos', agg.costIncomplete, false)
const noCost = aggregatePeriod(indexOrders([mk({ lines: [{ ...line(0, 100), unitCostCents: undefined }], subtotalCents: 100 })]), week)
check('costos incompletos', noCost.costIncomplete, true)
check('variación +20 %', variation(1200, 1000), { kind: 'pct', value: 20 })
check('variación Nuevo', variation(500, 0), { kind: 'new' })

const hourly = aggregatePeriod(indexOrders([mk({ createdAt: at(15, 12, 10) }), mk({ createdAt: at(15, 12, 40) }), mk({ createdAt: at(15, 13, 5) })]), week).hourly
check('hora pico 12:00 con 2', peakHour(hourly), { hour: 12, count: 2 })
const tie = new Array(24).fill(0)
tie[15] = 3
tie[11] = 3
check('empate: la más temprana', peakHour(tie)?.hour, 11)

const scoopLine = (id: string, name: string, qty: number) =>
  makeBuildLine({ lineId: crypto.randomUUID(), categoryId: 'artesanal', scoops: [{ id, name, priceCents: 260 }], extras: [], toppings: [], qty })
const starAgg = aggregatePeriod(indexOrders([mk({ lines: [scoopLine('p1', 'Pistacho', 6), scoopLine('p2', 'Dulce', 4), scoopLine('p3', 'Mocha', 2)] })]), week)
const prods = (['p1', 'p2', 'p3'] as const).map((id) => ({ id, name: id, color: '#000' }) as Product)
const star = starFlavor(starAgg, prods)
check('sabor estrella 50 %', [star?.podium[0].productId, star?.podium[0].pct, star?.podium.length], ['p1', 50, 3])

const product = (id: string, stock: number) => ({ id, name: id, stock, categoryId: 'paleta', archived: false }) as Product
const sold = (id: string, units: number) => mk({ lines: [{ ...line(0, 100), productId: id, qty: units }], chargedAt: at(16, 10) })
const sig = supplySignals(indexOrders([sold('a', 14), sold('b', 14), sold('c', 14)]), [product('a', 5), product('b', 1), product('c', 6), product('d', 9)], new Date(2026, 9, 17).getTime())
const byId = Object.fromEntries(sig.map((s) => [s.productId, [s.days, s.level]]))
check('cobertura 2.5 pronto', byId.a, [2.5, 'pronto'])
check('cobertura 0.5 hoy', byId.b, [0.5, 'hoy'])
check('cobertura 3 ok', byId.c, [3, 'ok'])
check('sin consumo no aparece', byId.d, undefined)
check('alertas de stock', stockAlerts([product('x', 0), product('y', 3), product('z', 5)], 5).map((a) => [a.productId, a.level]), [['x', 'agotado'], ['y', 'bajo']])

// ── CSV ───────────────────────────────────────────────────────────────────────
const csv = toCsv(['producto', 'total'], [['=1+1', -3], ['Café, "frío"', 2]])
check('BOM', csv.charCodeAt(0), 0xfeff)
check('escape de fórmulas y comillas', csv.slice(1), "producto,total\r\n'=1+1,-3\r\n\"Café, \"\"frío\"\"\",2\r\n")

// ── Datos de demostración ─────────────────────────────────────────────────────
const s = store.getState()
const demoArgs = { products: s.inventory, categories: s.categories, options: s.options, settings: s.settings, firstNumber: 5000, now: new Date(2026, 9, 17, 16) }
const demo = generateDemoOrders(demoArgs)
const days = new Set(demo.orders.map((o) => o.createdAt.slice(0, 10))).size
check('al menos 60 días', days >= 60, true)
check('todas cobradas y demo', demo.orders.every((o) => o.status === 'cobrado' && o.demo), true)
check('ambos servicios', new Set(demo.orders.map((o) => o.mode)).size, 2)
check('determinista', generateDemoOrders(demoArgs).orders.length, demo.orders.length)
check('tamaño razonable (< 2.5 MB)', JSON.stringify(demo.orders).length < 2_500_000, true)

const t0 = performance.now()
const big = indexOrders(Array.from({ length: 5 }, () => demo.orders).flat().slice(0, 10000))
for (const k of ['dia', 'semana', 'mes'] as const) aggregatePeriod(big, periodContaining(k, new Date(2026, 9, 17)))
check('10 000 órdenes en < 300 ms', performance.now() - t0 < 300, true)

console.log(`\n${passes} comprobaciones correctas, ${failures} fallidas (${demo.orders.length} pedidos demo, ${days} días).`)
if (failures > 0) process.exit(1)
