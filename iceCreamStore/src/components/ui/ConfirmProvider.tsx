import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { Dialog } from './Dialog'
import { T } from '@/lib/texts'

export interface ChoiceAction {
  id: string
  label: string
  tone?: 'primary' | 'secondary' | 'warning' | 'danger'
}

interface ChoiceRequest {
  title: string
  message?: ReactNode
  actions: ChoiceAction[]
  cancelLabel?: string
}

type Ask = (request: ChoiceRequest) => Promise<string | null>

const ChoiceContext = createContext<Ask | null>(null)

/** Hosts the app's confirmation dialogs; components ask through `useConfirm` / `useChoice`. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ChoiceRequest | null>(null)
  const resolver = useRef<((value: string | null) => void) | null>(null)

  const ask = useCallback<Ask>((req) => {
    resolver.current?.(null)
    setRequest(req)
    return new Promise((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const settle = (value: string | null) => {
    resolver.current?.(value)
    resolver.current = null
    setRequest(null)
  }

  return (
    <ChoiceContext.Provider value={ask}>
      {children}
      {request && (
        <Dialog
          role="alertdialog"
          size="sm"
          title={request.title}
          description={request.message}
          onClose={() => settle(null)}
          footer={
            <div className="dialog__actions">
              {request.actions.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  className={`btn btn--${a.tone ?? 'primary'}`}
                  onClick={() => settle(a.id)}
                  data-autofocus={i === 0 ? true : undefined}
                >
                  {a.label}
                </button>
              ))}
              <button type="button" className="btn btn--ghost" onClick={() => settle(null)}>
                {request.cancelLabel ?? T.cancel}
              </button>
            </div>
          }
        >
          {null}
        </Dialog>
      )}
    </ChoiceContext.Provider>
  )
}

export function useChoice(): Ask {
  const ask = useContext(ChoiceContext)
  if (!ask) throw new Error('useChoice must be used inside ConfirmProvider')
  return ask
}

/** Resolves true when the user accepts. */
export function useConfirm() {
  const ask = useChoice()
  return useCallback(
    async (opts: { title: string; message?: ReactNode; confirmLabel?: string; tone?: ChoiceAction['tone'] }) =>
      (await ask({
        title: opts.title,
        message: opts.message,
        actions: [{ id: 'ok', label: opts.confirmLabel ?? T.confirm, tone: opts.tone }],
      })) === 'ok',
    [ask]
  )
}
