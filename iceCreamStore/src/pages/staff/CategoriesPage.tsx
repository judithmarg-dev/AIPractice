import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  archiveCategory,
  moveCategory,
  restoreCategory,
  selectActiveCategories,
  selectAllCategories,
} from '@/store/slices/categoriesSlice'
import { selectActiveProducts } from '@/store/slices/inventorySlice'
import { pushToast } from '@/store/slices/uiSlice'
import { CategoryDialog } from '@/components/staff/CategoryDialog'
import { useConfirm } from '@/components/ui/ConfirmProvider'
import { Icon } from '@/components/icons'
import { plural } from '@/lib/texts'
import type { Category } from '@/types/models'

export default function CategoriesPage() {
  const dispatch = useAppDispatch()
  const confirm = useConfirm()
  const active = useAppSelector(selectActiveCategories)
  const archived = useAppSelector(selectAllCategories).filter((c) => c.archived)
  const products = useAppSelector(selectActiveProducts)
  const [editing, setEditing] = useState<Category | 'new' | null>(null)

  const countFor = (id: string) => products.filter((p) => p.categoryId === id).length

  async function handleArchive(category: Category) {
    if (category.protected) return
    const count = countFor(category.id)
    if (count > 0) {
      dispatch(
        pushToast({
          tone: 'error',
          message: `No se puede archivar "${category.name}": tiene ${plural(count, 'producto activo', 'productos activos')}. Muévelos a otra categoría o archívalos primero.`,
        })
      )
      return
    }
    const ok = await confirm({
      title: `¿Archivar "${category.name}"?`,
      message: 'Dejará de aparecer en el menú y en el formulario de productos. Puedes restaurarla después.',
      confirmLabel: 'Archivar',
      tone: 'warning',
    })
    if (ok) dispatch(archiveCategory(category.id))
  }

  return (
    <div className="staff-page">
      <header className="staff-page__head">
        <div>
          <h1 className="staff-page__title">Categorías</h1>
          <p className="staff-page__subtitle">El orden de esta lista es el orden del menú.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setEditing('new')}>
          <Icon name="plus" size={18} /> Nueva categoría
        </button>
      </header>

      <ul className="card-list">
        {active.map((c, i) => {
          const count = countFor(c.id)
          return (
            <li key={c.id} className="list-card">
              <span className="list-card__icon"><Icon name={c.icon} size={26} /></span>
              <div className="list-card__body">
                <p className="list-card__title">{c.name}</p>
                <p className="list-card__meta">
                  {plural(count, 'producto activo', 'productos activos')}
                  {c.buildable && <span className="chip chip--accent">Se arma por bolas</span>}
                  {c.protected && <span className="chip chip--neutral">Protegida</span>}
                </p>
              </div>
              <div className="list-card__actions">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => dispatch(moveCategory({ id: c.id, direction: -1 }))}
                  disabled={i === 0}
                  aria-label={`Subir ${c.name}`}
                >
                  <Icon name="arrow-up" size={18} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => dispatch(moveCategory({ id: c.id, direction: 1 }))}
                  disabled={i === active.length - 1}
                  aria-label={`Bajar ${c.name}`}
                >
                  <Icon name="arrow-down" size={18} />
                </button>
                <button type="button" className="icon-btn" onClick={() => setEditing(c)} aria-label={`Editar ${c.name}`}>
                  <Icon name="edit" size={18} />
                </button>
                <button
                  type="button"
                  className="icon-btn icon-btn--danger"
                  onClick={() => handleArchive(c)}
                  disabled={c.protected}
                  aria-label={c.protected ? `${c.name} está protegida y no se archiva` : `Archivar ${c.name}`}
                  title={c.protected ? 'Categoría protegida' : 'Archivar'}
                >
                  <Icon name="archive" size={18} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {archived.length > 0 && (
        <section className="staff-section" aria-labelledby="archived-heading">
          <h2 id="archived-heading" className="staff-section__title">Archivadas</h2>
          <ul className="card-list">
            {archived.map((c) => (
              <li key={c.id} className="list-card list-card--muted">
                <span className="list-card__icon"><Icon name={c.icon} size={26} /></span>
                <div className="list-card__body">
                  <p className="list-card__title">{c.name}</p>
                  <p className="list-card__meta">Archivada</p>
                </div>
                <div className="list-card__actions">
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => dispatch(restoreCategory(c.id))}>
                    <Icon name="restore" size={16} /> Restaurar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {editing && (
        <CategoryDialog category={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
