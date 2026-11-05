import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@/components/icons'
import { T } from '@/lib/texts'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface DialogProps {
  onClose: () => void
  title: string
  /** Shown under the title. */
  description?: ReactNode
  /** Replaces the default title row (the title is still used as the accessible name). */
  header?: ReactNode
  children: ReactNode
  /** Fixed under the scrolling body. */
  footer?: ReactNode
  /** Max width from 768px: sm 440px, md 560px, lg 720px. */
  size?: 'sm' | 'md' | 'lg'
  /** Alert dialogs are announced as such (confirmations). */
  role?: 'dialog' | 'alertdialog'
}

/**
 * Accessible modal (RF-4.2): bottom sheet on phones, centred from 768px. Traps focus, closes
 * on Escape, the close button and the backdrop, and returns focus to the opener.
 */
export function Dialog({ onClose, title, description, header, children, footer, size = 'md', role = 'dialog' }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const first = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? panel)?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onCloseRef.current()
      return
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null)
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div className="dialog" onKeyDown={handleKeyDown}>
      <div className="dialog__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`dialog__panel dialog__panel--${size}`}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
      >
        <button type="button" className="dialog__close" onClick={onClose} aria-label={T.close}>
          <Icon name="close" />
        </button>
        {header ? (
          <div className="dialog__header-custom">
            <h2 id={titleId} className="sr-only">{title}</h2>
            {header}
          </div>
        ) : (
          <div className="dialog__header">
            <h2 id={titleId} className="dialog__title">{title}</h2>
            {description && <div id={descId} className="dialog__description">{description}</div>}
          </div>
        )}
        <div className="dialog__body">{children}</div>
        {footer && <div className="dialog__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
