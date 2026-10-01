import type { FlavorCategory } from '../types/flavor'

const CATEGORIES: FlavorCategory[] = ['fruit', 'chocolate', 'classic']

const AllIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" focusable="false">
    <circle cx="3" cy="6.5" r="2.25" stroke="currentColor" strokeWidth="1.25" />
    <circle cx="6.5" cy="3" r="2.25" stroke="currentColor" strokeWidth="1.25" />
    <circle cx="10" cy="6.5" r="2.25" stroke="currentColor" strokeWidth="1.25" />
  </svg>
)

const FruitIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" focusable="false">
    <circle cx="4" cy="9" r="2.75" stroke="currentColor" strokeWidth="1.25" />
    <circle cx="9" cy="9" r="2.75" stroke="currentColor" strokeWidth="1.25" />
    <path d="M4 6.25C4 3.5 6.5 2 6.5 2C6.5 2 9 3.5 9 6.25" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChocolateIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" focusable="false">
    <rect x="1.5" y="3.5" width="10" height="7" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
    <line x1="6.5" y1="3.5" x2="6.5" y2="10.5" stroke="currentColor" strokeWidth="1.25" />
    <line x1="1.5" y1="7" x2="11.5" y2="7" stroke="currentColor" strokeWidth="1.25" />
  </svg>
)

const ClassicIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" focusable="false">
    <circle cx="6.5" cy="5" r="3.25" stroke="currentColor" strokeWidth="1.25" />
    <path d="M3 8L6.5 13L10 8" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinejoin="round" />
  </svg>
)

const CATEGORY_ICONS: Record<FlavorCategory | 'all', () => React.ReactElement> = {
  all: AllIcon,
  fruit: FruitIcon,
  chocolate: ChocolateIcon,
  classic: ClassicIcon,
}

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
        <AllIcon />
        All
      </button>
      {CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICONS[cat]
        return (
          <button
            key={cat}
            type="button"
            className={`category-filter__btn${selected === cat ? ' category-filter__btn--active' : ''}`}
            onClick={() => onChange(selected === cat ? null : cat)}
            aria-pressed={selected === cat}
          >
            <Icon />
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        )
      })}
    </nav>
  )
}
