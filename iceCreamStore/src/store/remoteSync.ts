// Supabase is the source of truth for the store's data. Redux keeps working as before (reducers
// and thunks are unchanged); this module loads the tables into the store and writes back every
// row that changed. Rows are compared by reference: Redux Toolkit keeps untouched objects identical,
// so only the edited rows are sent.
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Order } from '@/types/models'
import { requireSupabase } from '@/lib/supabase'
import { store, type RootState } from '.'
import type { PersistedState } from './persistence'
import { replacePersisted } from './rootActions'
import { sessionChanged } from './slices/authSlice'
import { setRemoteReady, setSyncError } from './slices/uiSlice'
import {
  bookingFromRow,
  bookingToRow,
  categoryFromRow,
  categoryToRow,
  optionFromRow,
  optionToRow,
  orderFromRow,
  orderToRow,
  productFromRow,
  productToRow,
  settingsFromRow,
  settingsToRow,
} from './remoteRows'

type Row = Record<string, unknown>
type Item = { id: string }

interface Collection {
  table: string
  pick: (state: RootState) => Item[]
  toRow: (item: never) => Row
  /** Visitors without a staff session may insert here (RLS allows it). */
  public?: boolean
}

/** In foreign-key order: upserts run top to bottom, deletes bottom to top. */
const COLLECTIONS: Collection[] = [
  { table: 'categories', pick: (s) => s.categories, toRow: categoryToRow },
  { table: 'options', pick: (s) => s.options, toRow: optionToRow },
  { table: 'products', pick: (s) => s.inventory, toRow: productToRow },
  { table: 'orders', pick: (s) => s.order.orders, toRow: orderToRow },
  { table: 'bookings', pick: (s) => s.bookings.items, toRow: bookingToRow, public: true },
]

const PAGE = 1000
const CHUNK = 500

/** What Supabase holds, as last read or written. Null while pushing is disabled. */
interface Baseline {
  items: Record<string, Item[]>
  settingsKey: string
}

let baseline: Baseline | null = null
let timer: ReturnType<typeof setTimeout> | null = null
let running: Promise<void> | null = null
let dirty = false

const settingsKey = (s: RootState) =>
  JSON.stringify(
    settingsToRow(s.settings, { nextNumber: s.order.nextNumber, demoStockBackup: s.order.demoStockBackup })
  )

const snapshot = (s: RootState): Baseline => ({
  items: Object.fromEntries(COLLECTIONS.map((c) => [c.table, c.pick(s)])),
  settingsKey: settingsKey(s),
})

const errorText = (e: unknown) =>
  e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : String(e)

// ── Read ──────────────────────────────────────────────────────────────────────

async function fetchAll(sb: SupabaseClient, table: string, orderBy: string): Promise<Row[]> {
  const rows: Row[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from(table).select('*').order(orderBy).range(from, from + PAGE - 1)
    if (error) throw error
    rows.push(...(data as Row[]))
    if (data.length < PAGE) return rows
  }
}

/** The database contents as store state, or null when the catalog has not been created yet. */
async function loadRemote(sb: SupabaseClient): Promise<PersistedState | null> {
  const [categories, options, products, orders, bookings, settings] = await Promise.all([
    fetchAll(sb, 'categories', 'sort_order'),
    fetchAll(sb, 'options', 'id'),
    fetchAll(sb, 'products', 'created_at'),
    // RLS returns no rows to visitors without a staff session.
    fetchAll(sb, 'orders', 'created_at'),
    fetchAll(sb, 'bookings', 'created_at'),
    sb.from('store_settings').select('*').eq('id', 1).maybeSingle(),
  ])
  if (settings.error) throw settings.error
  if (categories.length === 0) return null

  // Read after the requests so a draft edited meanwhile is kept.
  const current = store.getState()
  const ordersList: Order[] = orders.map(orderFromRow)
  const saved = settings.data ? settingsFromRow(settings.data as Row) : null
  const highest = ordersList.reduce((max, o) => Math.max(max, o.number), 0)
  const { nextNumber, demoStockBackup, ...storeSettings } = saved ?? {
    ...current.settings,
    nextNumber: current.order.nextNumber,
    demoStockBackup: null,
  }

  return {
    categories: categories.map(categoryFromRow),
    options: options.map(optionFromRow),
    inventory: products.map(productFromRow),
    // Newest first, as bookingsSlice.addBooking keeps them.
    bookings: { items: bookings.map(bookingFromRow).reverse() },
    settings: storeSettings,
    order: {
      ...current.order,
      orders: ordersList,
      nextNumber: Math.max(nextNumber, highest + 1),
      demoStockBackup,
    },
  }
}

