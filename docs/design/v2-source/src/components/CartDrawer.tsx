import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Tag, ChevronRight, Check, MapPin, Wallet, ArrowRight } from 'lucide-react';
import { CartItem, Address } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  couponApplied: boolean;
  onApplyCoupon: (code: string) => boolean;
  onRemoveCoupon: () => void;
  currentAddress: Address;
  onPlaceOrder: (paymentMethod: string, totalAmount: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  couponApplied,
  onApplyCoupon,
  onRemoveCoupon,
  currentAddress,
  onPlaceOrder,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'gopay' | 'ovo' | 'tunai'>('gopay');

  if (!isOpen) return null;

  // Calculate subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    const addPrice = (item.selectedOptions || []).reduce((sum, optName) => {
      const match = item.foodItem.options?.find((o) => o.name === optName);
      return sum + (match?.price || 0);
    }, 0);
    return acc + (item.foodItem.price + addPrice) * item.quantity;
  }, 0);

  // Delivery fee (free if subtotal >= 40000, otherwise 6000)
  const deliveryFee = subtotal >= 40000 ? 0 : 6000;

  // Coupon discount (30% up to 15,000)
  const discount = couponApplied ? Math.min(Math.round(subtotal * 0.3), 15000) : 0;
  const serviceFee = 1000;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discount + serviceFee);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const ok = onApplyCoupon(code);
    if (!ok) {
      setCouponError('Kode kupon tidak valid. Gunakan SA7BARU');
    } else {
      setCouponError('');
      setCouponInput('');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center p-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full bg-white rounded-t-[32px] max-h-[92%] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200/90 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-[#172434]">Pesanan Saya</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#FFF0EB] text-[#E44222] text-xs font-bold">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)} menu
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Items & Details */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Delivery Address Preview */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-slate-200 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#E44222] shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="font-bold text-[#172434]">
                Diantar ke {currentAddress.label}
              </div>
              <div className="text-slate-500 line-clamp-1">{currentAddress.address}</div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {cartItems.map((item, index) => {
              const itemAddPrice = (item.selectedOptions || []).reduce((sum, optName) => {
                const match = item.foodItem.options?.find((o) => o.name === optName);
                return sum + (match?.price || 0);
              }, 0);
              const singlePrice = item.foodItem.price + itemAddPrice;

              return (
                <div
                  key={`${item.foodItem.id}-${index}`}
                  className="p-3 bg-white border border-slate-200 rounded-2xl flex items-start justify-between gap-3 shadow-2xs"
                >
                  <img
                    src={item.foodItem.image}
                    alt={item.foodItem.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 mt-0.5"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-[#172434] truncate">
                      {item.foodItem.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {item.foodItem.merchantName}
                    </p>

                    {item.selectedSpicyLevel && (
                      <p className="text-[11px] text-orange-600 font-medium mt-0.5">
                        🌶 {item.selectedSpicyLevel}
                      </p>
                    )}

                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        + {item.selectedOptions.join(', ')}
                      </p>
                    )}

                    {item.notes && (
                      <p className="text-[11px] italic text-slate-400 mt-0.5">
                        "{item.notes}"
                      </p>
                    )}

                    <div className="text-xs font-bold text-[#E44222] mt-1">
                      Rp{singlePrice.toLocaleString('id-ID')}
                    </div>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => onRemoveItem(index)}
                      className="text-slate-300 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                      title="Hapus menu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center shadow-xs cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-extrabold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Promo Coupon Section */}
          <div className="bg-[#FFF8F5] p-3 rounded-2xl border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#DF3815]">
                <Tag className="w-3.5 h-3.5" />
                <span>Kupon Diskon Tetangga</span>
              </div>
              {!couponApplied && (
                <button
                  onClick={() => onApplyCoupon('SA7BARU')}
                  className="text-[11px] font-bold text-[#DF3815] underline cursor-pointer"
                >
                  Pakai SA7BARU (30%)
                </button>
              )}
            </div>

            {couponApplied ? (
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-300 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[#172434]">SA7BARU Digunakan</span>
                    <span className="block text-[10px] text-emerald-600 font-bold">
                      Hemat Rp{discount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onRemoveCoupon}
                  className="text-xs font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Masukkan kode kupon"
                  className="flex-1 uppercase font-bold text-xs p-2 rounded-xl bg-white border border-slate-200 focus:outline-hidden focus:border-[#E44222]"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-3 py-2 bg-[#E44222] text-white text-xs font-bold rounded-xl active:scale-95 cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            )}
            {couponError && (
              <p className="text-[11px] text-rose-500 font-medium mt-1">{couponError}</p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Metode Pembayaran
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('gopay')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  paymentMethod === 'gopay'
                    ? 'border-[#00AED6] bg-[#EBF8FB] text-[#00AED6] font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold">GoPay</div>
                <div className="text-[10px] text-slate-400">Saldo: Rp124.000</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ovo')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  paymentMethod === 'ovo'
                    ? 'border-[#4C3494] bg-[#F2EFFC] text-[#4C3494] font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold">OVO</div>
                <div className="text-[10px] text-slate-400">Saldo: Rp88.500</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('tunai')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  paymentMethod === 'tunai'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold">Tunai (COD)</div>
                <div className="text-[10px] text-slate-400">Bayar di tempat</div>
              </button>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Menu</span>
              <span className="font-bold text-[#172434]">
                Rp{subtotal.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <div className="flex items-center gap-1">
                <span>Ongkos Kirim Tetangga</span>
                {subtotal >= 40000 && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 rounded">
                    Gratis
                  </span>
                )}
              </div>
              <span className="font-bold text-[#172434]">
                {deliveryFee === 0 ? 'Rp0' : `Rp${deliveryFee.toLocaleString('id-ID')}`}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Diskon Kupon SA7BARU</span>
                <span>-Rp{discount.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Biaya Layanan & Wadah Higienis</span>
              <span className="font-bold text-[#172434]">
                Rp{serviceFee.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-[#172434]">
              <span>Total Pembayaran</span>
              <span className="text-base text-[#E44222]">
                Rp{grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Place Order CTA */}
        <div className="p-4 bg-white border-t border-slate-200/90 shrink-0">
          <button
            onClick={() => onPlaceOrder(paymentMethod, grandTotal)}
            className="w-full h-12 rounded-2xl bg-[#E44222] hover:bg-[#d43717] active:scale-98 text-white font-bold text-sm flex items-center justify-between px-5 shadow-lg shadow-orange-600/25 transition-all cursor-pointer"
          >
            <span>Pesan Sekarang</span>
            <div className="flex items-center gap-1.5">
              <span>Rp{grandTotal.toLocaleString('id-ID')}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
