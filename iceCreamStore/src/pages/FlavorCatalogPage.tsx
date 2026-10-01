import { useState } from 'react'
import flavorsData from '../data/flavors.json'
import type { Flavor, FlavorCategory, Size } from '../types/flavor'
import { CategoryFilter } from '../components/CategoryFilter'
import { FlavorCard } from '../components/FlavorCard'
import { SizePicker } from '../components/SizePicker'

const flavors = flavorsData as Flavor[]

export function FlavorCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<FlavorCategory | null>(null)
  const [selectedSize, setSelectedSize] = useState<Size>('medium')

  const visible = selectedCategory
    ? flavors.filter((f) => f.category === selectedCategory)
    : flavors

  return (
    <main className="catalog">
      <header className="catalog__header">
        <h1 className="catalog__title">Our Flavors</h1>
        <p className="catalog__subtitle">
          Handcrafted in small batches. Pick your size and find your favourite.
        </p>
      </header>

      <div className="catalog__controls">
        <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
        <SizePicker selected={selectedSize} onChange={setSelectedSize} />
      </div>

      <section className="catalog__grid" aria-label="Flavor list">
        {visible.map((flavor) => (
          <FlavorCard key={flavor.id} flavor={flavor} selectedSize={selectedSize} />
        ))}
      </section>
    </main>
  )
}
