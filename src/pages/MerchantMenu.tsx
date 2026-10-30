import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Minus, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { MenuAttributeEditor } from '../components/merchant/MenuAttributeEditor'
import { BottomSheet } from '../components/ui/BottomSheet'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { SelectField } from '../components/ui/SelectField'
import { useMerchantMenu } from '../hooks/useMerchantMenu'
import { useMoney } from '../hooks/useMoney'
import { useAppSelector } from '../hooks/useAppStore'
import { idrToJod, jodToIdr, moneyPlain } from '../data/currency'
import { CATEGORIES, MENU_LOW_STOCK_THRESHOLD, categoryIcon, categoryImage, countLowStock, countOutOfStock } from '../data/catalog'
import { useMenuCategories } from '../hooks/useMenuCategories'
import { merchantToken } from '../api/reference'
import { DEMO_MERCHANT_ID } from '../api/orders'
import { createMenu, deleteMenu, patchMenu, updateMenu } from '../api/catalog'
import { imageFileError, uploadImage } from '../lib/image'
import { merchantMenuItemSchema, type MerchantMenuItemFormData } from '../lib/schemas'
import type { MenuItem } from '../types'

const EMPTY_FORM: Partial<MerchantMenuItemFormData> = {
  name: '',
  price: undefined,
  category: '',
  stock: 0,
  cookMinutes: 25,
}

/* Fallback kategori = taksonomi tampilan customer, dipakai hanya saat API mati.
   Saat API hidup, daftar datang dari `menu_categories` BE (`useMenuCategories`). */
const FALLBACK_CATEGORIES = CATEGORIES.map(({ id, label }) => ({ id, label }))

