import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectActiveProducts } from '@/store/slices/inventorySlice'
import { selectActiveCategories } from '@/store/slices/categoriesSlice'
import { selectDraft, selectDraftNumber, selectEditingId } from '@/store/slices/orderSlice'
import { selectDraftTotals, selectAvailableStock } from '@/store/selectors'
import { clearPack, loadPack, selectPack, selectPackKind, setPackMode, setPackWeight, toggleFlavor } from '@/store/slices/packSlice'
import { removeLine } from '@/store/slices/orderSlice'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { formatMoney } from '@/lib/money'
import { plural } from '@/lib/texts'
import type { OrderLine } from '@/types/models'
import { PACK_RULES, WEIGHTS, limitText, presentationsOf, type Weight } from '@/lib/presentations'
import { MenuTabs } from '@/components/MenuTabs'
import { FlavorTile } from '@/components/FlavorTile'
import { FlavorDetailPanel } from '@/components/FlavorDetailPanel'
import { BuildModal } from '@/components/BuildModal'

interface BuildTarget {
  baseId: string
  line?: OrderLine
}

export function FlavorCatalogPage() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const products = useAppSelector(selectActiveProducts)
  const categories = useAppSelector(selectActiveCategories)
  const draft = useAppSelector(selectDraft)
  const number = useAppSelector(selectDraftNumber)
  const editing = useAppSelector(selectEditingId) !== null
  const totals = useAppSelector(selectDraftTotals)
  const pack = useAppSelector(selectPack)
  const packKind = useAppSelector(selectPackKind)
  const available = useAppSelector((s) => selectAvailableStock(s, null))
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [orderOpen, setOrderOpen] = useState(() => Boolean((location.state as { openOrder?: boolean } | null)?.openOrder))
  const [build, setBuild] = useState<BuildTarget | null>(null)

  // RF-1.5: categories in their order, only those with at least one active product.
  const sections = useMemo(
    () =>
      categories
        .map((c) => ({ category: c, items: products.filter((p) => p.categoryId === c.id) }))
        .filter((s) => s.items.length > 0),
    [categories, products]
  )

  // Nothing is shown until a category tab is chosen; the choice lives in the URL (?cat=&sub=).
  const active = sections.find((s) => s.category.id === params.get('cat')) ?? null
  const presentations = active ? presentationsOf(active.category.id) : []
  const activeSub = presentations.find((g) => g.id === params.get('sub')) ?? null
  // Categories with presentations (Artesanales) wait for one to be chosen too. Both presentations
  // list the same flavors: one catalog, so nothing is duplicated per option.
  const visible = !active ? null : presentations.length === 0 ? active.items : activeSub ? active.items : null
  const packMode = activeSub ? (activeSub.id === 'peso' ? 'peso' : 'porcion') : null
  const rule = PACK_RULES[packKind]

  // The pack being assembled follows the tab: switching Porciones ↔ Por peso starts over.
  useEffect(() => {
    if (packMode) dispatch(setPackMode(packMode))
  }, [dispatch, packMode])

  const selectTab = (cat: string, sub?: string) => {
    setSelectedId(null)
    if (cat !== active?.category.id) dispatch(clearPack())
    setParams(sub ? { cat, sub } : { cat }, { replace: true })
  }

  const selected = products.find((p) => p.id === selectedId) ?? null
  const packCount = pack.flavorIds.length
  const hasLines = draft.lines.length > 0 || editing || packCount > 0

  // Desktop keeps the order in the side column; smaller screens open it on demand.
  const showPanel = selected !== null || (hasLines && (isDesktop || orderOpen))
  const showOrderBar = !isDesktop && hasLines && !showPanel

  const handleClosePanel = useCallback(() => {
    setSelectedId(null)
    setOrderOpen(false)
  }, [])

  const handleEditLine = useCallback(
    (line: OrderLine) => {
      const b = line.build
      if (!b) return
      if (b.presentation) {
        // Cone / by-weight lines are edited in the pack builder: take the line back into it.
        const mode = b.presentation
        dispatch(loadPack({ mode, weight: b.pack?.kind ?? 'kilo', flavorIds: b.scoops.map((s) => s.id) }))
        dispatch(removeLine(line.lineId))
        setSelectedId(null)
        setParams({ cat: line.categoryId, sub: mode === 'peso' ? 'peso' : 'porciones' }, { replace: true })
        return
      }
      setBuild({ baseId: b.scoops[0].id, line })
    },
    [dispatch, setParams]
  )

  return (
    <main className={`menu${showPanel ? ' menu--open' : ''}`}>
      <div className="menu__content">
        <h1 className="menu__title">Menú</h1>
        {editing && (
          <p className="menu__editing" role="status">
            Editando Orden #{number}: agrega o cambia productos y guarda los cambios en el panel de la orden.
          </p>
        )}

        {sections.length === 0 ? (
          <p className="menu__hint">Todavía no hay productos activos. Crea categorías y productos desde el panel de staff.</p>
        ) : (
          <MenuTabs
            label="Categorías del menú"
            panelId="menu-category-panel"
            tabs={sections.map(({ category, items }) => ({ id: category.id, label: category.name, count: items.length }))}
            activeId={active?.category.id ?? null}
            onChange={(id) => selectTab(id)}
          />
        )}

        {sections.length > 0 && !active && (
          <p className="menu__prompt">Elige una categoría para ver sus productos.</p>
        )}

        {active && (
          <section
            id="menu-category-panel"
            role="tabpanel"
            aria-labelledby={`tab-${active.category.id}`}
            className="menu__section"
          >
            {presentations.length > 0 && (
              <MenuTabs
                variant="option"
                label={`Presentaciones de ${active.category.name}`}
                panelId="menu-option-panel"
                tabs={presentations.map((g) => ({ id: g.id, label: g.name }))}
                activeId={activeSub?.id ?? null}
                onChange={(id) => selectTab(active.category.id, id)}
              />
            )}

            {visible === null ? (
              <p className="menu__prompt">Elige una opción de {active.category.name}.</p>
            ) : (
              <div
                {...(activeSub
                  ? { id: 'menu-option-panel', role: 'tabpanel', 'aria-labelledby': `tab-${activeSub.id}` }
                  : {})}
              >
                {packMode === 'peso' && (
                  <div className="menu-tabs menu-tabs--option menu__weights" role="radiogroup" aria-label="Peso">
                    {WEIGHTS.map((w: Weight) => (
                      <button
                        key={w}
                        type="button"
                        role="radio"
                        aria-checked={pack.weight === w}
                        className={`menu-tabs__tab${pack.weight === w ? ' menu-tabs__tab--active' : ''}`}
                        onClick={() => dispatch(setPackWeight(w))}
                      >
                        {PACK_RULES[w].label}
                        <span className="menu-tabs__count">{limitText(PACK_RULES[w]).replace(' sabores', '')}</span>
                      </button>
                    ))}
                  </div>
                )}
                {packMode && visible.length > 0 && (
                  <p className="menu__hint">
                    {packMode === 'porcion'
                      ? `Toca los sabores de tu porción: ${limitText(rule)}. Se apilan sobre el barquillo.`
                      : `Elige ${limitText(rule)} para ${rule.label.toLowerCase()}.`}
                  </p>
                )}
                {!packMode && !showPanel && !editing && visible.length > 0 && (
                  <p className="menu__hint">
                    {active.category.buildable
                      ? 'Toca un sabor para armar el helado bola por bola.'
                      : 'Toca un producto para agregarlo al pedido.'}
                  </p>
                )}
                {visible.length === 0 ? (
                  <p className="menu__prompt">
                    Todavía no hay productos en {activeSub?.name ?? active.category.name}. Asígnalos desde Inventario.
                  </p>
                ) : (
                  // Re-mounted per tab so the tiles replay their entrance animation.
                  <div key={`${active.category.id}/${activeSub?.id ?? ''}`} className="menu__tiles">
                    {visible.map((product, index) => (
                      <FlavorTile
                        key={product.id}
                        product={product}
                        buildable={active.category.buildable}
                        index={index}
                        isSelected={selectedId === product.id}
                        toggle={
                          packMode
                            ? {
                                checked: pack.flavorIds.includes(product.id),
                                showCheck: packMode === 'peso',
                                disabled:
                                  !pack.flavorIds.includes(product.id) &&
                                  (pack.flavorIds.length >= rule.max || (available[product.id] ?? 0) < 1),
                              }
                            : undefined
                        }
                        onClick={() => {
                          if (packMode) {
                            setSelectedId(null)
                            dispatch(toggleFlavor(product.id))
                          } else if (active.category.buildable) {
                            setSelectedId(null)
                            setBuild({ baseId: product.id })
                          } else {
                            setSelectedId(selectedId === product.id ? null : product.id)
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {showPanel && (
        <FlavorDetailPanel
          product={selected}
          showOrder={hasLines || selected === null}
          onClose={handleClosePanel}
          onEditLine={handleEditLine}
        />
      )}

      {showOrderBar && (
        <button type="button" className="order-bar" onClick={() => setOrderOpen(true)}>
          <span className="order-bar__label">
            {packCount > 0 && draft.lines.length === 0 && !editing
              ? `Tu selección · ${plural(packCount, 'sabor', 'sabores')}`
              : `${editing ? 'Editando ' : ''}Orden #${number} · ${plural(totals.itemCount, 'artículo', 'artículos')}`}
          </span>
          <span className="order-bar__total">{formatMoney(totals.totalCents)} · Ver orden</span>
        </button>
      )}

      {build && <BuildModal key={build.line?.lineId ?? build.baseId} {...build} onClose={() => setBuild(null)} />}
    </main>
  )
}

export default FlavorCatalogPage
