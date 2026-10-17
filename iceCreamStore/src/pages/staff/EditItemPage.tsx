import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductForm } from '@/components/staff/ProductForm'
import { Icon } from '@/components/icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectProductById, updateProduct } from '@/store/slices/inventorySlice'
import { pushToast } from '@/store/slices/uiSlice'

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const product = useAppSelector((state) => selectProductById(state, id ?? ''))

  return (
    <div className="staff-page staff-page--narrow">
      <Link to="/staff/inventory" className="back-link"><Icon name="chevron-left" size={16} /> Volver al inventario</Link>
      {!product ? (
        <p className="staff-page__empty">No se encontró el producto.</p>
      ) : (
        <>
          <h1 className="staff-page__title">Editar: {product.name}</h1>
          <ProductForm
            key={product.id}
            initial={product}
            submitLabel="Guardar cambios"
            onSubmit={(data) => {
              const next = { ...data, id: product.id, archived: product.archived, createdAt: product.createdAt }
              dispatch(updateProduct(next))
              dispatch(pushToast({ message: `"${data.name}" actualizado` }))
              navigate('/staff/inventory')
            }}
          />
        </>
      )}
    </div>
  )
}
