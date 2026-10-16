import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, LayoutGrid, Minus, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { MenuAttributeEditor } from '../components/merchant/MenuAttributeEditor'
import { BottomSheet } from '../components/ui/BottomSheet'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { useCatalog } from '../hooks/useCatalog'
import { useMoney } from '../hooks/useMoney'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { CATEGORIES, MENU_LOW_STOCK_THRESHOLD, countLowStock, countOutOfStock } from '../data/catalog'
import { imageFileError } from '../lib/image'
import { merchantMenuItemSchema, type MerchantMenuItemFormData } from '../lib/schemas'
import {
  addCategory,
  addMenuItem,
  removeCategory,
  removeMenuItem,
  selectCategories,
  setStock,
  toggleAvailable,
  updateMenuItem,
} from '../store/slices/catalogSlice'
import type { MenuItem } from '../types'

const EMPTY_FORM: MerchantMenuItemFormData = { name: '', price: 0, category: '', stock: 0 }
const FALLBACK_IMAGE = '/assets/img/menu-details/menu-details-thumb.png'

/* Ikon kategori TIDAK disimpan di state (tak bisa lewat JSON persist); dipetakan
   dari modul berdasarkan id. Kategori buatan merchant belum tentu punya ikon. */
const CATEGORY_ICON = new Map(CATEGORIES.map((c) => [c.id, c.icon]))

