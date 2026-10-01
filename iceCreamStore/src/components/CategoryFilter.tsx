import type { FlavorCategory } from '../types/flavor'

const CATEGORIES: FlavorCategory[] = ['fruit', 'chocolate', 'classic']

interface CategoryFilterProps {
  selected: FlavorCategory | null
  onChange: (category: FlavorCategory | null) => void
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <nav className="category-filter" aria-label="Filter by category">
      <button
        type="button"
        className={`category-filter__btn${selected === null ? ' category-filter__btn--active' : ''}`}
        onClick={() => onChange(null)}
        aria-pressed={selected === null}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`category-filter__btn${selected === cat ? ' category-filter__btn--active' : ''}`}
          onClick={() => onChange(selected === cat ? null : cat)}
          aria-pressed={selected === cat}
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </nav>
  )
}