export default function MerchantMenu() {
  const { money } = useMoney()
  const { items, loading, error, reload } = useMerchantMenu(String(DEMO_MERCHANT_ID))
  // Kategori = taksonomi ops/BE (`menu_categories`), baca-saja bagi merchant.
  const categories = useMenuCategories(FALLBACK_CATEGORIES)
  const isActive = useAppSelector((state) => state.merchant.isActive)
  const storeName = useAppSelector((state) => state.merchant.storeName)

  const lowCount = countLowStock(items)
  const outCount = countOutOfStock(items)
  const readyCount = items.filter((item) => item.available && item.stock > 0).length
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')
  const [category, setCategory] = useState<'all' | string>('all')
  const visibleItems = items.filter((item) =>
    (category === 'all' || item.categoryId === category) &&
    (stockFilter === 'out' ? item.stock <= 0 :
      stockFilter === 'low' ? item.stock > 0 && item.stock <= MENU_LOW_STOCK_THRESHOLD : true),
  )
  /* Daftar dikelompokkan per kategori ops/BE (`menu_categories`), urutannya
     tetap; grup yang kosong setelah filter stok disembunyikan. */
  const menuGroups = categories
    .map((c) => ({
      category: c,
      items: visibleItems.filter((item) => item.categoryId === c.id),
    }))
    .filter((group) => group.items.length > 0)

  /* Label kategori ops item; jatuh balik ke bucket customer bila kategori BE
     tak dikenal (mis. saat API mati). */
  const categoryLabel = (item: MenuItem) =>
    categories.find((c) => c.id === item.categoryId)?.label ?? item.category

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

  const saveStock = async () => {
    const target = stockItem
    if (!target) return
    closeStock()
    try {
      await patchMenu(await merchantToken(), target.id, { stock: Math.max(0, stockDraft) })
      await reload()
      toast.success('Stok diperbarui')
    } catch {
      toast.error('Gagal simpan stok')
    }
  }

  /* Ubah ketersediaan di BE — sembunyikan/tampilkan item (MER, PATCH `menus`). */
  const setAvailable = async (item: MenuItem, available: boolean) => {
    try {
      await patchMenu(await merchantToken(), item.id, { available: available ? 1 : 0 })
      await reload()
      toast.success(
        available ? `${item.name} tampil lagi di menu` : `${item.name} disembunyikan dari menu`,
      )
    } catch {
      toast.error('Gagal ubah ketersediaan')
    }
  }

  const removeItem = async (item: MenuItem) => {
    try {
      await deleteMenu(await merchantToken(), item.id)
      await reload()
      toast.success(`${item.name} dihapus`)
    } catch {
      toast.error('Gagal hapus item')
    }
  }

  /* ── add/edit sheet ── */
  const [sheetMode, setSheetMode] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [formImage, setFormImage] = useState<string | null>(null)
  /* Opsi catatan per menu (MER-05): `true` = pelanggan boleh menulis catatan. */
  const [formNote, setFormNote] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MerchantMenuItemFormData>({
    resolver: zodResolver(merchantMenuItemSchema),
    defaultValues: EMPTY_FORM,
  })
  const priceJod = watch('price')
  const priceIdr = Number.isFinite(priceJod) ? jodToIdr(priceJod) : 0

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
      price: idrToJod(item.price),
      category: item.categoryId ?? '',
      stock: item.stock,
      cookMinutes: item.cookMinutes ?? 25,
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

  const onSubmit = async (data: MerchantMenuItemFormData) => {
    const isEdit = sheetMode === 'edit' && Boolean(editing)
    const picked = categories.find((c) => c.id === data.category)
    const write = {
      merchantId: String(DEMO_MERCHANT_ID),
      name: data.name,
      description: data.description ?? '',
      priceIdr: jodToIdr(data.price),
      categoryId: data.category || null,
      category: picked?.label ?? '',
      stock: data.stock,
      available: editing?.available ?? true,
      image: formImage || editing?.image || null,
      discountPercent: editing?.discountPercent,
      isPopular: editing?.isPopular,
      cookMinutes: data.cookMinutes,
      noteEnabled: formNote,
    }
    try {
      if (isEdit && editing) await updateMenu(await merchantToken(), editing.id, write)
      else await createMenu(await merchantToken(), write)
      closeSheet()
      await reload()
      toast.success(isEdit ? 'Item diperbarui' : 'Item ditambahkan')
    } catch {
      toast.error('Gagal menyimpan item')
    }
  }

  const handleImagePick = () => {
    fileRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const error = imageFileError(file)
    if (error) {
      toast.error(error)
      return
    }
    // Unggah ke R2; jatuh balik ke data URL lokal kalau R2 tak terjangkau.
    try {
      setFormImage(await uploadImage('menu-images', 'menu', file, await merchantToken()))
    } catch {
      const reader = new FileReader()
      reader.onload = () => setFormImage(String(reader.result))
      reader.readAsDataURL(file)
    }
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
              <img src={categoryImage('Semua')} alt="" width={56} height={56} decoding="async" />
              Semua
            </button>
            {categories.map((c) => (
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
                <img src={categoryImage(c.label)} alt="" width={56} height={56} decoding="async" />
                {c.label}
              </button>
            ))}
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
          <p className="merchant-menu-empty">
            {error
              ? 'Gagal memuat menu dari server.'
              : loading
                ? 'Memuat menu…'
                : 'Belum ada item dalam kategori ini.'}
          </p>
        )}
        {menuGroups.map((group) => {
          const GroupIcon = categoryIcon(group.category.label)
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
                        <p className="merchant-menu-row-meta">{categoryLabel(item)}</p>
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
                            void setAvailable(item, true)
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
            <label htmlFor="merchant-item-price" className="form-label">Harga (JOD)</label>
            <input
              id="merchant-item-price"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="3.50"
              aria-invalid={errors.price ? true : undefined}
              aria-describedby={priceIdr > 0 ? 'merchant-item-price-idr' : undefined}
              className={`form-control${errors.price ? ' error' : ''}`}
              {...register('price', { valueAsNumber: true })}
            />
            {errors.price && <span className="error-message">{errors.price.message}</span>}
            {priceIdr > 0 && (
              <p id="merchant-item-price-idr" className="admin-hint">
                ≈ {moneyPlain(priceIdr)} (kurs hari ini)
              </p>
            )}
          </div>
          <div className="form-group">
            <span className="form-label">Kategori</span>
            {/* Kategori = taksonomi ops/BE (baca-saja): merchant memilih dari
                dropdown, bukan chip yang bisa menambah/menghapus. Daftar opsi
                mengalir inline (SelectField), tidak `<select>` peramban. */}
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Kategori"
                  placeholder="Pilih kategori…"
                  value={categories.find((c) => c.id === field.value)?.label ?? ''}
                  options={categories.map((c) => c.label)}
                  onChange={(label) => {
                    const picked = categories.find((c) => c.label === label)
                    if (picked) field.onChange(picked.id)
                  }}
                  invalid={Boolean(errors.category)}
                  describedBy={errors.category ? 'category-error' : undefined}
                />
              )}
            />
            {errors.category && (
              <span id="category-error" className="error-message">{errors.category.message}</span>
            )}
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
            <label htmlFor="merchant-item-cook" className="form-label">Estimasi masak (menit)</label>
            {/* Waktu masak per menu, bukan per order: pelanggan melihatnya di
                kartu menu sebelum memesan (FoodCard/MenuDetail). */}
            <input
              id="merchant-item-cook"
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              className={`form-control${errors.cookMinutes ? ' error' : ''}`}
              {...register('cookMinutes', { valueAsNumber: true })}
            />
            {errors.cookMinutes && (
              <span className="error-message">{errors.cookMinutes.message}</span>
            )}
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
              <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={(e) => void handleFileChange(e)} />
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
          if (deleteItem) void removeItem(deleteItem)
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
          if (hideTarget) void setAvailable(hideTarget, false)
          setHideTarget(null)
        }}
        onClose={() => setHideTarget(null)}
      />
    </div>
  )
}
