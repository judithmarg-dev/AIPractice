import { useMemo, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectActiveItems } from '@/store/slices/inventorySlice'
import type { IceCream } from '@/types/iceCream'
import type { Flavor, FlavorCategory } from '@/types/flavor'
import { MenuSidebar, type MenuSection } from '@/components/MenuSidebar'
import { FlavorTile } from '@/components/FlavorTile'
import { FlavorDetailPanel } from '@/components/FlavorDetailPanel'

const CATEGORY_ORDER: { id: FlavorCategory | 'other'; label: string }[] = [
  { id: 'fruit', label: 'Fruit' },
  { id: 'chocolate', label: 'Chocolate' },
  { id: 'classic', label: 'Classic' },
  { id: 'other', label: 'Other' },
]

interface CatalogItem extends Flavor {
  soldOut: boolean
}

function toCatalogItem(item: IceCream): CatalogItem {
  const known = CATEGORY_ORDER.some((c) => c.id === item.category && c.id !== 'other')
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: (known ? item.category : 'other') as FlavorCategory,
    imagePlaceholder: item.image_placeholder,
    soldOut: item.inventory_count <= 0,
  }
}

export function FlavorCatalogPage() {
  const inventory = useAppSelector(selectActiveItems)
  const [selectedFlavorId, setSelectedFlavorId] = useState<string | null>(null)

  const sections = useMemo(() => {
    const items = inventory.map(toCatalogItem)
    return CATEGORY_ORDER.map((cat) => ({
      ...cat,
      items: items.filter((i) => i.category === cat.id),
    })).filter((s) => s.items.length > 0)
  }, [inventory])

  const sidebarSections: MenuSection[] = sections.map(({ id, label }) => ({ id, label }))

  const selectedFlavor =
    sections.flatMap((s) => s.items).find((f) => f.id === selectedFlavorId) ?? null

  const handleFlavorSelect = (flavorId: string) => {
    setSelectedFlavorId(selectedFlavorId === flavorId ? null : flavorId)
  }

  const handleClosePanel = () => setSelectedFlavorId(null)

  return (
    <main className={`menu${selectedFlavor ? ' menu--open' : ''}`}>
      <MenuSidebar sections={sidebarSections} />

      <div className="menu__content">
        <h1 className="menu__title">Menu</h1>
        {!selectedFlavor && (
          <p className="menu__hint">Select a flavor to see its details.</p>
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

      <FlavorDetailPanel flavor={selectedFlavor} onClose={handleClosePanel} />
    </main>
  )
}

export default FlavorCatalogPage
