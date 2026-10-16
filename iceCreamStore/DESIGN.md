# DESIGN.md — IceCreamStore visual system

Read this before touching any customer-facing screen (menu, order panel, booking, login).
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
6. **Spanish copy on customer surfaces.** The menu, the order panel and booking are in Spanish.
   Staff pages may stay in English.

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

## Data rules

- Categories are fixed: `artesanal`, `paleta`, `milkshake`, `bebida` (labels Artesanales,
  Paletas, Milkshakes, Bebidas). Unknown categories fall into "Otros".
- Prices are stored as numbers in USD. For *artesanal* items the stored price is **per scoop**
  (bola); the order line price is `price × scoops`.
- Delivery adds a flat `$0.30` surcharge; IVA is 10% of subtotal + surcharge.
- Images are optional data URLs uploaded by staff; when absent the colour swatch is shown.

## Checklist for a new screen

- [ ] Uses tokens only; teal for state, lavender for the one primary action, amber for the
      cautionary secondary, red only for destructive.
- [ ] Blocks are `--surface-tint` cards, not bordered boxes.
- [ ] Headings follow the scale above; copy is Spanish on customer surfaces.
- [ ] Designed at 375px first, then checked at 768px and 1280px; no horizontal overflow at any width.
- [ ] Keyboard reachable with visible focus; overlays trap focus and close on Escape.
- [ ] Reduced-motion respected.
