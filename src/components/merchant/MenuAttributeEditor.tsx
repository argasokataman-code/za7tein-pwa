import { Trash2 } from 'lucide-react'

import { useMoney } from '../../hooks/useMoney'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { attributeById, menuValuesOf, priceExtraFor, variantsForMenu } from '../../data/catalogOdoo'
import {
  addMenuAttributeLine,
  removeMenuAttributeLine,
  selectCatalogAttributes,
  selectMenuAttributeLines,
  selectMenuAttributeValues,
  selectMenuVariants,
  setMenuValueExtra,
  toggleMenuValueAvailable,
  toggleMenuVariantAvailable,
} from '../../store/slices/catalogAttributesSlice'
import { SelectField } from '../ui/SelectField'

interface MenuAttributeEditorProps {
  /** Menu yang sedang disunting (harus sudah punya id — mode ubah). */
  menuId: string
}

const DISPLAY_LABEL: Record<string, string> = {
  radio: 'Pilihan',
  pills: 'Tombol',
  select: 'Dropdown',
  color: 'Warna',
  multi: 'Multi-pilih',
}

/**
 * Editor attribute/varian ala Odoo untuk satu menu (§14, MER-07/MER-08).
 * Dipakai di form item MerchantMenu (mode ubah). Ketersediaan tiga level:
 * menu (switch utama di daftar), nilai attribute, dan varian — semuanya di sini.
 * Ditulis bebas di `price_extra` per menu; tulis ke BE belum ada (state lokal).
 */
export function MenuAttributeEditor({ menuId }: MenuAttributeEditorProps) {
  const dispatch = useAppDispatch()
  const { money } = useMoney()
  const attributes = useAppSelector(selectCatalogAttributes)
  const lines = useAppSelector(selectMenuAttributeLines)
  const values = useAppSelector(selectMenuAttributeValues)
  const variants = useAppSelector(selectMenuVariants)

  const menuLines = lines.filter((l) => l.menuId === menuId)
  const attached = new Set(menuLines.map((l) => l.attributeId))
  const available = attributes.filter((a) => !attached.has(a.id))
  const menuVariants = variantsForMenu(variants, menuId)

  return (
    <div className="form-group menu-attr">
      <span className="form-label">Varian &amp; tambahan</span>
      <p className="merchant-card-sub">
        Pasang atribut (mis. tingkat pedas), atur tambahan harga per nilai, lalu matikan nilai
        atau kombinasi yang sedang habis.
      </p>

      {menuLines.map((line) => {
        const attribute = attributeById(attributes, line.attributeId)
        if (!attribute) return null
        return (
          <section className="menu-attr-line" key={line.attributeId}>
            <header className="menu-attr-head">
              <span className="menu-attr-name">{attribute.name}</span>
              <span className="menu-attr-type">{DISPLAY_LABEL[attribute.displayType]}</span>
              <button
                type="button"
                className="merchant-btn-ghost"
                onClick={() =>
                  dispatch(removeMenuAttributeLine({ menuId, attributeId: line.attributeId }))
                }
              >
                <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" /> Lepas
              </button>
            </header>
            <div className="menu-attr-values">
              {menuValuesOf(values, line).map((value) => {
                const meta = attribute.values.find((v) => v.id === value.attributeValueId)
                return (
                  <div className="menu-attr-value" key={value.attributeValueId}>
                    <span className="menu-attr-value-name">{meta?.name ?? value.attributeValueId}</span>
                    <label className="menu-attr-extra">
                      <span className="menu-attr-extra-label">+ JOD</span>
                      <input
                        className="form-control menu-attr-extra-input"
                        type="number"
                        min={0}
                        step={0.05}
                        value={value.priceExtra}
                        aria-label={`Tambahan harga ${meta?.name ?? ''}`}
                        onChange={(e) =>
                          dispatch(
                            setMenuValueExtra({
                              menuId,
                              attributeValueId: value.attributeValueId,
                              priceExtra: Number(e.target.value),
                            }),
                          )
                        }
                      />
                    </label>
                    <label className="merchant-row menu-attr-avail">
                      <span></span>
                      <span className="toggle-wrap">
                        <input
                          className="toggle-input"
                          type="checkbox"
                          checked={value.available}
                          aria-label={`Ketersediaan ${meta?.name ?? ''}`}
                          onChange={() =>
                            dispatch(
                              toggleMenuValueAvailable({ menuId, attributeValueId: value.attributeValueId }),
                            )
                          }
                        />
                        <span className="toggle-slider" />
                      </span>
                    </label>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      {available.length > 0 ? (
        <SelectField
          label="Tambah atribut"
          value=""
          placeholder="Pilih atribut…"
          options={available.map((a) => a.name)}
          onChange={(name) => {
            const attribute = available.find((a) => a.name === name)
            if (attribute) dispatch(addMenuAttributeLine({ menuId, attributeId: attribute.id }))
          }}
        />
      ) : null}

      {menuVariants.length > 0 ? (
        <section className="menu-attr-line">
          <header className="menu-attr-head">
            <span className="menu-attr-name">Varian</span>
            <span className="menu-attr-type">{menuVariants.length} kombinasi</span>
          </header>
          <div className="menu-attr-values">
            {menuVariants.map((variant) => {
              const names = variant.attributeValueIds
                .map((id) => {
                  const attribute = attributes.find((a) => a.values.some((v) => v.id === id))
                  return attribute?.values.find((v) => v.id === id)?.name ?? id
                })
                .join(' · ')
              return (
                <div className="menu-attr-value" key={variant.id}>
                  <span className="menu-attr-value-name">{names}</span>
                  <span className="menu-attr-extra-label">
                    {money(priceExtraFor(values, menuId, variant.attributeValueIds))}
                  </span>
                  <label className="merchant-row menu-attr-avail">
                    <span></span>
                    <span className="toggle-wrap">
                      <input
                        className="toggle-input"
                        type="checkbox"
                        checked={variant.available}
                        aria-label={`Ketersediaan varian ${names}`}
                        onChange={() => dispatch(toggleMenuVariantAvailable({ variantId: variant.id }))}
                      />
                      <span className="toggle-slider" />
                    </span>
                  </label>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
