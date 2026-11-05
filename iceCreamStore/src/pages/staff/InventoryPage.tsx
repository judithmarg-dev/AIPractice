import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { adjustStock, archiveProduct, selectActiveProducts } from '@/store/slices/inventorySlice'
import { selectActiveCategories, selectCategoryMap } from '@/store/slices/categoriesSlice'
import { selectSettings } from '@/store/slices/settingsSlice'
import { pushToast } from '@/store/slices/uiSlice'
import { useConfirm } from '@/components/ui/ConfirmProvider'
import { ScoopIcon } from '@/components/FlavorTile'
import { Icon } from '@/components/icons'
import { formatMoney } from '@/lib/money'
import { T } from '@/lib/texts'
import type { Product } from '@/types/models'

export default function InventoryPage() {
  const dispatch = useAppDispatch()
  const confirm = useConfirm()
  const products = useAppSelector(selectActiveProducts)
  const categories = useAppSelector(selectActiveCategories)
  const categoryMap = useAppSelector(selectCategoryMap)
  const { lowStockThreshold } = useAppSelector(selectSettings)

  // Group by category in menu order; products of archived categories go last.
  const order = new Map(categories.map((c, i) => [c.id, i]))
  const sorted = [...products].sort(
    (a, b) => (order.get(a.categoryId) ?? 99) - (order.get(b.categoryId) ?? 99) || a.name.localeCompare(b.name)
  )

  async function handleArchive(p: Product) {
    const ok = await confirm({
      title: `¿Archivar "${p.name}"?`,
      message: 'Deja de aparecer en el menú. Los pedidos registrados no cambian.',
      confirmLabel: 'Archivar',
      tone: 'warning',
    })
    if (!ok) return
    dispatch(archiveProduct(p.id))
    dispatch(pushToast({ message: `"${p.name}" archivado` }))
  }

  return (
    <div className="staff-page">
      <header className="staff-page__head">
        <div>
          <h1 className="staff-page__title">Inventario</h1>
          <p className="staff-page__subtitle">
            Stock bajo: menos de {lowStockThreshold} unidades. Ajusta el stock rápido con − y +.
          </p>
        </div>
        <Link to="/staff/inventory/new" className="btn btn--primary">
          <Icon name="plus" size={18} /> Nuevo producto
        </Link>
      </header>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon"><Icon name="box" size={32} /></span>
          <p className="empty-state__title">No hay productos todavía</p>
          <Link to="/staff/inventory/new" className="btn btn--primary">Crear el primer producto</Link>
        </div>
      ) : (
        <ul className="card-list">
          {sorted.map((p) => {
            const category = categoryMap[p.categoryId]
            const level = p.stock === 0 ? 'agotado' : p.stock < lowStockThreshold ? 'bajo' : null
            return (
              <li key={p.id} className="list-card">
                <span className="list-card__swatch" style={{ '--flavor-color': p.color } as React.CSSProperties} aria-hidden="true">
                  {p.image ? <img src={p.image} alt="" /> : <ScoopIcon size={24} />}
                </span>
                <div className="list-card__body">
                  <p className="list-card__title">{p.name}</p>
                  <p className="list-card__meta">
                    {category?.name ?? 'Sin categoría'} · {formatMoney(p.priceCents)}
                    {category?.buildable ? ' / bola' : ''}
                    {p.costCents === undefined && <span className="chip chip--neutral">Sin costo</span>}
                    {level === 'agotado' && <span className="chip chip--danger"><Icon name="alert" size={12} /> {T.soldOut}</span>}
                    {level === 'bajo' && <span className="chip chip--warning"><Icon name="alert" size={12} /> Stock bajo</span>}
                  </p>
                </div>
                <div className="list-card__stock" role="group" aria-label={`Stock de ${p.name}`}>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => dispatch(adjustStock({ id: p.id, delta: -1 }))}
                    disabled={p.stock === 0}
                    aria-label={`Quitar una unidad de ${p.name}`}
                  >
                    <Icon name="minus" size={16} />
                  </button>
                  <span className="list-card__stock-value" aria-live="polite">
                    {p.stock}
                    <span className="sr-only"> unidades</span>
                  </span>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => dispatch(adjustStock({ id: p.id, delta: 1 }))}
                    aria-label={`Añadir una unidad de ${p.name}`}
                  >
                    <Icon name="plus" size={16} />
                  </button>
                </div>
                <div className="list-card__actions">
                  <Link to={`/staff/inventory/${p.id}/edit`} className="icon-btn" aria-label={`Editar ${p.name}`}>
                    <Icon name="edit" size={18} />
                  </Link>
                  <button type="button" className="icon-btn icon-btn--danger" onClick={() => handleArchive(p)} aria-label={`Archivar ${p.name}`}>
                    <Icon name="archive" size={18} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
