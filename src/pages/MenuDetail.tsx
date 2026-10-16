import { useState } from 'react'
import { Check, Clock3, Minus, Plus, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'

import { formatRating, modifierExtra, modifierSummary } from '../data/foods'
import {
  attributeById,
  isCombinationExcluded,
  isVariantAvailable,
  linesForMenu,
  menuValuesOf,
  priceExtraFor,
} from '../data/catalogOdoo'
import { getStorefront } from '../data/storefronts'
import { useCatalog } from '../hooks/useCatalog'
import { useFood, useStorefront } from '../hooks/useApiCatalog'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import {
  selectAttributeExclusions,
  selectCatalogAttributes,
  selectMenuAttributeLines,
  selectMenuAttributeValues,
  selectMenuVariants,
} from '../store/slices/catalogAttributesSlice'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { addItem } from '../store/slices/cartSlice'
import { useMoney } from '../hooks/useMoney'
import type { CatalogAttribute, MenuAttributeLine, ModifierGroup } from '../types'
import { BackButton } from '../components/ui/BackButton'

const TRUNCATE_AT = 96

export default function MenuDetail() {
  const { money } = useMoney()
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { getFood } = useCatalog()
  const attributes = useAppSelector(selectCatalogAttributes)
  const attrLines = useAppSelector(selectMenuAttributeLines)
  const attrValues = useAppSelector(selectMenuAttributeValues)
  const attrExclusions = useAppSelector(selectAttributeExclusions)
  const variants = useAppSelector(selectMenuVariants)
  const [quantityByFood, setQuantityByFood] = useState<Record<string, number>>({})
  const [expanded, setExpanded] = useState(false)
  const [chosenByFood, setChosenByFood] = useState<Record<string, string[]>>({})
  const [attrsByFood, setAttrsByFood] = useState<Record<string, string[]>>({})
  const [notesByFood, setNotesByFood] = useState<Record<string, string>>({})

  // Menu: data katalog sesuai id yang diminta. Tanpa API = mock repo; dengan
  // API, mock tak dipakai supaya halaman tak menampilkan menu contoh yang
  // berbeda dari yang dibuka (dulu jatuh ke `items[0]`, mis. "Sate Ayam").
  const catalogFood = getFood(id ?? '')
  const { food, loading } = useFood(id ?? '', catalogFood)

  // Toko pemilik menu — untuk tautan nama toko di atas foto. `getStorefront`
  // jadi nilai awal (mode mock), lalu ditimpa storefront live kalau API hidup.
  const merchantId = food?.merchantId ?? ''
  const storefront = useStorefront(merchantId, getStorefront(merchantId))

  // Katalog live termuat: tampilkan kerangka halaman (splash skeleton) yang
  // meniru hero/judul/badge/deskripsi/aksi, bukan teks kosong yang "burik".
  if (loading) {
    return (
      <div className="app-shell">
        <main>
          <div className="menu-detail-screen" role="status" aria-busy="true">
            <span className="menu-detail-skeleton-sr">Memuat menu</span>
            <div className="menu-detail-hero skeleton-pulse menu-detail-skeleton-hero">
              <div className="menu-detail-header">
                <BackButton className="btn-back" />
              </div>
            </div>
            <div className="menu-detail-content">
              <div className="menu-detail-name-price">
                <span className="skeleton-pulse menu-detail-skeleton-line menu-detail-skeleton-title" />
                <span className="skeleton-pulse menu-detail-skeleton-line menu-detail-skeleton-price" />
              </div>
              <div className="menu-info-badges">
                <span className="skeleton-pulse menu-detail-skeleton-badge" />
                <span className="skeleton-pulse menu-detail-skeleton-badge" />
              </div>
              <div className="menu-description-section">
                <div className="menu-detail-skeleton-stack">
                  <span className="skeleton-pulse menu-detail-skeleton-line menu-detail-skeleton-heading" />
                  <span className="skeleton-pulse menu-detail-skeleton-line menu-detail-skeleton-text" />
                  <span className="skeleton-pulse menu-detail-skeleton-line menu-detail-skeleton-text" />
                  <span className="skeleton-pulse menu-detail-skeleton-line menu-detail-skeleton-text menu-detail-skeleton-text--short" />
                </div>
              </div>
            </div>
            <div className="menu-detail-actions">
              <span className="skeleton-pulse menu-detail-skeleton-qty" />
              <span className="skeleton-pulse menu-detail-skeleton-cta" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Id tak dikenal / API tak mengembalikan apa pun: kosong, bukan menu contoh.
  if (!food) {
    return (
      <div className="app-shell">
        <main>
          <div className="menu-detail-screen">
            <header className="menu-detail-state-header">
              <BackButton className="btn-back" />
            </header>
            <p className="menu-detail-state">Menu tidak ditemukan</p>
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
  const notes = notesByFood[food.id] ?? ''
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

  // Attribute ala Odoo (§14): default pilih nilai pertama yang tersedia untuk
  // tipe pilih-satu; `multi` kosong. Nilai/kombinasi yang dimatikan merchant
  // (ketersediaan 3 level, MER-08) tak bisa dipilih.
  const menuAttrLines = linesForMenu(attrLines, food.id)
  const attrDefaults = menuAttrLines.flatMap((line) => {
    const attribute = attributeById(attributes, line.attributeId)
    if (!attribute || attribute.displayType === 'multi') return []
    const first = menuValuesOf(attrValues, line).find((value) => value.available)
    return first ? [first.attributeValueId] : []
  })
  const selectedAttrs = attrsByFood[food.id] ?? attrDefaults
  const attrExtra = priceExtraFor(attrValues, food.id, selectedAttrs)
  const comboAvailable = isVariantAvailable(variants, food.id, selectedAttrs)

  const toggleAttr = (line: MenuAttributeLine, attribute: CatalogAttribute, valueId: string) => {
    setAttrsByFood((previous) => {
      const prev = previous[food.id] ?? attrDefaults
      if (attribute.displayType === 'multi') {
        return {
          ...previous,
          [food.id]: prev.includes(valueId)
            ? prev.filter((id) => id !== valueId)
            : [...prev, valueId],
        }
      }
      const cleared = prev.filter((id) => !line.valueIds.includes(id))
      return { ...previous, [food.id]: [...cleared, valueId] }
    })
  }

  // Kombinasi akan dilarang (exclusion) bila ditambah nilai ini.
  const valueExcluded = (line: MenuAttributeLine, valueId: string) => {
    const base = selectedAttrs.filter((id) => !line.valueIds.includes(id))
    return isCombinationExcluded(attrExclusions, food.id, [...base, valueId])
  }

  const attrSummary = selectedAttrs
    .map((id) => attributes.flatMap((a) => a.values).find((v) => v.id === id)?.name)
    .filter((name): name is string => Boolean(name))
    .join(', ')

  const extras = modifierExtra(food.modifierGroups, chosen)
  const unitPrice = food.price + extras + attrExtra

  const addToCart = () => {
    const summary = [modifierSummary(food.modifierGroups, chosen), attrSummary]
      .filter(Boolean)
      .join(' · ')
    const note = notes.trim()
    dispatch(
      addItem({
        food,
        merchantId: food.merchantId,
        quantity,
        unitPrice,
        modifiers: summary || undefined,
        notes: note || undefined,
      }),
    )
    toast.success(`${quantity} × ${food.name}${summary ? ` (${summary})` : ''} masuk keranjang`)
  }

  return (
    <>
      <div className="app-shell">
        <main>
          <div className="menu-detail-screen">
            <div className="menu-detail-hero s7-parallax--media">
              <img alt={food.name} className="menu-detail-hero-image" src={food.image} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, var(--overlay-strong) 0%, transparent 46%, var(--overlay) 100%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="menu-detail-header">
                <BackButton className="btn-back" />
                <FavoriteButton
                  id={food.id}
                  name={food.name}
                  className="favorite-header-btn"
                  size={24}
                />
              </div>

              <div className="mdd-hero-caption">
                <h1 className="mdd-hero-name">{food.name}</h1>
                <div className="mdd-hero-meta">
                  {storefront ? (
                    <Link
                      className="mdd-hero-store"
                      to={`/customer/merchant/${food.merchantId}`}
                    >
                      {storefront.name}
                    </Link>
                  ) : null}
                  {food.rating > 0 ? (
                    <span className="mdd-hero-stat">
                      <Star size={13} color="var(--star)" fill="var(--star)" aria-hidden="true" />
                      {formatRating(food.rating)}
                    </span>
                  ) : null}
                  {food.cookMinutes ? (
                    <span className="mdd-hero-stat">
                      <Clock3 size={13} strokeWidth={2} aria-hidden="true" />
                      {food.cookMinutes} mnt
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="menu-detail-content">
              <section className="mdd-section">
                <h2 className="mdd-label s7-parallax--title">Tentang Menu Ini</h2>
                <p className="mdd-text">{shownDescription}</p>
                {longDescription ? (
                  <button
                    type="button"
                    className="mdd-readmore"
                    aria-expanded={expanded}
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}
                  </button>
                ) : null}
              </section>

              {food.modifierGroups?.map((group) => (
                <section className="mdd-choices" key={group.id} role="group" aria-label={group.name}>
                  <div className="mdd-choices__head">
                    <h3 className="mdd-subhead s7-parallax--title">{group.name}</h3>
                    <span
                      className={`mdd-hint${group.type === 'single' ? ' mdd-hint--required' : ''}`}
                    >
                      {group.type === 'single' ? 'Wajib pilih 1' : 'Opsional'}
                    </span>
                  </div>
                  {group.options.map((opt) => {
                    const active = chosen.includes(opt.id)
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`mdd-choice${active ? ' is-active' : ''}`}
                        aria-pressed={active}
                        onClick={() => toggle(group, opt.id)}
                      >
                        <span
                          className={`mdd-choice__mark${group.type === 'single' ? ' mdd-choice__mark--radio' : ''}`}
                        >
                          {active ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : null}
                        </span>
                        <span className="mdd-choice__label">{opt.label}</span>
                        {opt.extraPrice > 0 ? (
                          <span className="mdd-choice__price">+{money(opt.extraPrice)}</span>
                        ) : null}
                      </button>
                    )
                  })}
                </section>
              ))}

              {menuAttrLines.map((line) => {
                const attribute = attributeById(attributes, line.attributeId)
                if (!attribute) return null
                const multi = attribute.displayType === 'multi'
                return (
                  <section
                    className="mdd-choices"
                    key={line.attributeId}
                    role="group"
                    aria-label={attribute.name}
                  >
                    <div className="mdd-choices__head">
                      <h3 className="mdd-subhead s7-parallax--title">{attribute.name}</h3>
                      <span className={`mdd-hint${multi ? '' : ' mdd-hint--required'}`}>
                        {multi ? 'Opsional' : 'Wajib pilih 1'}
                      </span>
                    </div>
                    {menuValuesOf(attrValues, line).map((value) => {
                      const meta = attribute.values.find((v) => v.id === value.attributeValueId)
                      const active = selectedAttrs.includes(value.attributeValueId)
                      const disabled = !value.available || valueExcluded(line, value.attributeValueId)
                      return (
                        <button
                          key={value.attributeValueId}
                          type="button"
                          className={`mdd-choice${active ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`}
                          aria-pressed={active}
                          disabled={disabled}
                          onClick={() => toggleAttr(line, attribute, value.attributeValueId)}
                        >
                          <span className={`mdd-choice__mark${multi ? '' : ' mdd-choice__mark--radio'}`}>
                            {active ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : null}
                          </span>
                          <span className="mdd-choice__label">
                            {meta?.name ?? value.attributeValueId}
                          </span>
                          {value.priceExtra > 0 ? (
                            <span className="mdd-choice__price">+{money(value.priceExtra)}</span>
                          ) : null}
                        </button>
                      )
                    })}
                  </section>
                )
              })}

              {food.noteEnabled !== false ? (
                <section className="mdd-section">
                  <h3 className="mdd-subhead s7-parallax--title">Catatan untuk Tetangga Masak</h3>
                  <textarea
                    className="mdd-notes"
                    rows={2}
                    value={notes}
                    placeholder="Contoh: Sambal dipisah ya Bu, jangan terlalu asin..."
                    onChange={(event) =>
                      setNotesByFood((previous) => ({ ...previous, [food.id]: event.target.value }))
                    }
                  />
                </section>
              ) : null}

              <section className="menu-reviews-section">
                <div className="reviews-header">
                  <h3 className="reviews-title s7-parallax--title">Ulasan ({food.reviewCount})</h3>
                </div>
                {food.reviewCount > 0 ? null : (
                  <p className="reviews-empty">Belum ada ulasan untuk menu ini.</p>
                )}
              </section>
            </div>

            {comboAvailable ? null : (
              <p className="mdd-unavailable" role="status">
                Kombinasi pilihan sedang tidak tersedia. Pilih varian lain.
              </p>
            )}

            <div className="menu-detail-actions">
              <div className="mdd-qty" role="group" aria-label="Pilih jumlah">
                <button
                  type="button"
                  className="mdd-qty__btn"
                  disabled={quantity <= 1}
                  aria-label="Kurangi jumlah"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus size={20} strokeWidth={2} />
                </button>
                <span className="mdd-qty__value" aria-live="polite" aria-atomic="true">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="mdd-qty__btn"
                  aria-label="Tambah jumlah"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus size={20} strokeWidth={2} />
                </button>
              </div>
              <button
                type="button"
                className="mdd-add"
                disabled={!comboAvailable}
                aria-label={`Tambah ${quantity} ${food.name} ke keranjang, total ${money(unitPrice * quantity)}`}
                onClick={addToCart}
              >
                <span className="mdd-add__label">Tambah ke Keranjang</span>
                <span className="mdd-add__total">{money(unitPrice * quantity)}</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
