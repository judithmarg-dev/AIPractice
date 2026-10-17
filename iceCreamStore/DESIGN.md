# DESIGN.md — IceCreamStore visual system

Read this before touching any screen: the menu and order panel, the build modal, the owner
panel (queue, dashboard, inventory, categories, options, settings), booking and login.
Two references define the look:

1. **Layout** follows the Starbucks menu (https://www.starbucks.com/menu): sticky header,
   sticky category sidebar, titled sections of circular product tiles, lots of whitespace.
2. **Colour and components** follow the order-panel mock (`Orden #1044`): white panel,
   teal accent, light-cyan cards, lavender primary button, amber secondary, red destructive.

Every new screen or component must keep both.

## Principles

1. **Content before chrome.** No decorative borders, gradients or shadows unless they carry
   meaning (selection, elevation of an overlay). Separate blocks with soft tinted cards
   (`--surface-tint`) and whitespace, not hairlines.
2. **Teal is the brand accent, lavender is the money action.** Teal (`--accent`) marks the
   active state, the order status dot, the total and links. Lavender (`--primary`) is reserved
   for the single primary action on a screen ("Proceder al pago / Cobrar", "Agregar a la
   orden"). Amber (`--warning`) is the cautionary secondary ("Vaciar orden"). Red
   (`--danger`) is only for destructive icons and text.
3. **Circles for products, pills for actions.** Product images are circular swatches;
   buttons, toggles and filters are fully rounded (`border-radius: 999px`); cards and panels
   use `12–16px` radii.
4. **Sectioned, not filtered.** The menu shows every category as a titled section; the sidebar
   is navigation (scroll-spy), never a filter.
5. **Mobile-first.** Base styles target phones (<768px). Tablet (`min-width: 768px`) and desktop
   (`min-width: 1024px`) layer on top. Never write a `max-width` query for a new rule.
6. **Spanish everywhere.** Every visible string, `aria-label`, error, empty state, PDF and CSV
   header is Spanish. Repeated copy lives in `src/lib/texts.ts`; dates use `toLocaleDateString('es')`,
   times are 24-hour, money is `$1,845.50` from `formatMoney(cents)`.
7. **Never colour alone.** Urgency, stock level and selection always carry an icon and a word
   ("Agotado", "Urgente", a check mark) as well as a colour.

## Palette (`src/index.css`)

Sampled from the mock. Light mode is the reference; dark mode keeps the same hues on a
charcoal base.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#ffffff` | `#16171d` | page and panel background |
| `--surface-2` | `#f3f4f6` | `#1c1d24` | app background behind the panel, sub-nav strip |
| `--surface-tint` | `#e3f6f8` | `#13343a` | line-item cards, totals block, toggle track |
| `--text` | `#5b6470` | `#9ca3af` | body text, secondary labels |
| `--text-h` | `#1f2933` | `#f3f4f6` | headings, item names, totals labels |
| `--border` | `#e5e7eb` | `#2e303a` | hairlines, input borders, panel edge |
| `--accent` | `#1c9aa6` | `#3fc1cc` | active toggle, status dot, total amount, links, focus ring |
| `--accent-bg` | `#d5f0f3` | `#163c42` | selected tile ring halo, hover washes |
| `--accent-text` | `#7c5cc4` | `#c4b5fd` | modifiers under an item name ("Barquillo Dulce • 2 bolas") |
| `--primary` | `#9f7fe5` | `#a78bfa` | primary CTA fill (white text) |
| `--primary-hover` | `#8b68d9` | `#9478e8` | primary CTA hover |
| `--warning` | `#f6d58a` | `#8a6a1f` | amber secondary button fill |
| `--warning-text` | `#9b2c2c` | `#ffe3a3` | text on the amber button |
| `--danger` | `#e53e3e` | `#f87171` | trash icon, destructive text |
| `--header-h` | `64px` | | sticky offsets |

Rules:
- **Readable text on tints.** Coloured text on a tinted fill is mixed toward `--text-h` so it
  passes AA in both themes, e.g. `color-mix(in srgb, var(--danger) 70%, var(--text-h))` on
  `color-mix(in srgb, var(--danger) 14%, var(--bg))`, and `color-mix(in srgb, var(--accent) 55%,
  var(--text-h))` on `--accent-bg`. Mix inline in each rule, never into a `:root` variable, so the
  light island used for the PDF (`[data-theme="light"]` on an element) resolves correctly.
- Never hard-code colours in components; use the tokens (or the Tailwind aliases in
  `tailwind.config.ts`). Add a token here before using a new colour anywhere.
- Text on `--surface-tint` uses `--text-h` / `--text`; text on `--accent` or `--primary` is
  white. All pairs above meet WCAG AA at body size.
- The old purple accent (`#aa3bff`) is retired; it survives only as `--accent-text` for
  modifier lines and the primary button, which the mock shows in lavender.

## Typography

System font stack, 18px base. Scale:

| Role | Size / weight | Example |
|---|---|---|
| Page title | `2rem / 700` | "Menú" |
| Section title | `1.5rem / 700` | "Artesanales" |
| Panel / order title | `1.25rem / 700` | "Orden #1044" (with teal dot) |
| Item name (panel, order line) | `1rem / 600` | "Helado Artesanal 2 Bolas" |
| Modifier line | `0.8rem / 500`, `--accent-text` | "Barquillo Dulce • Pistacho Siciliano" |
| Line price | `1rem / 700` | "$5.20" |
| Totals rows | `0.88rem / 400`, `--text` | "Subtotal (3 artículos)" |
| Total label | `1.15rem / 700`, `--text-h` | "Total a pagar" |
| Total amount | `1.5rem / 800`, `--accent` | "$16.50" |
| Button | `0.9–1rem / 600` | |
| Eyebrow / category | `0.72rem / 600 uppercase 0.08em` | |

Negative letter-spacing (`-0.02em` to `-0.03em`) on titles only.

## Breakpoints

| Name | Query | What changes |
|---|---|---|
| Mobile (base) | none | 2-column tiles, pill-row category bar, bottom-sheet panel, floating order bar |
| Tablet | `min-width: 768px` | Right-side drawer panel, roomier header and gutters |
| Desktop | `min-width: 1024px` | Sticky category sidebar, side panel column, order in the column, order bar hidden |

## Layout

```
SiteHeader (sticky, 64px)           logo · MENÚ · RESERVAR · [Panel staff]
SiteSubnav (sticky, 44px)           "Menú" tab
.menu grid  ≥1024px: 200px sidebar | content | 0 → 360px panel when open
            <1024px: pill-row sidebar on top, panel becomes a drawer,
                     a dark floating "order bar" summarises the order
```

- Sections: `h2` + `.menu__tiles` grid (`auto-fill, minmax(150px, 1fr)`, 2 columns on phones).
- Sticky elements offset from `calc(var(--header-h) + 44px + 1.5rem)`.
- The panel column exists only while an item is selected or the order has lines.
- The panel sits on `--bg` with a `1px --border` edge and `16px` radius; inside it, blocks are
  `--surface-tint` cards with `12px` radius and `0.85–1rem` padding, stacked with `0.6rem` gaps.

## Components (from the mock)

- **Order heading** — teal dot (`0.7rem`) + "Orden #N", `1.25rem/700`.
- **Mode toggle** — pill track in `--surface-tint`, two equal segments; the active one is a
  `--accent` pill with white text and its icon; the inactive shows the surcharge note
  "(+$0.30)" in `--text`.
- **Order line card** — `--surface-tint` card: name (`--text-h`) and modifiers
  (`--accent-text`) on the left, price bold right; below, a white pill stepper
  (`− 1 +`, `--text-h` glyphs) left and a `--danger` trash icon right.
- **Totals block** — `--surface-tint` card; rows `label … amount`; a hairline above the last
  row; "Total a pagar" in `--text-h` bold with the amount large in `--accent`.
- **Buttons**
  - Primary: `--primary` fill, white text, pill, full width, `0.9rem` vertical padding, icon
    left (e.g. a card/cash icon) + "Proceder al pago / Cobrar ($16.50)".
  - Secondary (hold): `--surface-tint` fill, `--text-h` text, pill, pause icon.
  - Warning (clear): `--warning` fill, `--warning-text` text, pill, cart icon.
  - Disabled: `opacity: 0.45`, no hover.
- **Side panel item view** — hero in the item colour or uploaded image, eyebrow category,
  title, envase line in `--accent-text`, description, **ScoopPicker** for artesanales
  (three pill buttons with a cone icon that grows per bola, price under each), then the
  primary "Agregar a la orden" button with the computed price on the right.
- **FlavorTile** — circular swatch (96px; 120px from desktop), name, price caption
  ("$2.60 / bola" for artesanales), optional "Agotado". Selected = `--accent` ring with a
  `--bg` gap around the circle.
- **MenuSidebar** — "Categorías" heading, plain links, active link bold `--text-h`; below desktop
  it is a sticky pill row where the active pill is `--accent` with white text.
- **Order bar (below desktop)** — floating dark pill (`--text-h` fill, `--bg` text) at the
  bottom: "Orden #N · 3 artículos" left, total in `--accent` + "Ver orden" right.
- **Inputs** — 1px `--border`, 8px radius, `--accent` focus ring (2px, 2px offset).

## Motion

Entrance only: tiles fade/slide in (staggered 45ms), panel slides in (300ms ease-out).
Hover: 3px lift on swatches, darker fill on buttons. Everything disabled under
`prefers-reduced-motion`.

## Owner panel components (P6)

### Staff layout and navigation
- Same sticky header as the menu (logo, "Panel del propietario" tag from 768px, "Tomar pedidos"
  pill, theme toggle, sign-out icon button) plus the sub-nav strip with icon + label tabs:
  Dashboard, Cola, Inventario, Categorías, Opciones, Reservas, Ajustes. The strip scrolls
  horizontally on phones; the active tab has the `--text-h` underline.
- Page background is `--surface-2`; content blocks are `--bg` cards (16–20px radius, no border).
  Inside a card, sub-blocks use `--surface-tint` (lines, totals) or `--surface-2` (footers, empty
  states, meters' track).
- **Queue badge** — amber pill (`--warning` / `--warning-text`, `0.7rem/800`) next to "Cola" in both
  bars (on phones the public bar shows it in the sub-nav "Cola del mostrador" tab).
- Page head: title `1.6rem/700` (`1.85rem` from 768px), one-line subtitle in `--text`, primary
  action pill on the right; wraps under the title on phones.

### Dialog and build modal (`Dialog`, `BuildModal`)
- `role="dialog"` (`alertdialog` for confirmations), `aria-modal`, labelled by its title; focus
  moves in, Tab is trapped, Escape / close button / backdrop close it, focus returns to the opener.
- Phones: bottom sheet, `20px 20px 0 0` radius, up to 92% of the viewport height. From 768px:
  centred, 16px radius, max width 440 / 560 / 720px (`sm` / `md` / `lg`). Backdrop `rgba(0,0,0,.45)`.
- Structure: header (fixed) · body (scrolls) · footer (fixed, hairline above). Close button is a
  `--surface-2` circle top-right.
- Build modal header is a `--surface-tint` band: 72px circular swatch of the base flavor, eyebrow
  "ARMA TU HELADO", name `1.3rem/700`, description, "Base · $2.60 por bola".
- Sections ("Bolas adicionales", "Envase", "Extras", "Toppings") are separated by hairlines; each
  has a `1rem/700` title and a `0.78rem` meta on the right ("Opcional · 2 de 3 bolas"). The scoop
  order summary sits in a `--surface-2` pill in `--accent-text` ("1. Pistacho (base) · 2. …").
- Footer: small stepper (helados 1–20) + primary pill that grows, label left and live price right
  ("Agregar al pedido … $6.40" / "Guardar cambios … $6.40"); a red reason line appears above when
  stock blocks it.
- Confirmations: `sm` dialog, title is the question ("¿Cobrar $14.08?"), actions right-aligned
  (full-width on phones) with "Cancelar" as a ghost button last.

### Option cards (`OptionCard`)
- A real `radio` (envase) or `checkbox` (bolas, extras, toppings) visually hidden inside a label.
- `--surface-tint` card, 14px radius, min height 64px; 40px circle media (icon in `--accent` on
  `--bg`, or the product swatch/image); title `0.86rem/600`; price `0.8rem/700` mixed accent
  ("+$0.50", or "Incluido" at 0).
- Checked: `--accent-bg` fill, 2px inset `--accent` ring and a filled check circle top-right
  (the check is the non-colour cue). Unavailable: 55% opacity, `aria-disabled`, reason in red text
  ("Agotado", "Máximo alcanzado", "Sin stock disponible"). Focus: 2px `--accent` outline.
- Grid: 2 columns on phones, 3 from 560px. A scoop card that is chosen shows a small stepper under it.

### Queue cards (`QueueCard`)
- `--bg` card, 16px radius; grid of 1 / 2 / 3 columns (base / 768 / 1024).
- Head: "Orden #N" `1.15rem/700`, creation time under it, service chip (icon + text) right.
- Age pill: clock icon + "hace 12 min" + status word. A tiempo: `--surface-tint`; Demorado
  (amber minutes from Ajustes): `--warning`; Urgente (red minutes): danger tint. The card also gets
  a 4px inset top stripe in amber or red.
- Customer, note and address as icon rows; each line is a `--surface-tint` block with "2 × name",
  amount, and a `--accent-text` detail list (Bolas, Envase, Extras, Toppings).
- Totals block like the order panel (total `1.35rem/800 --accent`), then primary "Cobrar $X"
  full width and a two-column row: secondary "Editar", warning "Cancelar pedido".
- Above the grid: summary strip of two `--bg` pills ("Pedidos por cobrar: N", "Total por cobrar")
  and a segmented filter (Todos / Presencial / Delivery with counts).

### KPI cards (`KpiCards`)
- Four `--bg` cards, 20px radius: 1 column on phones, 2 from 560px, 4 from 1024px.
- Uppercase `0.72rem/700` label, 40px `--surface-tint` icon circle top-right, value `1.85rem/800`
  with the variation pill beside it, a 36px sparkline (`--accent`, no axes), and a `--surface-2`
  footer pill "label … value". Profit and orders add a 6px progress bar (`--accent` on `--surface-2`).
- **Variation pill**: up = `--accent-bg` + trend-up icon, down = danger tint + trend-down icon,
  "Nuevo" / "Sin datos previos" = neutral `--surface-2`. Text is "+12 %" (space before %).

### Charts (`components/dashboard/*`)
- Every chart sits in a `ChartCard`: title `1.05rem/700`, subtitle `0.8rem`, controls right
  (mini segmented, pill select), visual wrapped in `role="img"` with an `aria-label` summary and a
  visually hidden list of key values; empty data shows a `--surface-2` message block instead.
- Grid: 1 column, 2 from 768px, 3 from 1024px; wide cards span 2.
- **Series palette** (only tokens):
  - current period: `--accent` line 2.5px with a gradient area (30% → 2% opacity);
  - previous period: `--text`, 2px, dashed `5 5`, no area;
  - categories, in category order: `--accent`, `--primary`, `--warning`, `--accent-text`,
    `--text-h`, `--danger`;
  - status: ok `--accent`, soon / low `--warning`, now / sold out `--danger`;
  - Presencial `--accent`, Delivery `--primary`; peak marker `--warning` dot with `--warning-text` ring.
- Axes: no axis lines or tick marks, `11px` `--text` ticks, horizontal dashed grid in `--border`.
- Tooltips: `--bg`, 1px `--border`, 12px radius, `12px` text; Recharts `accessibilityLayer` lets
  keyboard users move through points with the arrow keys.
- Ranked and meter bars are HTML: 10px pill track in `--surface-2`, bar in the series colour;
  supply bars add dashed `--text` rules at 1 and 3 days with labels above.
- Callouts (hora pico, ganador) are 12px-radius bands: amber tint
  `color-mix(--warning 45%, --bg)` or `--accent-bg`, text `--text-h`.
- Charts never animate (also covers reduced motion).

### Export menu (`ExportMenu`)
- Primary pill "Exportar" with download icon and chevron, `aria-expanded`. The menu is a `--bg`
  card with `--shadow`, 14px radius, min width 260px (left-aligned on phones, right from 768px);
  items are icon + title `0.88rem/600` + hint `0.74rem`, hover/focus `--surface-tint`, Escape closes.
- PDF: every `[data-pdf-block]` is captured with the dashboard forced to the light island at a
  1280px desktop layout, then placed on A4 (wide blocks full width, half blocks paired), never
  split across pages. A hidden header block (store, title, period, generation date) is shown only
  while exporting. A full-screen "Generando PDF…" overlay hides the reflow.

### Other building blocks
- Chips (`0.72rem/700` pills): accent, warning, danger, neutral. Buttons: primary (lavender),
  secondary (`--surface-tint`), warning (amber), danger (outlined red), ghost; `--sm` and `--block`.
- Fields: label `0.85rem/600`, input with 1px `--border`, 8px radius, `--accent` focus ring; hints
  `0.78rem`; errors `0.8rem/600` mixed red under the field. Money inputs show a `$` prefix.
- Switch (`role="switch"`), segmented control (tint track, accent active pill), steppers
  (`− n +` pill with a `--border` ring), icon picker (44px tint squares, accent ring when chosen),
  toasts (dark `--text-h` pill at the bottom, link + close), storage notice (amber, top-right).

## Data rules

- Categories live in Redux (`categories`): name, icon, order, `buildable`, `archived`;
  `Artesanales` is protected and always buildable. The menu shows active categories in their order,
  only when they have active products. Unknown categories migrate to "Otros".
- All money is integer cents (`priceCents`, `costCents`). Buildable products are priced **per
  scoop**; a built line costs Σ scoops + envase + extras + toppings. Plain lines use `priceCents`.
- Delivery surcharge and IVA come from Ajustes (defaults $0.30 and 10 %); IVA is rounded once on
  subtotal + surcharge. Income in the dashboard excludes IVA.
- Envases, extras and toppings are catalog options with a price (0 = "Incluido") and no stock.
- Order lines freeze names, prices and costs (snapshots) when added; later price changes do not
  touch registered orders. Each scoop consumes one unit of its flavor's stock.
- Images are compressed to 512px WebP/JPEG data URLs; without one the colour swatch is shown.
- Everything persists in `localStorage` under `ics-state-v1` (versioned, migrated on load).

## Checklist for a new screen

- [ ] Uses tokens only; teal for state, lavender for the one primary action, amber for the
      cautionary secondary, red only for destructive.
- [ ] Blocks are `--surface-tint` cards, not bordered boxes.
- [ ] Headings follow the scale above; all copy is Spanish (`src/lib/texts.ts` for shared strings).
- [ ] Status never relies on colour alone (icon or word next to it).
- [ ] Designed at 375px first, then checked at 768px and 1280px; no horizontal overflow at any width.
- [ ] Keyboard reachable with visible focus; overlays trap focus and close on Escape.
- [ ] Reduced-motion respected.