/** Replaces the store data with the database contents. */
async function reload(staff: boolean) {
  const sb = requireSupabase()
  if (running) await running
  baseline = null
  try {
    const remote = await loadRemote(sb)
    if (remote) {
      store.dispatch(replacePersisted(remote))
      baseline = snapshot(store.getState())
    } else if (staff) {
      // Empty database: the staff session uploads the seed catalog on the next push.
      baseline = { items: Object.fromEntries(COLLECTIONS.map((c) => [c.table, []])), settingsKey: '' }
      schedule()
    } else {
      // Empty database and no staff session: show the seed catalog, nothing to write.
      baseline = snapshot(store.getState())
    }
    store.dispatch(setSyncError(null))
  } catch (e) {
    // Writing is disabled until a load succeeds, so stale local data never overwrites the database.
    store.dispatch(setSyncError(`No se pudieron leer los datos de Supabase: ${errorText(e)}`))
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────

function diff(prev: Item[], next: Item[]) {
  if (prev === next) return { upserts: [], deletes: [] }
  const before = new Map(prev.map((x) => [x.id, x]))
  const ids = new Set(next.map((x) => x.id))
  return {
    upserts: next.filter((x) => before.get(x.id) !== x),
    deletes: prev.filter((x) => !ids.has(x.id)).map((x) => x.id),
  }
}

const chunks = <T,>(list: T[], size: number) =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size))

async function push() {
  if (!baseline) return
  const sb = requireSupabase()
  const state = store.getState()
  const staff = state.auth.isAuthenticated
  const done = snapshot(state)
  const next: Baseline = { items: { ...baseline.items }, settingsKey: baseline.settingsKey }
  const errors: string[] = []
  const changes = COLLECTIONS.map((c) => ({ c, ...diff(baseline!.items[c.table], done.items[c.table]) }))

  // Each table is committed on its own, so a rejected write does not block the others.
  const failed = new Set<string>()
  if (!staff) {
    // RLS would reject these anyway; skip the request and keep them pending until a staff sign-in.
    for (const { c, upserts, deletes } of changes) {
      if (!c.public && (upserts.length || deletes.length)) {
        failed.add(c.table)
        errors.push(`${c.table}: requiere sesión de staff`)
      }
    }
  }
  for (const { c, upserts } of changes) {
    if (failed.has(c.table)) continue
    for (const part of chunks(upserts, CHUNK)) {
      const rows = part.map((x) => c.toRow(x as never))
      // Visitors may only insert (a new booking); updates need a staff session.
      const { error } = staff ? await sb.from(c.table).upsert(rows) : await sb.from(c.table).insert(rows)
      if (error) {
        failed.add(c.table)
        errors.push(`${c.table}: ${error.message}`)
        break
      }
    }
  }
  if (staff && done.settingsKey !== baseline.settingsKey) {
    const { error } = await sb.from('store_settings').upsert(JSON.parse(done.settingsKey) as Row)
    if (error) errors.push(`store_settings: ${error.message}`)
    else next.settingsKey = done.settingsKey
  }
  for (const { c, deletes } of [...changes].reverse()) {
    if (failed.has(c.table)) continue
    for (const part of chunks(deletes, CHUNK)) {
      const { error } = await sb.from(c.table).delete().in('id', part)
      if (error) {
        failed.add(c.table)
        errors.push(`${c.table}: ${error.message}`)
        break
      }
    }
  }
  for (const { c } of changes) if (!failed.has(c.table)) next.items[c.table] = done.items[c.table]

  baseline = next
  store.dispatch(
    setSyncError(
      errors.length
        ? `No se pudieron guardar los cambios en Supabase${staff ? '' : ' (inicia sesión como staff)'}: ${errors[0]}`
        : null
    )
  )
}

function schedule() {
  if (!timer) timer = setTimeout(run, 300)
}

function run() {
  timer = null
  if (running) {
    dirty = true
    return
  }
  running = push()
    .catch((e) => {
      store.dispatch(setSyncError(`No se pudo conectar con Supabase: ${errorText(e)}`))
    })
    .finally(() => {
      running = null
      if (dirty) {
        dirty = false
        schedule()
      }
    })
}

function hasChanges(state: RootState) {
  if (!baseline) return false
  return (
    COLLECTIONS.some((c) => c.pick(state) !== baseline!.items[c.table]) || settingsKey(state) !== baseline.settingsKey
  )
}

// ── Start ─────────────────────────────────────────────────────────────────────

/** Restores the Supabase session, loads the data and starts writing changes back. */
export async function startRemoteSync() {
  const sb = requireSupabase()
  try {
    const { data } = await sb.auth.getSession()
    const email = data.session?.user.email ?? null
    await reload(email !== null)
    store.dispatch(sessionChanged(email))
  } catch (e) {
    store.dispatch(setSyncError(`No se pudo conectar con Supabase: ${errorText(e)}`))
  } finally {
    store.dispatch(setRemoteReady())
  }

  store.subscribe(() => {
    if (hasChanges(store.getState())) schedule()
  })

  sb.auth.onAuthStateChange((_event, session) => {
    const nextEmail = session?.user.email ?? null
    if ((nextEmail !== null) === store.getState().auth.isAuthenticated) return
    // Supabase advises against awaiting its client inside this callback.
    setTimeout(async () => {
      // Staff-only rows (orders, bookings) appear or disappear with the session.
      await reload(nextEmail !== null)
      store.dispatch(sessionChanged(nextEmail))
    }, 0)
  })
}
