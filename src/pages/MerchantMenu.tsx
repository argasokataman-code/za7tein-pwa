import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Minus, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { BottomSheet } from '../components/ui/BottomSheet'
import { useCatalog } from '../hooks/useCatalog'
import { useAppDispatch } from '../hooks/useAppStore'
import { CATEGORIES, MENU_LOW_STOCK_THRESHOLD, countLowStock, countOutOfStock } from '../data/catalog'
import { rupiah } from '../data/merchant'
import { merchantMenuItemSchema, type MerchantMenuItemFormData } from '../lib/schemas'
import { addMenuItem, removeMenuItem, setStock, toggleAvailable, updateMenuItem } from '../store/slices/catalogSlice'
import type { MenuItem } from '../types'

const EMPTY_FORM: MerchantMenuItemFormData = { name: '', price: 0, category: '', stock: 0 }
const FALLBACK_IMAGE = '/assets/img/menu-details/menu-details-thumb.png'

export default function MerchantMenu() {
  const dispatch = useAppDispatch()
  const { items } = useCatalog()

  const lowCount = countLowStock(items)
  const outCount = countOutOfStock(items)
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')
  const visibleItems = items.filter((item) =>
    stockFilter === 'out' ? item.stock <= 0 :
      stockFilter === 'low' ? item.stock > 0 && item.stock <= MENU_LOW_STOCK_THRESHOLD : true,
  )

  const [overflowId, setOverflowId] = useState<string | null>(null)
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null)

  /* ── stock sheet ── */
  const [stockItem, setStockItem] = useState<MenuItem | null>(null)
  const [stockDraft, setStockDraft] = useState(0)

  const openStock = (item: MenuItem) => {
    setStockItem(item)
    setStockDraft(item.stock)
    setOverflowId(null)
  }

  const closeStock = () => {
    setStockItem(null)
    setStockDraft(0)
  }

  const saveStock = () => {
    if (stockItem) dispatch(setStock({ id: stockItem.id, stock: stockDraft }))
    closeStock()
  }

  /* ── add/edit sheet ── */
  const [sheetMode, setSheetMode] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [formImage, setFormImage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MerchantMenuItemFormData>({
    resolver: zodResolver(merchantMenuItemSchema),
    defaultValues: EMPTY_FORM,
  })

  const openAdd = () => {
    reset(EMPTY_FORM)
    setFormImage(null)
    setEditing(null)
    setSheetMode('add')
    setOverflowId(null)
  }

  const openEdit = (item: MenuItem) => {
    reset({
      name: item.name,
      price: item.price,
      category: item.category,
      stock: item.stock,
      description: item.description ?? '',
    })
    setFormImage(item.image)
    setEditing(item)
    setSheetMode('edit')
  }

  const closeSheet = () => {
    setSheetMode(null)
    setEditing(null)
    setFormImage(null)
  }

  const onSubmit = (data: MerchantMenuItemFormData) => {
    if (sheetMode === 'edit' && editing) {
      dispatch(updateMenuItem({
        ...editing,
        name: data.name,
        price: data.price,
        category: data.category,
        stock: data.stock,
        image: formImage || editing.image,
        description: data.description ?? editing.description,
      }))
    } else {
      dispatch(addMenuItem({
        id: crypto.randomUUID(),
        name: data.name,
        price: data.price,
        category: data.category,
        stock: data.stock,
        image: formImage || FALLBACK_IMAGE,
        description: data.description ?? '',
        rating: 5,
        reviewCount: 0,
        deliveryTime: '20-30 min',
        distance: '1.2 km',
        available: true,
      }))
    }
    closeSheet()
  }

  const handleImagePick = () => {
    fileRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFormImage(String(reader.result))
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  /* ── close overflow on outside click ── */
  useEffect(() => {
    if (!overflowId) return
    const close = () => setOverflowId(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [overflowId])

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <header className="merchant-header merchant-header-row">
          <h1 className="merchant-title">Menu &amp; Stok</h1>
          <button type="button" className="merchant-add-btn" onClick={openAdd}>
            <Plus size={16} strokeWidth={1.75} /> Tambah Item
          </button>
        </header>

        <div className="merchant-menu-overview" role="group" aria-label="Filter status stok">
          <button type="button" className={`merchant-menu-stat${stockFilter === 'all' ? ' is-active' : ''}`} aria-pressed={stockFilter === 'all'} onClick={() => setStockFilter('all')}>
            <strong>{items.length}</strong><span>Semua menu</span>
          </button>
          <button type="button" className={`merchant-menu-stat is-low${stockFilter === 'low' ? ' is-active' : ''}`} aria-pressed={stockFilter === 'low'} onClick={() => setStockFilter('low')}>
            <strong>{lowCount}</strong><span>Menipis</span>
          </button>
          <button type="button" className={`merchant-menu-stat is-out${stockFilter === 'out' ? ' is-active' : ''}`} aria-pressed={stockFilter === 'out'} onClick={() => setStockFilter('out')}>
            <strong>{outCount}</strong><span>Habis</span>
          </button>
        </div>

        <div className="merchant-menu-list-head">
          <h2 className="merchant-section-title">{stockFilter === 'all' ? 'Semua menu' : stockFilter === 'low' ? 'Stok menipis' : 'Stok habis'}</h2>
          <span>{visibleItems.length} item</span>
        </div>
        <div className="merchant-list">
          {visibleItems.length === 0 && <p className="merchant-menu-empty">Belum ada item dalam kategori ini.</p>}
          {visibleItems.map((item) => (
            <div key={item.id} className={`merchant-menu-item${item.available ? '' : ' is-unavailable'}`}>
              <div className="merchant-menu-primary">
                <img className="merchant-menu-thumb" src={item.image} alt="" width={64} height={64} loading="lazy" decoding="async" />
                <div className="merchant-menu-body">
                  <p className="merchant-menu-row-name">{item.name}</p>
                  <p className="merchant-menu-row-meta">{item.category}</p>
                  <p className="merchant-menu-row-price">{rupiah(item.price)}</p>
                </div>
                <div className="merchant-menu-more-wrap">
                <button
                  type="button"
                  className="merchant-menu-more"
                  aria-label={`Opsi ${item.name}`}
                  onClick={(e) => { e.stopPropagation(); setOverflowId(overflowId === item.id ? null : item.id) }}
                >
                  <MoreVertical size={18} strokeWidth={1.75} />
                </button>
                {overflowId === item.id && (
                  <div className="merchant-overflow" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => { setOverflowId(null); openEdit(item) }}>
                      <Pencil size={16} strokeWidth={1.75} /> Ubah
                    </button>
                    <button type="button" className="is-danger" onClick={() => { setOverflowId(null); setDeleteItem(item) }}>
                      <Trash2 size={16} strokeWidth={1.75} /> Hapus
                    </button>
                  </div>
                )}
                </div>
              </div>
              <div className="merchant-menu-controls">
                <button
                  type="button"
                  className={`merchant-menu-stock-btn${item.stock <= 0 ? ' is-out' : item.stock <= MENU_LOW_STOCK_THRESHOLD ? ' is-low' : ''}`}
                  onClick={() => openStock(item)}
                  aria-label={`Atur stok ${item.name}, ${item.stock} tersedia`}
                >
                  {item.stock <= 0 ? 'Habis · Isi stok' : `Stok ${item.stock} · Ubah`}
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.available}
                  aria-label={`Ketersediaan ${item.name}`}
                  className={`merchant-menu-availability${item.available ? ' is-on' : ''}`}
                  onClick={() => dispatch(toggleAvailable(item.id))}
                >
                  <span>{item.available ? 'Tersedia' : 'Disembunyikan'}</span>
                  <span className="merchant-toggle-switch" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <MerchantBottomNav />

      {/* ── stock sheet ── */}
      <BottomSheet open={stockItem !== null} title={stockItem?.name} onClose={closeStock}>
        <p className="sheet-field-label">Stok saat ini</p>
        <div className="stock-stepper">
          <button type="button" aria-label="Kurangi stok" onClick={() => setStockDraft((d) => Math.max(0, d - 1))}>
            <Minus size={18} strokeWidth={1.75} />
          </button>
          <span className="stock-stepper-value">{stockDraft}</span>
          <button type="button" aria-label="Tambah stok" onClick={() => setStockDraft((d) => d + 1)}>
            <Plus size={18} strokeWidth={1.75} />
          </button>
        </div>
        <div className="sheet-actions">
          <button type="button" className="btn btn-primary" onClick={saveStock}>Simpan</button>
        </div>
      </BottomSheet>

      {/* ── add/edit sheet ── */}
      <BottomSheet open={sheetMode !== null} title={sheetMode === 'edit' ? 'Ubah Item' : 'Tambah Item'} onClose={closeSheet}>
        <form className="merchant-form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="merchant-item-name" className="form-label">Nama item</label>
            <input id="merchant-item-name" className={`form-control${errors.name ? ' error' : ''}`} {...register('name')} />
            {errors.name && <span className="error-message">{errors.name.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="merchant-item-price" className="form-label">Harga</label>
            <input id="merchant-item-price" type="number" min="0" className={`form-control${errors.price ? ' error' : ''}`} {...register('price', { valueAsNumber: true })} />
            {errors.price && <span className="error-message">{errors.price.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="merchant-item-category" className="form-label">Kategori</label>
            <select id="merchant-item-category" className={`form-control${errors.category ? ' error' : ''}`} {...register('category')}>
              <option value="">Pilih kategori</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="merchant-item-stock" className="form-label">Stok</label>
            <input id="merchant-item-stock" type="number" min="0" className={`form-control${errors.stock ? ' error' : ''}`} {...register('stock', { valueAsNumber: true })} />
            {errors.stock && <span className="error-message">{errors.stock.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="merchant-item-description" className="form-label">Deskripsi</label>
            <textarea id="merchant-item-description" className="form-control" {...register('description')} />
          </div>
          <div className="form-group">
            <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleFileChange} />
            <button type="button" className="merchant-btn-ghost" onClick={handleImagePick}>
              <ImagePlus size={16} strokeWidth={1.75} /> Gambar
            </button>
            {formImage && <img className="merchant-form-thumb" src={formImage} alt="" />}
          </div>
          <div className="merchant-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Simpan</button>
            <button type="button" className="merchant-btn-ghost" onClick={closeSheet}>Batal</button>
          </div>
        </form>
      </BottomSheet>

      <BottomSheet open={deleteItem !== null} title="Hapus item menu?" onClose={() => setDeleteItem(null)}>
        <p className="merchant-delete-message">{deleteItem?.name} akan hilang dari daftar merchant dan menu pelanggan.</p>
        <div className="merchant-actions">
          <button type="button" className="merchant-btn-ghost" onClick={() => setDeleteItem(null)}>Batal</button>
          <button type="button" className="merchant-delete-confirm" onClick={() => { if (deleteItem) dispatch(removeMenuItem(deleteItem.id)); setDeleteItem(null) }}>Hapus item</button>
        </div>
      </BottomSheet>
    </div>
  )
}
