import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Clock, ImagePlus, Minus, MoreVertical, Package, Pencil, Plus, Search, SlidersHorizontal, Trash2, TrendingUp } from 'lucide-react'
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
import { CATEGORIES, MENU_LOW_STOCK_THRESHOLD, categoryImage, countLowStock, countOutOfStock } from '../data/catalog'
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
  const todayOrderCount = useAppSelector((state) => state.merchant.todayOrderCount)

  const lowCount = countLowStock(items)
  const outCount = countOutOfStock(items)
  const readyCount = items.filter((item) => item.available && item.stock > 0).length
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')
  /* `null` = belum memilih: kategori pertama yang berisi dipakai supaya halaman
     tidak lagi menumpuk semua kategori (15 item terukur 2265px). */
  const [pickedCategory, setPickedCategory] = useState<string | 'all' | null>(null)
  const [query, setQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  /* Saringan berlaku dua arah: rel kategori memilih himpunan, pencarian + filter
     stok mempersempit isinya. `matchedItems` sengaja dihitung tanpa kategori
     supaya angka di rel menunjukkan hasil nyata untuk tiap kategori. */
  const needle = query.trim().toLowerCase()
  const matchesStock = (item: MenuItem) =>
    stockFilter === 'out'
      ? item.stock <= 0
      : stockFilter === 'low'
        ? item.stock > 0 && item.stock <= MENU_LOW_STOCK_THRESHOLD
        : true
  const matchesQuery = (item: MenuItem) =>
    needle === '' ||
    item.name.toLowerCase().includes(needle) ||
    item.description.toLowerCase().includes(needle)
  const matchedItems = items.filter((item) => matchesStock(item) && matchesQuery(item))
  const countIn = (categoryId: string) =>
    matchedItems.filter((item) => item.categoryId === categoryId).length
  /* Mencari berlaku lintas kategori: hasil yang tersaring kategori aktif akan
     menyembunyikan barang yang dicari padahal ada di kategori lain. */
  const category =
    needle !== ''
      ? 'all'
      : pickedCategory ?? categories.find((c) => countIn(c.id) > 0)?.id ?? 'all'
  const visibleItems =
    category === 'all'
      ? matchedItems
      : matchedItems.filter((item) => item.categoryId === category)
  const stockFilterLabel: Record<typeof stockFilter, string> = {
    all: 'Semua stok',
    low: 'Menipis',
    out: 'Habis',
  }

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

  return (
    <div className="app-shell">
      <main className="merchant-page">
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

        {/* Rel kategori di kiri: satu kolom sempit yang selalu terlihat, jadi
            merchant bisa berpindah kategori tanpa menggulir balik ke atas.
            Angka di rel = hasil filter aktif, bukan total mentah. */}
        <div className="merchant-menu-workspace">
          <nav className="merchant-menu-rail" aria-label="Kategori menu">
            <button
              type="button"
              aria-current={category === 'all'}
              className={category === 'all' ? 'is-active' : ''}
              onClick={() => setPickedCategory('all')}
            >
              <img src={categoryImage('Semua')} alt="" width={28} height={28} decoding="async" />
              <span className="merchant-menu-rail-label">Semua</span>
              <span className="merchant-menu-rail-count">{matchedItems.length}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-current={category === c.id}
                className={category === c.id ? 'is-active' : ''}
                onClick={() => setPickedCategory(c.id)}
              >
                <img src={categoryImage(c.label)} alt="" width={28} height={28} decoding="async" />
                <span className="merchant-menu-rail-label">{c.label}</span>
                <span className="merchant-menu-rail-count">{countIn(c.id)}</span>
              </button>
            ))}
          </nav>

          <div className="merchant-menu-panel">
            <div className="merchant-menu-searchbar">
              <div className="merchant-menu-searchfield">
                <Search size={16} strokeWidth={1.75} aria-hidden="true" />
                <input
                  id="merchant-menu-search"
                  type="search"
                  value={query}
                  placeholder="Cari menu..."
                  aria-label="Cari menu"
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                className={`merchant-menu-filterbtn${stockFilter === 'all' ? '' : ' is-active'}`}
                aria-label={`Saring stok: ${stockFilterLabel[stockFilter]}`}
                onClick={() => setFilterOpen(true)}
              >
                <SlidersHorizontal size={18} strokeWidth={1.75} aria-hidden="true" />
                {stockFilter === 'all' ? null : (
                  <span className="merchant-menu-filterdot" aria-hidden="true" />
                )}
              </button>
            </div>

            {visibleItems.length === 0 && (
              <p className="merchant-menu-empty">
                {error
                  ? 'Gagal memuat menu dari server.'
                  : loading
                    ? 'Memuat menu…'
                    : query.trim()
                      ? 'Tidak ada menu yang cocok dengan pencarian.'
                      : stockFilter !== 'all'
                        ? `Tidak ada menu berstatus ${stockFilterLabel[stockFilter].toLowerCase()}.`
                        : 'Belum ada item dalam kategori ini.'}
              </p>
            )}
            {/* Satu daftar datar: desain tidak memakai kepala grup. Saat kategori
                dipilih, rel sudah menyebut kategorinya; saat "Semua", kepala grup
                memakan tinggi tanpa menambah keputusan. */}
            <div className="merchant-list">
              {visibleItems.map((item, index) => (
                <div
                  key={`${stockFilter}-${item.id}`}
                  className={`merchant-menu-item stagger-in${item.available ? '' : ' is-unavailable'}`}
                  style={{ '--stagger-index': index } as CSSProperties}
                >
                  {/* Foto mengisi sisi kiri kartu sampai tepi dan setinggi
                      kartu penuh: ukuran 48px membuatnya jadi ikon, bukan foto
                      hidangan. */}
                  <img className="merchant-menu-thumb" src={item.image} alt="" width={100} height={112} loading="lazy" decoding="async" />
                  <div className="merchant-menu-body">
                    <div className="merchant-menu-row-top">
                      <p className="merchant-menu-row-name">{item.name}</p>
                      <p className="merchant-menu-row-price">{money(item.price)}</p>
                    </div>
                    {/* Deskripsi tampil utuh (tanpa clamp): merchant perlu tahu
                        isi hidangan saat memutuskan stok, dan teks yang dipotong
                        memaksa buka sheet untuk hal sepele. Paragrafnya SELALU
                        ada walau deskripsi kosong: tinggi dua barisnya cadangan,
                        jadi kartu tanpa deskripsi tidak lebih pendek dari kartu
                        lain (irama daftar rata). */}
                    <p className="merchant-menu-row-desc">
                      {item.available ? item.description ?? '' : 'Disembunyikan dari menu'}
                    </p>
                    {/* Kaki kartu: chip stok di kiri, ketersediaan + opsi di
                        kanan pada satu rel, jadi tidak ada kontrol yang menumpuk
                        di bawah foto. */}
                    <div className="merchant-menu-controls">
                      <button
                        type="button"
                        className={`merchant-menu-stock-btn${item.stock <= 0 ? ' is-out' : item.stock <= MENU_LOW_STOCK_THRESHOLD ? ' is-low' : ''}`}
                        onClick={() => openStock(item)}
                        aria-label={`Atur stok ${item.name}, ${item.stock} tersedia`}
                      >
                        <span className="merchant-menu-stock-pill">
                          <Package size={12} strokeWidth={2} aria-hidden="true" />
                          <span>Stok {item.stock}</span>
                        </span>
                      </button>
                      <div className="merchant-menu-controls-end">
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
                          <span className="merchant-toggle-switch" aria-hidden="true" />
                        </button>
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Ruang ekstra di ujung daftar supaya baris terakhir tidak tertutup FAB. */}
            <div className="page-fab-spacer" aria-hidden="true" />
          </div>
        </div>

        {/* Ringkasan bawah: dua angka yang menjawab "katalognya sehat?" tanpa
            membuka layar lain. Bukan kontrol, jadi tanpa tinggi --touch-min. */}
        <section className="merchant-menu-statusbar" aria-label="Ringkasan katalog">
          <div>
            <Clock size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>{items.length} menu aktif</span>
          </div>
          <div>
            <TrendingUp size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>Order hari ini: {todayOrderCount}</span>
          </div>
        </section>
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

      {/* ── filter stok sheet ── */}
      <BottomSheet open={filterOpen} title="Saring menu" onClose={() => setFilterOpen(false)}>
        <div className="merchant-menu-filterlist" role="radiogroup" aria-label="Saring menu">
          {(
            [
              ['all', 'Semua stok', items.length],
              ['low', 'Menipis', lowCount],
              ['out', 'Habis', outCount],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={stockFilter === value}
              className={stockFilter === value ? 'is-active' : ''}
              onClick={() => {
                setStockFilter(value)
                setFilterOpen(false)
              }}
            >
              <span>{label}</span>
              <span className="merchant-menu-filter-count">{count}</span>
              {/* Lingkaran pemilih tampil di semua baris (kosong = belum
                  dipilih), jadi ketiga baris punya struktur dan tepi kanan
                  yang sama; centang hanya muncul saat aktif. */}
              <span className="merchant-menu-filter-pick" aria-hidden="true">
                <Check size={12} strokeWidth={3} />
              </span>
            </button>
          ))}
        </div>
        <p className="merchant-menu-filterfoot" role="status">
          {visibleItems.length} menu · {stockFilterLabel[stockFilter]}
        </p>
      </BottomSheet>

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
