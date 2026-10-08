import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { archiveItem, selectActiveItems } from '@/store/slices/inventorySlice'

export default function InventoryPage() {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectActiveItems)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>
          Inventory
        </h1>
        <Link
          to="/staff/inventory/new"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--accent)' }}
        >
          + Add item
        </Link>
      </div>

      {!items.length ? (
        <p className="text-sm" style={{ color: 'var(--text)' }}>No items yet. Add your first ice cream.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--accent-bg)' }}>
                {['Name', 'Category', 'Stock', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-h)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-h)' }}>{item.name}</td>
                  <td className="px-4 py-3 capitalize" style={{ color: 'var(--text)' }}>{item.category}</td>
                  <td className="px-4 py-3" style={{ color: item.inventory_count <= 5 ? '#ef4444' : 'var(--text)' }}>
                    {item.inventory_count}
                    {item.inventory_count <= 5 && <span className="ml-1 text-xs">⚠ low</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/staff/inventory/${item.id}/edit`}
                        className="px-3 py-1 rounded-lg text-xs font-medium border"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-h)' }}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => dispatch(archiveItem(item.id))}
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                      >
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
