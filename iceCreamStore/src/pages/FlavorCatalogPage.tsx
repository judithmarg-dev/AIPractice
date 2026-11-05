import { useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { selectActiveProducts } from '@/store/slices/inventorySlice'
import { selectActiveCategories } from '@/store/slices/categoriesSlice'
import { selectDraft, selectDraftNumber, selectEditingId } from '@/store/slices/orderSlice'
import { selectDraftTotals } from '@/store/selectors'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { formatMoney } from '@/lib/money'
import { plural } from '@/lib/texts'
import type { OrderLine } from '@/types/models'
import { MenuSidebar, type MenuSection } from '@/components/MenuSidebar'
import { FlavorTile } from '@/components/FlavorTile'
import { FlavorDetailPanel } from '@/components/FlavorDetailPanel'
import { BuildModal } from '@/components/BuildModal'

interface BuildTarget {
  baseId: string
  line?: OrderLine
}

export function FlavorCatalogPage() {
  const location = useLocation()
  const products = useAppSelector(selectActiveProducts)
  const categories = useAppSelector(selectActiveCategories)
  const draft = useAppSelector(selectDraft)
  const number = useAppSelector(selectDraftNumber)
  const editing = useAppSelector(selectEditingId) !== null
  const totals = useAppSelector(selectDraftTotals)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [orderOpen, setOrderOpen] = useState(() => Boolean((location.state as { openOrder?: boolean } | null)?.openOrder))
  const [build, setBuild] = useState<BuildTarget | null>(null)

  // RF-1.5: categories in their order, only those with at least one active product.
  const sections = useMemo(
    () =>
      categories
        .map((c) => ({ category: c, id: `cat-${c.id}`, items: products.filter((p) => p.categoryId === c.id) }))
        .filter((s) => s.items.length > 0),
    [categories, products]
  )
  const sidebarSections: MenuSection[] = useMemo(
    () => sections.map(({ id, category }) => ({ id, label: category.name })),
    [sections]
  )

  const selected = products.find((p) => p.id === selectedId) ?? null
  const hasLines = draft.lines.length > 0 || editing

  // Desktop keeps the order in the side column; smaller screens open it on demand.
  const showPanel = selected !== null || (hasLines && (isDesktop || orderOpen))
  const showOrderBar = !isDesktop && hasLines && !showPanel

  const handleClosePanel = useCallback(() => {
    setSelectedId(null)
    setOrderOpen(false)
  }, [])

  const handleEditLine = useCallback((line: OrderLine) => {
    if (line.build) setBuild({ baseId: line.build.scoops[0].id, line })
  }, [])

  return (
    <main className={`menu${showPanel ? ' menu--open' : ''}`}>
      <MenuSidebar sections={sidebarSections} />

      <div className="menu__content">
        <h1 className="menu__title">Menú</h1>
        {editing && (
          <p className="menu__editing" role="status">
            Editando Orden #{number}: agrega o cambia productos y guarda los cambios en el panel de la orden.
          </p>
        )}
        {!showPanel && !editing && (
          <p className="menu__hint">Toca un producto para agregarlo al pedido. Los artesanales se arman bola por bola.</p>
        )}
        {sections.length === 0 && (
          <p className="menu__hint">Todavía no hay productos activos. Crea categorías y productos desde el panel de staff.</p>
        )}

        {sections.map(({ category, id, items }) => (
          <section key={id} id={id} className="menu__section" aria-labelledby={`${id}-heading`}>
            <h2 id={`${id}-heading`} className="menu__section-title">
              {category.name}
            </h2>
            <div className="menu__tiles">
              {items.map((product, index) => (
                <FlavorTile
                  key={product.id}
                  product={product}
                  buildable={category.buildable}
                  index={index}
                  isSelected={selectedId === product.id}
                  onClick={() => {
                    if (category.buildable) {
                      setSelectedId(null)
                      setBuild({ baseId: product.id })
                    } else {
                      setSelectedId(selectedId === product.id ? null : product.id)
                    }
                  }}
                />
              ))}
            </div>
          </section>
        ))}
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
            {editing ? 'Editando ' : ''}Orden #{number} · {plural(totals.itemCount, 'artículo', 'artículos')}
          </span>
          <span className="order-bar__total">{formatMoney(totals.totalCents)} · Ver orden</span>
        </button>
      )}

      {build && <BuildModal key={build.line?.lineId ?? build.baseId} {...build} onClose={() => setBuild(null)} />}
    </main>
  )
}

export default FlavorCatalogPage
