import { ScoopIcon } from '@/components/FlavorTile'
import type { DashboardData } from '@/lib/dashboard'
import { formatMoney } from '@/lib/money'
import { formatTime } from '@/lib/texts'
import { ChartCard } from './ChartCard'

/** RF-7.4.d — the flavor with most scoops sold, its podium and latest tickets. */
export function StarFlavorCard({ data }: { data: DashboardData }) {
  const star = data.star
  const top = star?.podium[0]
  // Podium order on screen: 2nd, 1st, 3rd.
  const podium = star ? [star.podium[1], star.podium[0], star.podium[2]] : []
  const maxScoops = top?.scoops ?? 1

  return (
    <ChartCard
      title="Sabor estrella"
      subtitle="Bolas vendidas en pedidos cobrados"
      summary={top ? `Sabor estrella: ${top.name}, ${top.scoops} bolas, ${top.pct} % del total` : 'Sin bolas vendidas'}
      values={star?.podium.map((p, i) => `${i + 1}. ${p.name}: ${p.scoops} bolas, ${p.pct} %`)}
      empty={top ? null : 'No se vendieron helados armados en este período.'}
    >
      {top && star && (
        <>
          <div className="star">
            <span className="star__swatch" style={{ '--flavor-color': top.color } as React.CSSProperties}>
              {top.image ? <img src={top.image} alt="" /> : <ScoopIcon size={30} />}
            </span>
            <div>
              <p className="star__name">{top.name}</p>
              <p className="star__meta">
                {top.scoops} bolas <span className="chip chip--warning">{top.pct} % del total</span>
              </p>
            </div>
          </div>
          <ol className="podium">
            {podium.map((p, i) =>
              p ? (
                <li key={p.productId} className={`podium__step podium__step--${i === 1 ? 1 : i === 0 ? 2 : 3}`}>
                  <span className="podium__name">{p.name}</span>
                  <span className="podium__bar" style={{ height: `${28 + (p.scoops / maxScoops) * 52}px` }}>
                    {i === 1 ? 1 : i === 0 ? 2 : 3}
                  </span>
                  <span className="podium__value">{p.scoops} · {p.pct} %</span>
                </li>
              ) : (
                <li key={`empty-${i}`} className="podium__step podium__step--empty" aria-hidden="true" />
              )
            )}
          </ol>
          {star.tickets.length > 0 && (
            <div className="tickets">
              <p className="tickets__title">Últimos tickets con {top.name}</p>
              <ul className="tickets__list">
                {star.tickets.map((t) => (
                  <li key={t.number} className="tickets__item">
                    <span className="tickets__badge">#{String(t.number).slice(-3)}</span>
                    <span className="tickets__body">
                      <span className="tickets__number">Ticket #{t.number}</span>
                      <span className="tickets__detail">{t.detail}</span>
                    </span>
                    <span className="tickets__amount">
                      {formatMoney(t.totalCents)}
                      <span className="tickets__time">{formatTime(t.at)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </ChartCard>
  )
}
