'use client'
import { useState } from 'react'
import Link from 'next/link'
import flavorsData from '@/data/flavors.json'
import type { Flavor, FlavorCategory, Size } from '@/types/flavor'
import { CategoryFilter } from '@/components/CategoryFilter'
import { FlavorCard } from '@/components/FlavorCard'
import { SizePicker } from '@/components/SizePicker'

const flavors = flavorsData as Flavor[]

export default function HomePage() {
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
        <div className="catalog__cta">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            Book a Table →
          </Link>
        </div>
      </header>

      <div className="catalog__controls">
        <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
        <SizePicker selected={selectedSize} onChange={setSelectedSize} />
      </div>

      <section className="catalog__grid" aria-label="Flavor list">
        {visible.map((flavor, index) => (
          <FlavorCard key={flavor.id} flavor={flavor} selectedSize={selectedSize} index={index} />
        ))}
      </section>
    </main>
  )
}
