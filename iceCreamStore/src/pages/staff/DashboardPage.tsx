import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectAllProducts } from '@/store/slices/inventorySlice'
import { selectActiveCategories, selectCategoryMap } from '@/store/slices/categoriesSlice'
import { selectHasDemoOrders } from '@/store/slices/orderSlice'
import { selectSettings } from '@/store/slices/settingsSlice'
import { pushToast } from '@/store/slices/uiSlice'
import { loadDemoData } from '@/store/orderActions'
import { selectDashboard, selectOrderIndex } from '@/lib/dashboard'
import { detailCsv, periodSlug, summaryCsv } from '@/lib/dashboardExport'
import { downloadCsv } from '@/lib/csv'
import { exportDashboardPdf } from '@/lib/pdf'
import { periodContaining, periodLabel, shiftPeriod, type PeriodKind } from '@/lib/period'
import { STORE_NAME, T } from '@/lib/texts'
import { useNow } from '@/hooks/useNow'
import { Icon } from '@/components/icons'
import { Switch } from '@/components/ui/Switch'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { PeriodPicker } from '@/components/dashboard/PeriodPicker'
import { ExportMenu } from '@/components/dashboard/ExportMenu'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { HourlyChart } from '@/components/dashboard/HourlyChart'
import { TopDemand } from '@/components/dashboard/TopDemand'
import { StarFlavorCard } from '@/components/dashboard/StarFlavorCard'
import { ServiceMix } from '@/components/dashboard/ServiceMix'
import { StockAlerts } from '@/components/dashboard/StockAlerts'
import { SupplySignals } from '@/components/dashboard/SupplySignals'
import { CategoryMix } from '@/components/dashboard/CategoryMix'

const MINUTE = 60000

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const nowMinute = Math.floor(useNow(MINUTE) / MINUTE) * MINUTE
  const now = useMemo(() => new Date(nowMinute), [nowMinute])
  const [kind, setKind] = useState<PeriodKind>('semana')
  const [anchor, setAnchor] = useState(() => new Date())
  const [compare, setCompare] = useState(true)
  const [exporting, setExporting] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const period = useMemo(() => periodContaining(kind, anchor), [kind, anchor])
  const data = useAppSelector((s) => selectDashboard(s, period, nowMinute))
  const index = useAppSelector(selectOrderIndex)
  const products = useAppSelector(selectAllProducts)
  const categories = useAppSelector(selectActiveCategories)
  const categoryMap = useAppSelector(selectCategoryMap)
  const settings = useAppSelector(selectSettings)
  const hasDemo = useAppSelector(selectHasDemoOrders)

  const slug = periodSlug(period)

  async function handlePdf() {
    if (!rootRef.current) return
    setExporting(true)
    try {
      await exportDashboardPdf(rootRef.current, `dashboard-${slug}.pdf`)
    } catch {
      dispatch(pushToast({ tone: 'error', message: 'No se pudo generar el PDF. Inténtalo de nuevo.' }))
    } finally {
      setExporting(false)
    }
  }

  function handleLoadDemo() {
    const count = dispatch(loadDemoData())
    dispatch(pushToast({ message: `${count} pedidos de demostración cargados` }))
  }

  const generatedAt = now.toLocaleString('es', { dateStyle: 'long', timeStyle: 'short', hour12: false })

  return (
    <div className="staff-page dashboard" ref={rootRef}>
      <header className="staff-page__head">
        <div>
          <h1 className="staff-page__title">Dashboard de ventas</h1>
          <p className="staff-page__subtitle">Ingresos sin IVA, órdenes y señales de abastecimiento.</p>
        </div>
        <ExportMenu
          busy={exporting}
          onPdf={handlePdf}
          onSummaryCsv={() => downloadCsv(`resumen-${slug}.csv`, summaryCsv(data))}
          onDetailCsv={() => downloadCsv(`ordenes-${slug}.csv`, detailCsv(index, period, categoryMap))}
        />
      </header>

      <div className="pdf-only pdf-header" data-pdf-block="wide">
        <p className="pdf-header__store">{STORE_NAME}</p>
        <p className="pdf-header__title">Dashboard de ventas</p>
        <p className="pdf-header__period">{periodLabel(period)}{compare ? ' · comparado con el período anterior' : ''}</p>
        <p className="pdf-header__date">Generado el {generatedAt}</p>
      </div>

      <div className="dashboard__toolbar">
        <PeriodPicker
          period={period}
          now={now}
          onKind={setKind}
          onShift={(d) => setAnchor(shiftPeriod(period, d).start)}
          onToday={() => setAnchor(new Date())}
        />
        <Switch checked={compare} onChange={setCompare} label="Comparar con período anterior" />
      </div>

      {hasDemo && (
        <p className="banner banner--info" role="status">
          <Icon name="alert" size={18} />
          <span>{T.demoNotice}.</span>
          <Link to="/staff/ajustes" className="link">Borrar en Ajustes</Link>
        </p>
      )}

      {!data.hasAnyOrders && (
        <div className="banner banner--empty">
          <Icon name="chart" size={22} />
          <div>
            <p className="banner__title">Todavía no hay pedidos en la tienda</p>
            <p>Cobra pedidos desde el menú o carga datos de ejemplo para ver el dashboard en acción.</p>
          </div>
          <button type="button" className="btn btn--primary" onClick={handleLoadDemo}>{T.loadDemo}</button>
        </div>
      )}

      <KpiCards data={data} />

      <div className="dash-grid">
        <TopDemand data={data} products={products} categories={categories} threshold={settings.lowStockThreshold} />
        <SupplySignals data={data} />
        <TrendChart data={data} compare={compare} />
        <StarFlavorCard data={data} />
        <HourlyChart data={data} compare={compare} />
        <ServiceMix data={data} />
        <StockAlerts data={data} threshold={settings.lowStockThreshold} />
        <CategoryMix data={data} products={products} categories={categories} />
      </div>

      {exporting && (
        <div className="export-overlay" role="status">
          <span className="export-overlay__box">Generando PDF…</span>
        </div>
      )}
    </div>
  )
}
