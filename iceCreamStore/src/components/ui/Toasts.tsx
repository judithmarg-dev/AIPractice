import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { dismissToast, selectStorageError, selectToasts, type Toast } from '@/store/slices/uiSlice'
import { T } from '@/lib/texts'

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch()
  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), toast.link ? 7000 : 4000)
    return () => clearTimeout(timer)
  }, [dispatch, toast.id, toast.link])

  return (
    <div className={`toast${toast.tone === 'error' ? ' toast--error' : ''}`}>
      <Icon name={toast.tone === 'error' ? 'alert' : 'check'} size={18} />
      <span className="toast__message">{toast.message}</span>
      {toast.link && (
        <Link className="toast__link" to={toast.link.to} onClick={() => dispatch(dismissToast(toast.id))}>
          {toast.link.label}
        </Link>
      )}
      <button type="button" className="toast__close" onClick={() => dispatch(dismissToast(toast.id))} aria-label={T.close}>
        <Icon name="close" size={16} />
      </button>
    </div>
  )
}

/** Brief confirmations plus the discreet storage warning (RF-0.2). */
export function Toasts() {
  const toasts = useAppSelector(selectToasts)
  const storageError = useAppSelector(selectStorageError)
  return (
    <>
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
      {storageError && (
        <p className="storage-notice" role="note">
          <Icon name="alert" size={16} /> {T.storageFailed}
        </p>
      )}
    </>
  )
}