export default function MerchantMenu() {
  const { money } = useMoney()
  const dispatch = useAppDispatch()
  const { items } = useCatalog()
  const categories = useAppSelector(selectCategories)
  const isActive = useAppSelector((state) => state.merchant.isActive)
  const storeName = useAppSelector((state) => state.merchant.storeName)

  const lowCount = countLowStock(items)
  const outCount = countOutOfStock(items)
  const readyCount = items.filter((item) => item.available && item.stock > 0).length
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')
  const [category, setCategory] = useState<'all' | string>('all')
  const visibleItems = items.filter((item) =>
    (category === 'all' || item.category === category) &&
    (stockFilter === 'out' ? item.stock <= 0 :
      stockFilter === 'low' ? item.stock > 0 && item.stock <= MENU_LOW_STOCK_THRESHOLD : true),
  )
  /* Daftar dikelompokkan per kategori (mock CATEGORIES), urutannya tetap;
     grup yang kosong setelah filter stok disembunyikan. */
  const menuGroups = categories
    .map((c) => ({
      category: c,
      items: visibleItems.filter((item) => item.category === c.id),
    }))
    .filter((group) => group.items.length > 0)

  const [overflowId, setOverflowId] = useState<string | null>(null)
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null)
  /* Menyembunyikan item menghilangkannya dari menu pelanggan; salah sentuh di
     sini = menu jualan berkurang tanpa disadari. Tampilkan kembali cukup 1 tap. */
  const [hideTarget, setHideTarget] = useState<MenuItem | null>(null)

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
  /* Opsi catatan per menu (MER-05): `true` = pelanggan boleh menulis catatan. */
  const [formNote, setFormNote] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  /* ── kelola kategori (MER-06) ── */
  const [categorySheet, setCategorySheet] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MerchantMenuItemFormData>({
    resolver: zodResolver(merchantMenuItemSchema),
    defaultValues: EMPTY_FORM,
  })

  const openAdd = () => {
    reset(EMPTY_FORM)
    setFormImage(null)
    setFormNote(true)
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
    setFormNote(item.noteEnabled !== false)
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
        noteEnabled: formNote,
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
        noteEnabled: formNote,
        rating: 5,
        reviewCount: 0,
        deliveryTime: '20-30 menit',
        distance: '1,2 km',
        available: true,
      }))
    }
    closeSheet()
  }

  /* ── kelola kategori (MER-06) ── */
  const submitCategory = () => {
    const label = newCategory.trim()
    if (label.length < 2) {
      toast.error('Nama kategori minimal 2 karakter')
      return
    }
    if (categories.some((c) => c.id === label)) {
      toast.error('Kategori itu sudah ada')
      return
    }
    dispatch(addCategory({ id: label, label }))
    setNewCategory('')
    toast.success(`Kategori ${label} ditambahkan`)
  }

  const deleteCategory = (id: string) => {
    const used = items.filter((item) => item.category === id).length
    if (used > 0) {
      toast.error(`Masih ada ${used} item di kategori ini`)
      return
    }
    dispatch(removeCategory(id))
  }

  const handleImagePick = () => {
    fileRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const error = imageFileError(file)
    if (error) {
      toast.error(error)
      e.target.value = ''
      return
    }
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

  /* Tinggi bar filter diukur runtime → kepala grup sticky duduk tepat di
     bawahnya. Hardcode `top` pernah bikin tumpang-tindih; ukur, jangan tebak. */
  const filtersRef = useRef<HTMLDivElement>(null)
  const [filterH, setFilterH] = useState(0)
  useEffect(() => {
    const el = filtersRef.current
    if (!el) return
    const update = () => setFilterH(el.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="app-shell">
      <main className="merchant-page" style={{ '--menu-filter-h': `${filterH}px` } as CSSProperties}>
        <MerchantPageHeader
          eyebrow={storeName}
          title="Menu & Stok"
        />

        <section className="merchant-menu-context" aria-label="Status katalog">
          <span className={`merchant-menu-context-status${isActive ? ' is-open' : ''}`}>
            <span aria-hidden="true" />
            {isActive ? 'Toko buka' : 'Toko tutup'}
          </span>
          <span className="merchant-menu-context-sep" aria-hidden="true">·</span>
          <span className="merchant-menu-context-count">
            {readyCount} dari {items.length} menu siap tampil
          </span>
        </section>

        <div className="merchant-menu-filters" ref={filtersRef}>
          <div className="merchant-menu-chips categories-scroll" role="tablist" aria-label="Filter kategori menu">
            <button
              type="button"
              role="tab"
              aria-selected={category === 'all'}
              className={`category-btn${category === 'all' ? ' active' : ''}`}
              onClick={(e) => {
                setCategory('all')
                e.currentTarget.scrollIntoView({ inline: 'nearest', block: 'nearest' })
              }}
            >
              <LayoutGrid size={24} strokeWidth={2} aria-hidden="true" />
              Semua
            </button>
            {categories.map((c) => {
              const Icon = CATEGORY_ICON.get(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={category === c.id}
                  className={`category-btn${category === c.id ? ' active' : ''}`}
                  onClick={(e) => {
                    setCategory(c.id)
                    e.currentTarget.scrollIntoView({ inline: 'nearest', block: 'nearest' })
                  }}
                >
                  {Icon && <Icon size={24} strokeWidth={2} aria-hidden="true" />}
                  {c.label}
                </button>
              )
            })}
            <button
              type="button"
              className="category-btn category-btn--action"
              onClick={() => setCategorySheet(true)}
            >
              <Plus size={24} strokeWidth={2} aria-hidden="true" />
              Kategori
            </button>
          </div>
          <div className="merchant-menu-stockfilter" role="group" aria-label="Filter status stok">
            <button type="button" aria-pressed={stockFilter === 'all'} className={stockFilter === 'all' ? 'is-active' : ''} onClick={() => setStockFilter('all')}>
              Semua stok
            </button>
            <button type="button" aria-pressed={stockFilter === 'low'} className={stockFilter === 'low' ? 'is-active' : ''} onClick={() => setStockFilter('low')}>
              Menipis <em>{lowCount}</em>
            </button>
            <button type="button" aria-pressed={stockFilter === 'out'} className={stockFilter === 'out' ? 'is-active' : ''} onClick={() => setStockFilter('out')}>
              Habis <em>{outCount}</em>
            </button>
          </div>
        </div>

        {visibleItems.length === 0 && (
          <p className="merchant-menu-empty">Belum ada item dalam kategori ini.</p>
        )}
        {menuGroups.map((group) => {
          const GroupIcon = CATEGORY_ICON.get(group.category.id)
          return (
            <section
              key={group.category.id}
              className="merchant-menu-group"
              aria-label={group.category.label}
            >
              <div className="merchant-menu-list-head">
                <h2 className="merchant-section-title">
                  {GroupIcon && <GroupIcon size={16} strokeWidth={1.75} aria-hidden="true" />}
                  {group.category.label}
                </h2>
                <span>{group.items.length} item</span>
              </div>
              <div className="merchant-list">
                {group.items.map((item, index) => (
                  <div
                    key={`${stockFilter}-${item.id}`}
                    className={`merchant-menu-item stagger-in${item.available ? '' : ' is-unavailable'}`}
                    style={{ '--stagger-index': index } as CSSProperties}
                  >
                    <div className="merchant-menu-primary">
                      <img className="merchant-menu-thumb" src={item.image} alt={item.name} width={64} height={64} loading="lazy" decoding="async" />
                      <div className="merchant-menu-body">
                        <p className="merchant-menu-row-name">{item.name}</p>
                        <p className="merchant-menu-row-meta">{item.category}</p>
                        <p className="merchant-menu-row-price">{money(item.price)}</p>
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
                        onClick={() => {
                          if (item.available) {
                            setHideTarget(item)
                          } else {
                            dispatch(toggleAvailable(item.id))
                            toast.success(`${item.name} tampil lagi di menu`)
                          }
                        }}
                      >
                        <span>{item.available ? 'Tersedia' : 'Disembunyikan'}</span>
                        <span className="merchant-toggle-switch" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
        {/* Ruang ekstra di ujung daftar supaya baris terakhir tidak tertutup FAB. */}
        <div className="page-fab-spacer" aria-hidden="true" />
      </main>

      {/* "Tambah" pindah dari pil selebar halaman ke zona jempol: pojok atas
          adalah tempat mata, bukan tempat jempol (senior-fe mobile G-02/G-03). */}
      <button
        type="button"
        className="page-fab"
        aria-label="Tambah item menu"
        onClick={openAdd}
      >
        <Plus size={22} strokeWidth={1.75} aria-hidden="true" />
      </button>

      <MerchantBottomNav />

      {/* ── stock sheet ── */}
      <BottomSheet open={stockItem !== null} title={stockItem?.name} onClose={closeStock}>
        <p className={`sheet-field-label${stockDraft <= 0 ? ' is-out' : stockDraft !== stockItem?.stock ? ' is-changed' : ''}`}>
          {stockDraft <= 0
            ? 'Stok habis'
            : stockItem && stockDraft !== stockItem.stock
              ? `Dari ${stockItem.stock}`
              : 'Stok saat ini'}
        </p>
        <div className="stock-stepper">
          <button type="button" aria-label="Kurangi stok" onClick={() => setStockDraft((d) => Math.max(0, d - 1))}>
            <Minus size={22} strokeWidth={1.75} />
          </button>
          {/* key: saat angka berubah, span di-remount sehingga animasi pop
              berjalan lagi. Tanpa key, React memakai ulang node dan animasinya
              tidak pernah terpicu. */}
          <span key={stockDraft} className="stock-stepper-value">{stockDraft}</span>
          <button type="button" aria-label="Tambah stok" onClick={() => setStockDraft((d) => d + 1)}>
            <Plus size={22} strokeWidth={1.75} />
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
            <label htmlFor="merchant-item-price" className="form-label">Harga (Rp)</label>
            <input id="merchant-item-price" type="number" inputMode="numeric" min="0" className={`form-control${errors.price ? ' error' : ''}`} {...register('price', { valueAsNumber: true })} />
            {errors.price && <span className="error-message">{errors.price.message}</span>}
          </div>
          <div className="form-group">
            <span className="form-label">Kategori</span>
            {/* Picker chip, bukan `<select>` peramban: kontrol bawaan desktop
                membuat sheet terbaca form web (audit 013 #8). Chip yang sama
                dipakai filter kategori halaman ini. */}
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div className="merchant-chip-row" role="radiogroup" aria-label="Kategori">
                  {categories.map((c) => {
                    const Icon = CATEGORY_ICON.get(c.id)
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={field.value === c.id}
                        className={`merchant-chip${field.value === c.id ? ' is-active' : ''}`}
                        onClick={() => field.onChange(c.id)}
                      >
                        {Icon && <Icon size={15} strokeWidth={1.75} aria-hidden="true" />}
                        {c.label}
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {errors.category && <span className="error-message">{errors.category.message}</span>}
          </div>
          <div className="form-group">
            <span className="form-label">Stok</span>
            {/* Satu nilai satu kontrol: stepper yang sama dipakai di stock sheet,
                bukan input angka selebar penuh hanya untuk satu digit (audit 013 #5). */}
            <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <div className="stock-stepper">
                  <button type="button" aria-label="Kurangi stok" onClick={() => field.onChange(Math.max(0, Number(field.value) - 1))}>
                    <Minus size={22} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                  <span key={String(field.value)} className="stock-stepper-value">{field.value ?? 0}</span>
                  <button type="button" aria-label="Tambah stok" onClick={() => field.onChange(Number(field.value) + 1)}>
                    <Plus size={22} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </div>
              )}
            />
          </div>
          <div className="form-group">
            <span className="form-label">Catatan pelanggan</span>
            <label className="merchant-row">
              <span>Izinkan catatan khusus per item</span>
              <span className="toggle-wrap">
                <input
                  className="toggle-input"
                  type="checkbox"
                  checked={formNote}
                  onChange={(e) => setFormNote(e.target.checked)}
                />
                <span className="toggle-slider" />
              </span>
            </label>
            <p className="merchant-card-sub">
              Saat menyala, pelanggan boleh menulis catatan di halaman item (contoh: “sambal
              dipisah”). Saat mati, kolom catatan tidak muncul.
            </p>
          </div>
          {sheetMode === 'edit' && editing ? <MenuAttributeEditor menuId={editing.id} /> : null}
          <div className="form-group">
            <label htmlFor="merchant-item-description" className="form-label">Deskripsi</label>
            <textarea id="merchant-item-description" className="form-control" {...register('description')} />
          </div>
          <div className="form-group">
            <span className="form-label">Gambar</span>
            <div className="merchant-image-field">
              <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleFileChange} />
              {formImage && <img className="merchant-form-thumb" src={formImage} alt="Pratinjau gambar" width={64} height={64} loading="lazy" decoding="async" />}
              <button type="button" className="merchant-btn-ghost" onClick={handleImagePick}>
                <ImagePlus size={16} strokeWidth={1.75} /> {formImage ? 'Ganti gambar' : 'Gambar'}
              </button>
            </div>
          </div>
          <div className="merchant-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Simpan</button>
            <button type="button" className="merchant-btn-ghost" onClick={closeSheet}>Batal</button>
          </div>
        </form>
      </BottomSheet>

      <ConfirmSheet
        open={deleteItem !== null}
        title="Hapus item menu?"
        body={`${deleteItem?.name ?? ''} akan hilang dari daftar merchant dan menu pelanggan.`}
        confirmLabel="Hapus item"
        onConfirm={() => {
          if (deleteItem) dispatch(removeMenuItem(deleteItem.id))
          setDeleteItem(null)
        }}
        onClose={() => setDeleteItem(null)}
      />

      <ConfirmSheet
        open={hideTarget !== null}
        title={`Sembunyikan ${hideTarget?.name ?? 'item'}?`}
        body="Item ini hilang dari menu pelanggan sampai kamu tampilkan lagi. Stok dan datanya tetap tersimpan."
        confirmLabel="Sembunyikan"
        onConfirm={() => {
          if (hideTarget) {
            dispatch(toggleAvailable(hideTarget.id))
            toast.success(`${hideTarget.name} disembunyikan dari menu`)
          }
          setHideTarget(null)
        }}
        onClose={() => setHideTarget(null)}
      />

      {/* ── kelola kategori (MER-06) ── */}
      <BottomSheet open={categorySheet} title="Kategori menu" onClose={() => setCategorySheet(false)}>
        <p className="merchant-card-sub">
          Kategori mengelompokkan menu di halaman ini dan di menu pelanggan. Kategori yang masih
          berisi item tidak bisa dihapus — pindahkan itemnya dulu.
        </p>
        <div className="merchant-list">
          {categories.map((c) => {
            const used = items.filter((item) => item.category === c.id).length
            return (
              <div key={c.id} className="merchant-row">
                <div>
                  <p className="merchant-card-title">{c.label}</p>
                  <p className="merchant-card-sub">{used} item</p>
                </div>
                <button
                  type="button"
                  className="merchant-btn-ghost"
                  disabled={used > 0 || categories.length <= 1}
                  onClick={() => deleteCategory(c.id)}
                >
                  <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" /> Hapus
                </button>
              </div>
            )
          })}
        </div>
        <div className="form-group">
          <label htmlFor="new-category" className="form-label">Kategori baru</label>
          <input
            id="new-category"
            className="form-control"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Contoh: Gorengan"
          />
        </div>
        <div className="sheet-actions">
          <button type="button" className="btn btn-primary" onClick={submitCategory}>
            Tambah kategori
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
