import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearDraft, discardEdit, loadForEdit, selectDraft, selectEditingOrder } from '@/store/slices/orderSlice'
import { pushToast } from '@/store/slices/uiSlice'
import { submitDraft } from '@/store/orderActions'
import { useChoice } from '@/components/ui/ConfirmProvider'

/** RF-6.5: loads a queued order into the panel, resolving a draft already in progress first. */
export function useEditOrder() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const ask = useChoice()
  const draft = useAppSelector(selectDraft)
  const editing = useAppSelector(selectEditingOrder)

  return useCallback(
    async (orderId: string) => {
      const open = () => navigate('/', { state: { openOrder: true } })
      if (editing?.id === orderId) return open()

      if (editing || draft.lines.length > 0) {
        const choice = await ask({
          title: editing ? `Ya estás editando la Orden #${editing.number}` : 'Hay una orden en curso',
          message: editing
            ? 'Antes de editar otra orden, decide qué hacer con los cambios de la actual.'
            : 'El panel de orden tiene productos sin guardar. ¿Qué quieres hacer con ellos?',
          actions: [
            { id: 'save', label: editing ? 'Guardar cambios en la cola' : 'Guardar en la cola', tone: 'primary' },
            { id: 'discard', label: editing ? 'Descartar cambios' : 'Descartar orden', tone: 'warning' },
          ],
          cancelLabel: 'Cancelar edición',
        })
        if (!choice) return
        if (choice === 'save') {
          const result = dispatch(submitDraft('queue'))
          if (!result.ok) {
            dispatch(pushToast({ message: result.error, tone: 'error' }))
            return
          }
          dispatch(pushToast({ message: `Orden #${result.order.number} guardada en la cola` }))
        } else {
          dispatch(editing ? discardEdit() : clearDraft())
        }
      }
      dispatch(loadForEdit(orderId))
      open()
    },
    [ask, dispatch, draft.lines.length, editing, navigate]
  )
}
