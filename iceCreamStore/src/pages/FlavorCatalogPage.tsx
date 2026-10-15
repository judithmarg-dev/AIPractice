import { useState } from 'react'
import '../catalog.css'
import flavorsData from '../data/flavors.json'
import type { Flavor, FlavorCategory, Size } from '../types/flavor'
import { CategoryFilter } from '../components/CategoryFilter'
import { FlavorCard } from '../components/FlavorCard'
import { SizePicker } from '../components/SizePicker'
import { FlavorDetailPanel } from '../components/FlavorDetailPanel'

const flavors = flavorsData as Flavor[]

export function FlavorCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<FlavorCategory | null>(null)
  const [selectedSize, setSelectedSize] = useState<Size>('medium')
  const [selectedFlavorId, setSelectedFlavorId] = useState<string | null>(null)

  const visible = selectedCategory
    ? flavors.filter((f) => f.category === selectedCategory)
    : flavors

  const selectedFlavor = selectedFlavorId ? flavors.find((f) => f.id === selectedFlavorId) : null

  const handleFlavorSelect = (flavorId: string) => {
    setSelectedFlavorId(selectedFlavorId === flavorId ? null : flavorId)
  }

  const handleClosePanel = () => {
    setSelectedFlavorId(null)
  }

  const handleCategoryChange = (category: FlavorCategory | null) => {
    setSelectedCategory(category)
    if (category && selectedFlavor && selectedFlavor.category !== category) {
      setSelectedFlavorId(null)
    }
  }

  return (
    <main className="catalog">
      <header className="catalog__header">
        <h1 className="catalog__title">Our Flavors</h1>
        <p className="catalog__subtitle">
          Handcrafted in small batches. Pick your size and find your favourite.
        </p>
      </header>

      <div className="catalog__controls">
        <CategoryFilter selected={selectedCategory} onChange={handleCategoryChange} />
        <SizePicker selected={selectedSize} onChange={setSelectedSize} />
      </div>

      {!selectedFlavor && (
        <p className="catalog__hint">Select a flavor to see its details.</p>
      )}

      <div className={`catalog__container${selectedFlavor ? ' catalog__container--open' : ''}`}>
        <section className="catalog__grid" aria-label="Flavor list">
          {visible.map((flavor, index) => (
            <FlavorCard
              key={flavor.id}
              flavor={flavor}
              selectedSize={selectedSize}
              index={index}
              isSelected={selectedFlavorId === flavor.id}
              onClick={() => handleFlavorSelect(flavor.id)}
            />
          ))}
        </section>

        <FlavorDetailPanel
          flavor={selectedFlavor ?? null}
          onClose={handleClosePanel}
          selectedSize={selectedSize}
        />
      </div>
    </main>
  )
}

export default FlavorCatalogPage
