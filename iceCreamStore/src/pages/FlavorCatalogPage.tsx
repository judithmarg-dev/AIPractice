import { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectActiveItems } from '@/store/slices/inventorySlice'
import { computeTotals, selectCurrentOrder } from '@/store/slices/orderSlice'
import type { IceCream } from '@/types/iceCream'
import { CATEGORIES, isFlavorCategory, type Flavor } from '@/types/flavor'
import { MenuSidebar, type MenuSection } from '@/components/MenuSidebar'
import { FlavorTile } from '@/components/FlavorTile'
import { FlavorDetailPanel } from '@/components/FlavorDetailPanel'

const SECTIONS: { id: string; label: string }[] = [...CATEGORIES, { id: 'other', label: 'Otros' }]

interface CatalogItem extends Flavor {
  sectionId: string
  soldOut: boolean
}

function toCatalogItem(item: IceCream): CatalogItem {
  const category = isFlavorCategory(item.category) ? item.category : 'bebida'
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category,
    sectionId: isFlavorCategory(item.category) ? item.category : 'other',
    imagePlaceholder: item.image_placeholder,
    price: item.price,
    image: item.image,
    container: item.container,
    soldOut: item.inventory_count <= 0,
  }
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export function FlavorCatalogPage() {
  const inventory = useAppSelector(selectActiveItems)
  const order = useAppSelector(selectCurrentOrder)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [selectedFlavorId, setSelectedFlavorId] = useState<string | null>(null)
  const [orderOpen, setOrderOpen] = useState(false)

  const sections = useMemo(() => {
    const items = inventory.map(toCatalogItem)
    return SECTIONS.map((section) => ({
      ...section,
      items: items.filter((i) => i.sectionId === section.id),
    })).filter((s) => s.items.length > 0)
  }, [inventory])

  const sidebarSections: MenuSection[] = sections.map(({ id, label }) => ({ id, label }))

  const selectedFlavor =
    sections.flatMap((s) => s.items).find((f) => f.id === selectedFlavorId) ?? null

  const hasLines = order.lines.length > 0
  const totals = computeTotals(order)

  // Desktop keeps the order in the side column; smaller screens open it on demand.
  const showPanel = selectedFlavor !== null || (hasLines && (isDesktop || orderOpen))
  const showOrderBar = !isDesktop && hasLines && !showPanel

  const handleFlavorSelect = (flavorId: string) => {
    setSelectedFlavorId(selectedFlavorId === flavorId ? null : flavorId)
  }

  const handleClosePanel = () => {
    setSelectedFlavorId(null)
    setOrderOpen(false)
  }

  return (
    <main className={`menu${showPanel ? ' menu--open' : ''}`}>
      <MenuSidebar sections={sidebarSections} />

      <div className="menu__content">
        <h1 className="menu__title">Menú</h1>
        {!showPanel && (
          <p className="menu__hint">Selecciona un producto para ver sus detalles y agregarlo a la orden.</p>
        )}

        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="menu__section"
            aria-labelledby={`${section.id}-heading`}
          >
            <h2 id={`${section.id}-heading`} className="menu__section-title">
              {section.label}
            </h2>
            <div className="menu__tiles">
              {section.items.map((flavor, index) => (
                <FlavorTile
                  key={flavor.id}
                  flavor={flavor}
                  index={index}
                  isSelected={selectedFlavorId === flavor.id}
                  soldOut={flavor.soldOut}
                  onClick={() => handleFlavorSelect(flavor.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {showPanel && (
        <FlavorDetailPanel
          flavor={selectedFlavor}
          showOrder={hasLines || selectedFlavor === null}
          onClose={handleClosePanel}
        />
      )}

      {showOrderBar && (
        <button type="button" className="order-bar" onClick={() => setOrderOpen(true)}>
          <span className="order-bar__label">
            Orden #{order.number} · {totals.itemCount} {totals.itemCount === 1 ? 'artículo' : 'artículos'}
          </span>
          <span className="order-bar__total">${totals.total.toFixed(2)} · Ver orden</span>
        </button>
      )}
    </main>
  )
}

export default FlavorCatalogPage
