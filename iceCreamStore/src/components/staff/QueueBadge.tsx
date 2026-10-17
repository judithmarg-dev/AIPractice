import { useAppSelector } from '@/store/hooks'
import { selectQueueCount } from '@/store/slices/orderSlice'

/** Number of orders waiting to be charged (RF-0.5). */
export function QueueBadge() {
  const count = useAppSelector(selectQueueCount)
  if (count === 0) return null
  return (
    <span className="nav-badge">
      {count}
      <span className="sr-only"> {count === 1 ? 'pedido por cobrar' : 'pedidos por cobrar'}</span>
    </span>
  )
}
