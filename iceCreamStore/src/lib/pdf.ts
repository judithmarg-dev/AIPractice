// Dashboard PDF (RF-7.7): each [data-pdf-block] is captured as an image in the light theme and
// placed on A4 pages: wide blocks on their own row, half blocks paired, none split across pages.

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 12
const GAP = 4

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))

export async function exportDashboardPdf(root: HTMLElement, filename: string): Promise<void> {
  const [{ jsPDF }, { toJpeg }] = await Promise.all([import('jspdf'), import('html-to-image')])
  const previousTheme = root.getAttribute('data-theme')
  root.setAttribute('data-theme', 'light')
  root.classList.add('is-exporting')
  try {
    // Let charts re-measure at the export width before capturing.
    await frame()
    await frame()
    await wait(350)

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const contentW = PAGE_W - 2 * MARGIN
    const halfW = (contentW - GAP) / 2
    const maxH = PAGE_H - 2 * MARGIN
    let y = MARGIN

    type Shot = { img: string; w: number; h: number }
    const fit = (img: string, el: HTMLElement, w: number): Shot => {
      const h = (w * el.offsetHeight) / Math.max(1, el.offsetWidth)
      return h > maxH ? { img, w: (w * maxH) / h, h: maxH } : { img, w, h }
    }
    // A row never splits across pages: start a new page when it does not fit.
    const placeRow = (shots: Shot[]) => {
      const h = Math.max(...shots.map((s) => s.h))
      if (y + h > PAGE_H - MARGIN) {
        pdf.addPage()
        y = MARGIN
      }
      shots.forEach((s, i) => pdf.addImage(s.img, 'JPEG', MARGIN + i * (halfW + GAP), y, s.w, s.h))
      y += h + GAP
    }

    // Wide blocks take a full row; half blocks are paired two per row in order of appearance.
    let pending: Shot | null = null
    for (const block of root.querySelectorAll<HTMLElement>('[data-pdf-block]')) {
      const wide = block.dataset.pdfBlock === 'wide'
      // JPEG keeps a dashboard PDF under a few MB; PNG at 2× was tens of MB.
      const img = await toJpeg(block, { pixelRatio: 2, quality: 0.9, backgroundColor: '#ffffff', cacheBust: true })
      if (wide) {
        placeRow([fit(img, block, contentW)])
      } else if (pending) {
        placeRow([pending, fit(img, block, halfW)])
        pending = null
      } else {
        pending = fit(img, block, halfW)
      }
    }
    if (pending) placeRow([pending])
    pdf.save(filename)
  } finally {
    root.classList.remove('is-exporting')
    if (previousTheme === null) root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', previousTheme)
  }
}
