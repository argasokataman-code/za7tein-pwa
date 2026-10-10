import { useState } from 'react'
import { ChevronLeft, Clock3, MapPin, Minus, Plus, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { formatRating, modifierExtra, modifierSummary } from '../data/foods'
import { useCatalog } from '../hooks/useCatalog'
import { useFood } from '../hooks/useApiCatalog'
import { useAppDispatch } from '../hooks/useAppStore'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { addItem } from '../store/slices/cartSlice'
import { money } from '../data/merchant'
import { moneyPlain } from '../data/currency'
import type { ModifierGroup } from '../types'

const TRUNCATE_AT = 96

export default function MenuDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { getFood } = useCatalog()
  const [quantityByFood, setQuantityByFood] = useState<Record<string, number>>({})
  const [expanded, setExpanded] = useState(false)
  const [chosenByFood, setChosenByFood] = useState<Record<string, string[]>>({})

  // Menu: data katalog sesuai id yang diminta. Tanpa API = mock repo; dengan
  // API, mock tak dipakai supaya halaman tak menampilkan menu contoh yang
  // berbeda dari yang dibuka (dulu jatuh ke `items[0]`, mis. "Sate Ayam").
  const catalogFood = getFood(id ?? '')
  const { food, loading } = useFood(id ?? '', catalogFood)

  if (loading || !food) {
    return (
      <div className="app-shell">
        <main>
          <div className="menu-detail-screen">
            <header className="menu-detail-state-header">
              <button
                type="button"
                className="btn-back"
                aria-label="Kembali"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft size={24} strokeWidth={1.75} />
              </button>
            </header>
            <p className="menu-detail-state">
              {loading ? 'Memuat menu…' : 'Menu tidak ditemukan'}
            </p>
          </div>
        </main>
      </div>
    )
  }

  const quantity = quantityByFood[food.id] ?? 1
  const defaults = food.modifierGroups
    ?.filter((group) => group.type === 'single')
    .map((group) => group.options.find((option) => option.id === 'medium')?.id ?? group.options[0].id) ?? []
  const chosen = chosenByFood[food.id] ?? defaults
  const longDescription = food.description.length > 100
  const shownDescription =
    longDescription && !expanded
      ? `${food.description.slice(0, TRUNCATE_AT)}…`
      : food.description

  // Pilihan disimpan per menu agar pergantian :id tidak membawa state menu lain.
  const setQuantity = (update: (current: number) => number) =>
    setQuantityByFood((previous) => ({
      ...previous,
      [food.id]: update(previous[food.id] ?? 1),
    }))

  const toggle = (group: ModifierGroup, optionId: string) => {
    setChosenByFood((previous) => {
      const prev = previous[food.id] ?? defaults
      if (group.type === 'single') {
        const cleared = prev.filter((id) => !group.options.some((o) => o.id === id))
        return { ...previous, [food.id]: [...cleared, optionId] }
      }
      return {
        ...previous,
        [food.id]: prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      }
    })
  }

  const extras = modifierExtra(food.modifierGroups, chosen)
  const unitPrice = food.price + extras

  const addToCart = () => {
    const summary = modifierSummary(food.modifierGroups, chosen)
    dispatch(addItem({ food, quantity, unitPrice, modifiers: summary || undefined }))
    toast.success(`${quantity} × ${food.name}${summary ? ` (${summary})` : ''} masuk keranjang`)
  }

  return (
    <>
      <div className="app-shell">
        <main>
          <div className="menu-detail-screen">
            <div className="menu-detail-hero s7-parallax--media">
              <img
                alt={food.name}
                className="menu-detail-hero-image"
                src={food.image}
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  inset: 0,
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0) 50%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="menu-detail-header">
                <button
                  type="button"
                  className="btn-back"
                  aria-label="Kembali"
                  onClick={() => navigate(-1)}
                >
                  <ChevronLeft size={24} strokeWidth={1.75} />
                </button>
                <FavoriteButton id={food.id} name={food.name} className="favorite-header-btn" size={24} />
              </div>
            </div>

            <div className="menu-detail-content">
              <div className="menu-detail-name-price">
                <h1 className="menu-detail-name">{food.name}</h1>
                <span className="menu-detail-price">{money(unitPrice)}</span>
              </div>

              <div className="menu-info-badges" role="list" aria-label="Detail makanan">
                <div className="info-badge" role="listitem">
                  <MapPin size={18} strokeWidth={1.75} />
                  <span>Ongkir per zona</span>
                </div>
                {food.deliveryTime ? (
                  <div className="info-badge" role="listitem">
                    <Clock3 size={18} strokeWidth={1.75} />
                    <span>{food.deliveryTime}</span>
                  </div>
                ) : null}
                {food.rating > 0 ? (
                  <div className="info-badge" role="listitem">
                    <Star size={16} strokeWidth={1.75} color="var(--star)" fill="var(--star)" />
                    <span>{formatRating(food.rating)}</span>
                  </div>
                ) : null}
              </div>

              <div className="menu-description-section">
                <h3 className="description-title s7-parallax--title">Deskripsi</h3>
                <div className="menu-description-wrapper">
                  <p className="menu-description">
                    <span className="description-bold">{food.name} </span>
                    <span className="description-text">{shownDescription}</span>
                  </p>
                  {longDescription ? (
                    <button
                      type="button"
                      className="read-more-btn"
                      aria-expanded={expanded}
                      onClick={() => setExpanded((v) => !v)}
                    >
                      {expanded ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}
                    </button>
                  ) : null}
                </div>
              </div>

              {food.modifierGroups?.map((group) => (
                <div className="modifier-group" key={group.id} role="group" aria-label={group.name}>
                  <h3 className="modifier-group-title">{group.name}</h3>
                  {group.options.map((opt) => {
                    const active = chosen.includes(opt.id)
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`modifier-option${active ? ' active' : ''}`}
                        aria-pressed={active}
                        onClick={() => toggle(group, opt.id)}
                      >
                        <span className="modifier-option-label">{opt.label}</span>
                        {opt.extraPrice > 0 ? (
                          <span className="modifier-option-price">+{moneyPlain(opt.extraPrice)}</span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              ))}

              <div className="menu-reviews-section">
                <div className="reviews-header">
                  <h3 className="reviews-title s7-parallax--title">Ulasan ({food.reviewCount})</h3>
                  {food.reviewCount > 0 ? (
                    <Link className="see-all-link" to="/reviews">
                      Lihat semua
                    </Link>
                  ) : null}
                </div>
                {food.reviewCount > 0 ? null : (
                  <p className="reviews-empty">Belum ada ulasan untuk menu ini.</p>
                )}
              </div>
            </div>

            <div className="menu-detail-actions">
              <div className="quantity-selector" role="group" aria-label="Pilih jumlah">
                <button
                  type="button"
                  className="quantity-btn"
                  disabled={quantity <= 1}
                  aria-label="Kurangi jumlah"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus size={24} strokeWidth={1.75} />
                </button>
                <span className="quantity-value" aria-live="polite" aria-atomic="true">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="quantity-btn"
                  aria-label="Tambah jumlah"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus size={24} strokeWidth={1.75} />
                </button>
              </div>
              <button
                type="button"
                className="add-to-cart-btn"
                aria-label={`Tambah ${quantity} ${food.name} ke keranjang, total ${moneyPlain(unitPrice * quantity)}`}
                onClick={addToCart}
              >
                <span>Tambah · {moneyPlain(unitPrice * quantity)}</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
