import { zodResolver } from '@hookform/resolvers/zod'
import { Minus, Pencil, Plus, PlusCircle, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { rupiah } from '../data/merchant'
import {
  MENU_LOW_STOCK_THRESHOLD,
  countLowStock,
  countOutOfStock,
} from '../data/merchantMenu'
import { merchantMenuItemSchema, type MerchantMenuItemFormData } from '../lib/schemas'
import { adjustStock, removeMenuItem, upsertMenuItem } from '../store/slices/merchantSlice'
import type { MerchantMenuItem } from '../types'

const EMPTY: MerchantMenuItemFormData = { name: '', price: 0, category: '', stock: 0 }

export default function MerchantMenu() {
  const dispatch = useAppDispatch()
  const menu = useAppSelector((s) => s.merchant.menu)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<MerchantMenuItem | null>(null)
  const [pendingId, setPendingId] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MerchantMenuItemFormData>({
    resolver: zodResolver(merchantMenuItemSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (editing) reset({ ...editing })
    else reset(EMPTY)
  }, [editing, reset])

  const onSubmit = (data: MerchantMenuItemFormData) => {
    dispatch(
      upsertMenuItem({
        id: editing?.id ?? pendingId,
        name: data.name,
        price: data.price,
        category: data.category,
        stock: data.stock,
      }),
    )
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <header className="merchant-header merchant-header-row">
          <h1 className="merchant-title">Menu &amp; Stock</h1>
          <button
            type="button"
            className="merchant-btn-ghost"
            onClick={() => {
              setEditing(null)
              setPendingId(crypto.randomUUID())
              setShowForm((v) => !v)
            }}
          >
            <PlusCircle size={16} strokeWidth={1.75} /> Tambah item
          </button>
        </header>

        <section className="merchant-stats">
          <div className="merchant-stat">
            <span className="merchant-stat-value">{menu.length}</span>
            <span className="merchant-stat-label">Total item</span>
          </div>
          <div className="merchant-stat">
            <span className="merchant-stat-value">{countLowStock(menu)}</span>
            <span className="merchant-stat-label">Stok menipis</span>
          </div>
          <div className="merchant-stat">
            <span className="merchant-stat-value">{countOutOfStock(menu)}</span>
            <span className="merchant-stat-label">Habis</span>
          </div>
        </section>

        {showForm || editing ? (
          <form className="merchant-card merchant-form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nama item
              </label>
              <input
                id="name"
                className={`form-control${errors.name ? ' error' : ''}`}
                {...register('name')}
              />
              {errors.name ? <span className="error-message">{errors.name.message}</span> : null}
            </div>
            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Harga
              </label>
              <input
                id="price"
                type="number"
                className={`form-control${errors.price ? ' error' : ''}`}
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price ? <span className="error-message">{errors.price.message}</span> : null}
            </div>
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Kategori
              </label>
              <input
                id="category"
                className={`form-control${errors.category ? ' error' : ''}`}
                {...register('category')}
              />
              {errors.category ? (
                <span className="error-message">{errors.category.message}</span>
              ) : null}
            </div>
            <div className="form-group">
              <label htmlFor="stock" className="form-label">
                Stok
              </label>
              <input
                id="stock"
                type="number"
                className={`form-control${errors.stock ? ' error' : ''}`}
                {...register('stock', { valueAsNumber: true })}
              />
              {errors.stock ? <span className="error-message">{errors.stock.message}</span> : null}
            </div>
            <div className="merchant-actions">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                Simpan
              </button>
              <button
                type="button"
                className="merchant-btn-ghost"
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
              >
                Batal
              </button>
            </div>
          </form>
        ) : null}

        {menu.map((item) => (
          <section key={item.id} className="merchant-menu-item">
            <div className="merchant-menu-body">
              <p className="merchant-card-title">{item.name}</p>
              <p className="merchant-card-sub">
                {rupiah(item.price)} · {item.category}
              </p>
              <p
                className={`merchant-menu-stock${
                  item.stock === 0
                    ? ' is-out'
                    : item.stock <= MENU_LOW_STOCK_THRESHOLD
                      ? ' is-low'
                      : ''
                }`}
              >
                {item.stock === 0 ? 'Stok habis' : `${item.stock} tersedia`}
              </p>
            </div>
            <div className="merchant-menu-actions">
              <button
                type="button"
                aria-label={`Tambah stok ${item.name}`}
                onClick={() => dispatch(adjustStock({ id: item.id, delta: 10 }))}
              >
                <Plus size={16} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label={`Kurangi stok ${item.name}`}
                onClick={() => dispatch(adjustStock({ id: item.id, delta: -1 }))}
              >
                <Minus size={16} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label={`Ubah ${item.name}`}
                onClick={() => {
                  setEditing(item)
                  setShowForm(true)
                }}
              >
                <Pencil size={16} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label={`Hapus ${item.name}`}
                onClick={() => dispatch(removeMenuItem(item.id))}
              >
                <Trash2 size={16} strokeWidth={1.75} />
              </button>
            </div>
          </section>
        ))}
      </main>
      <MerchantBottomNav />
    </div>
  )
}
