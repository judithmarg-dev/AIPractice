import { useEffect, useState } from 'react'

export interface MenuSection {
  id: string
  label: string
}

interface MenuSidebarProps {
  sections: MenuSection[]
}

export function MenuSidebar({ sections }: MenuSidebarProps) {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null)

  // Scroll-spy: the section crossing the upper third of the viewport is active.
  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    const visible = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top)
          else visible.delete(entry.target.id)
        }
        if (visible.size === 0) return
        const topmost = [...visible.entries()].sort((a, b) => a[1] - b[1])[0][0]
        setActiveId(topmost)
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    e.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    setActiveId(id)
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <nav className="menu-sidebar" aria-label="Categorías del menú">
      <h2 className="menu-sidebar__heading">Categorías</h2>
      <ul className="menu-sidebar__list">
        {sections.map(({ id, label }) => {
          const active = id === activeId
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`menu-sidebar__link${active ? ' menu-sidebar__link--active' : ''}`}
                aria-current={active ? 'location' : undefined}
                onClick={(e) => handleClick(e, id)}
              >
                {label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
