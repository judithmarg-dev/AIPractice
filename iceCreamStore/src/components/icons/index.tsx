// Inline SVG icon set (RF-0.7). Every icon is a 24×24 stroke drawing in currentColor.
import type { ReactNode } from 'react'

/** Icons the owner can pick for categories and options. */
const PICKABLE = {
  cone: { label: 'Cono', d: <><circle cx="12" cy="8" r="5" /><path d="M7.5 10.5 12 22l4.5-11.5" /><path d="M9.6 14.5l4-1.6M10.7 17.6l2.2-.9" /></> },
  cup: { label: 'Vaso', d: <><path d="M5 4h14l-2 16.2a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.8z" /><path d="M5.6 9h12.8" /></> },
  waffle: { label: 'Barquillo', d: <><path d="M4 7h16l-8 15z" /><path d="M8 7l6.2 10.8M12 7l4.3 7.4M16 7 9.8 17.8M12 7l-4.3 7.4" /></> },
  tub: { label: 'Tarrina', d: <><path d="M4 10h16l-1.5 9.5a2 2 0 0 1-2 1.5h-9a2 2 0 0 1-2-1.5z" /><path d="M6 10a3 3 0 0 1 4-3 3 3 0 0 1 4 0 3 3 0 0 1 4 3" /></> },
  basket: { label: 'Canasta', d: <><path d="M3 10h18l-2 10H5z" /><path d="M7 10l3-6M17 10l-3-6M9 14v3M12 14v3M15 14v3" /></> },
  popsicle: { label: 'Paleta', d: <><path d="M7 10a5 5 0 0 1 10 0v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" /><path d="M12 18v4M10 8v5" /></> },
  shake: { label: 'Batido', d: <><path d="M6 9h12l-1.5 12h-9z" /><path d="M5 9a7 4 0 0 1 14 0" /><path d="M13 5.2 16 2" /></> },
  sundae: { label: 'Copa', d: <><path d="M4 11h16c0 3.5-3.5 6-8 6s-8-2.5-8-6z" /><path d="M12 17v4M8 21h8M7 11a5 5 0 0 1 10 0" /></> },
  bottle: { label: 'Botella', d: <><path d="M10 2h4v4l2 3v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3z" /><path d="M8 13h8" /></> },
  coffee: { label: 'Café', d: <><path d="M4 9h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3" /></> },
  strawberry: { label: 'Fresa', d: <><path d="M12 7c4.5 0 7 2.5 7 5.5 0 4-3.5 8.5-7 9.5-3.5-1-7-5.5-7-9.5C5 9.5 7.5 7 12 7z" /><path d="M9 4l3 3 3-3M12 2v5M9.5 12h.01M14.5 12h.01M12 15h.01M10 18h.01M14 18h.01" /></> },
  lemon: { label: 'Limón', d: <><ellipse cx="12" cy="12" rx="8" ry="6" transform="rotate(-30 12 12)" /><path d="M18.5 5.5 20 4M5.5 18.5 4 20" /></> },
  cherry: { label: 'Cereza', d: <><circle cx="7.5" cy="17" r="3.5" /><circle cx="16.5" cy="17" r="3.5" /><path d="M7.5 13.5C9 9 11 5 15 3M16.5 13.5C16 9 15.5 6 15 3" /></> },
  leaf: { label: 'Menta', d: <><path d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15z" /><path d="M5 19l8-8" /></> },
  chocolate: { label: 'Chocolate', d: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M5 9h14M5 15h14M12 3v18" /></> },
  sprinkles: { label: 'Chispas', d: <path d="M5 7l2 1M11 4l1 2M17 6l2-1M7 13l-1 2M12 11l2 1M18 12l1 2M9 19l2-1M15 18l1 2" /> },
  nut: { label: 'Nuez', d: <><path d="M12 3c4 2 6 6 6 10a6 6 0 0 1-12 0c0-4 2-8 6-10z" /><path d="M12 7v10" /></> },
  sauce: { label: 'Salsa', d: <path d="M3 4h18v3a2 2 0 0 1-2 2 2 2 0 0 0-2 2v3a1.5 1.5 0 0 1-3 0v-1a2 2 0 0 0-4 0v5a1.5 1.5 0 0 1-3 0V10a2 2 0 0 0-2-2 2 2 0 0 1-2-2z" /> },
  cream: { label: 'Crema', d: <><path d="M5 19h14" /><path d="M6 19c-1.5-3 1-5 3-4.5C8 11 10.5 9 12 9s4 2 3 5.5c2-.5 4.5 1.5 3 4.5M12 9c0-2 1-4 3-5" /></> },
  cookie: { label: 'Galleta', d: <><circle cx="12" cy="12" r="9" /><path d="M8.5 9h.01M14 8h.01M15.5 13h.01M10 15h.01M12 12h.01" /></> },
  candy: { label: 'Caramelo', d: <><circle cx="12" cy="12" r="4" /><path d="M8.5 10 4 7v10l4.5-3M15.5 10 20 7v10l-4.5-3" /></> },
  cake: { label: 'Pastel', d: <><path d="M4 21h16v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z" /><path d="M4 16c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5M12 11V7M12 4h.01" /></> },
  droplet: { label: 'Gota', d: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /> },
  snowflake: { label: 'Frío', d: <path d="M12 2v20M3.5 7l17 10M3.5 17l17-10M9 3.5l3 2 3-2M9 20.5l3-2 3 2" /> },
  star: { label: 'Estrella', d: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /> },
  heart: { label: 'Corazón', d: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /> },
  grid: { label: 'Otros', d: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></> },
} satisfies Record<string, { label: string; d: ReactNode }>

/** Interface glyphs; not offered in the picker. */
const UI = {
  close: <path d="M18 6 6 18M6 6l12 12" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="M5 12.5 10 17 19 7" />,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /><path d="M10 11v6M14 11v6" /></>,
  'chevron-left': <path d="M15 18 9 12l6-6" />,
  'chevron-right': <path d="M9 18l6-6-6-6" />,
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  'arrow-up': <path d="M12 19V5M6 11l6-6 6 6" />,
  'arrow-down': <path d="M12 5v14M6 13l6 6 6-6" />,
  'trend-up': <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  'trend-down': <><path d="M3 7l6 6 4-4 8 8" /><path d="M15 17h6v-6" /></>,
  alert: <><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17h.01" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  money: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></>,
  receipt: <><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" /><path d="M9 7h6M9 11h6M9 15h4" /></>,
  bag: <><path d="M5 8h14l-1 13H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  store: <><path d="M3 9l1.5-5h15L21 9" /><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" /><path d="M5 13v8h14v-8M10 21v-5h4v5" /></>,
  bike: <><circle cx="6" cy="17" r="3.5" /><circle cx="18" cy="17" r="3.5" /><path d="M6 17l4-8h5l3 8M10 9 8 5H6M15 9l-2 8" /></>,
  download: <><path d="M12 4v11M7 10l5 5 5-5" /><path d="M4 20h16" /></>,
  pause: <><circle cx="12" cy="12" r="9" /><path d="M10 9v6M14 9v6" /></>,
  cart: <><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M2 3h3l2.5 12h11L21 7H7" /></>,
  archive: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" /></>,
  restore: <><path d="M4 12a8 8 0 1 0 2.3-5.7" /><path d="M4 4v5h5" /></>,
  'eye-off': <><path d="M3 3l18 18" /><path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a16 16 0 0 1-2.6 3.2M6.4 7.4A16 16 0 0 0 3 12s4 6 9 6a9 9 0 0 0 4-.9" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  eye: <><path d="M3 12s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="3" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  queue: <><rect x="3" y="4" width="18" height="4" rx="1" /><rect x="3" y="10" width="18" height="4" rx="1" /><rect x="3" y="16" width="18" height="4" rx="1" /></>,
  layers: <><path d="M12 3 2 8l10 5 10-5z" /><path d="M2 13l10 5 10-5" /></>,
  sliders: <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  box: <><path d="M3 7l9-4 9 4v10l-9 4-9-4z" /><path d="M3 7l9 4 9-4M12 11v10" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  note: <><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v4h4M8 12h8M8 16h5" /></>,
  pin: <><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z" /></>,
  logout: <><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></>,
} satisfies Record<string, ReactNode>

export type IconId = keyof typeof PICKABLE
export type UiIconId = keyof typeof UI
export type IconName = IconId | UiIconId

export const PICKER_ICONS: { id: IconId; label: string }[] = (Object.keys(PICKABLE) as IconId[]).map(
  (id) => ({ id, label: PICKABLE[id].label })
)

export function isIconId(value: unknown): value is IconId {
  return typeof value === 'string' && value in PICKABLE
}

interface IconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
  /** Accessible name; when absent the icon is decorative. */
  label?: string
}

export function Icon({ name, size = 20, strokeWidth = 1.8, className, label }: IconProps) {
  const body = name in PICKABLE ? PICKABLE[name as IconId].d : UI[name as UiIconId]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {body}
    </svg>
  )
}
