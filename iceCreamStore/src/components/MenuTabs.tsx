import { useRef } from 'react'

export interface MenuTab {
  id: string
  label: string
  /** Shown as a small counter next to the label. */
  count?: number
}

interface MenuTabsProps {
  tabs: MenuTab[]
  activeId: string | null
  onChange: (id: string) => void
  /** Accessible name of the tab list. */
  label: string
  /** Id of the element the tabs control (the products panel). */
  panelId: string
  /** `category`: underlined tab bar. `option`: segmented pills inside a category. */
  variant?: 'category' | 'option'
}

/** WAI-ARIA tabs: click or arrow keys to switch; only the active tab is in the tab order. */
export function MenuTabs({ tabs, activeId, onChange, label, panelId, variant = 'category' }: MenuTabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const activeIndex = tabs.findIndex((t) => t.id === activeId)

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    const last = tabs.length - 1
    const next =
      e.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null
    if (next === null) return
    e.preventDefault()
    refs.current[next]?.focus()
    onChange(tabs[next].id)
  }

  return (
    <div className={`menu-tabs menu-tabs--${variant}`} role="tablist" aria-label={label}>
      {tabs.map((tab, index) => {
        const active = tab.id === activeId
        // With nothing selected yet, the first tab is the keyboard entry point.
        const focusable = active || (activeIndex === -1 && index === 0)
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            className={`menu-tabs__tab${active ? ' menu-tabs__tab--active' : ''}`}
            aria-selected={active}
            aria-controls={active ? panelId : undefined}
            tabIndex={focusable ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
            {tab.count !== undefined && <span className="menu-tabs__count">{tab.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
