import { Link, useNavigate } from 'react-router-dom'
import { ProductForm } from '@/components/staff/ProductForm'
import { Icon } from '@/components/icons'
import { useAppDispatch } from '@/store/hooks'
import { addProduct } from '@/store/slices/inventorySlice'
import { pushToast } from '@/store/slices/uiSlice'
import { slugId } from '@/lib/validation'

export default function NewItemPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return (
    <div className="staff-page staff-page--narrow">
      <Link to="/staff/inventory" className="back-link"><Icon name="chevron-left" size={16} /> Volver al inventario</Link>
      <h1 className="staff-page__title">Nuevo producto</h1>
      <ProductForm
        submitLabel="Crear producto"
        onSubmit={(data) => {
          dispatch(addProduct({ ...data, id: slugId(data.name), archived: false, createdAt: new Date().toISOString() }))
          dispatch(pushToast({ message: `"${data.name}" creado` }))
          navigate('/staff/inventory')
        }}
      />
    </div>
  )
}
