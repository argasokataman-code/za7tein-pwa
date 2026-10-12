import React, { useState } from 'react';
import { X, Star, Clock, MapPin, Plus, Minus, Heart, Check } from 'lucide-react';
import { FoodItem } from '../types';

interface FoodDetailModalProps {
  dish: FoodItem | null;
  onClose: () => void;
  onAddToCart: (dish: FoodItem, quantity: number, spicyLevel?: string, options?: string[], notes?: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onViewWarung: (merchantId: string) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  dish,
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  onViewWarung,
}) => {
  if (!dish) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedSpicy, setSelectedSpicy] = useState<string>(dish.spicyLevels?.[1] || dish.spicyLevels?.[0] || '');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const toggleOption = (optionName: string) => {
    if (selectedOptions.includes(optionName)) {
      setSelectedOptions(selectedOptions.filter((opt) => opt !== optionName));
    } else {
      setSelectedOptions([...selectedOptions, optionName]);
    }
  };

  // Calculate total price based on additions
  const additionsTotal = selectedOptions.reduce((acc, optName) => {
    const opt = dish.options?.find((o) => o.name === optName);
    return acc + (opt?.price || 0);
  }, 0);

  const itemTotal = (dish.price + additionsTotal) * quantity;

  const handleAdd = () => {
    onAddToCart(dish, quantity, selectedSpicy, selectedOptions, notes);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center p-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full bg-white rounded-t-[32px] max-h-[92%] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Image & Floating Close/Favorite Buttons */}
        <div className="relative h-64 sm:h-72 w-full bg-stone-100 shrink-0">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Favorite button */}
          <button
            onClick={() => onToggleFavorite(dish.id)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite
                  ? 'fill-[#E44222] text-[#E44222]'
                  : 'text-slate-700'
              }`}
            />
          </button>

          {/* Title on Image */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <h2 className="text-xl sm:text-2xl font-black drop-shadow-sm leading-tight">
              {dish.name}
            </h2>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-white/90 font-medium">
              <button
                onClick={() => {
                  onClose();
                  onViewWarung(dish.merchantId);
                }}
                className="underline hover:text-orange-200 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>{dish.merchantName}</span>
                <span className="text-[10px]">↗</span>
              </button>
              <span>•</span>
              <div className="flex items-center gap-1 text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>{dish.rating.toFixed(1)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{dish.timeEstimate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Tentang Menu Ini
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {dish.description}
            </p>
          </div>

          {/* Spicy Level Selection */}
          {dish.spicyLevels && dish.spicyLevels.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-[#172434] mb-2 flex items-center justify-between">
                <span>Tingkat Kepedasan</span>
                <span className="text-xs font-semibold text-[#E44222] bg-[#FFF0EB] px-2 py-0.5 rounded-full">
                  Wajib pilih 1
                </span>
              </h3>
              <div className="space-y-2">
                {dish.spicyLevels.map((level) => {
                  const isChecked = selectedSpicy === level;
                  return (
                    <label
                      key={level}
                      onClick={() => setSelectedSpicy(level)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#E44222] bg-[#FFF0EB]/40 text-[#172434] font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{level}</span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'border-[#E44222] bg-[#E44222] text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extra Options / Add-ons */}
          {dish.options && dish.options.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-[#172434] mb-2 flex items-center justify-between">
                <span>Tambahan Pelengkap</span>
                <span className="text-xs text-slate-400">Opsional</span>
              </h3>
              <div className="space-y-2">
                {dish.options.map((opt) => {
                  const isChecked = selectedOptions.includes(opt.name);
                  return (
                    <label
                      key={opt.name}
                      onClick={() => toggleOption(opt.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#E44222] bg-[#FFF0EB]/30 text-[#172434] font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'border-[#E44222] bg-[#E44222] text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span>{opt.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#E44222]">
                        +Rp{opt.price.toLocaleString('id-ID')}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Notes */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-sm font-bold text-[#172434] mb-1.5">
              Catatan untuk Tetangga Masak
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Sambal dipisah ya Bu, sambal jangan terlalu asin..."
              rows={2}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-hidden focus:border-[#E44222] focus:ring-1 focus:ring-[#E44222]"
            />
          </div>
        </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="p-4 bg-white border-t border-slate-200/90 flex items-center justify-between gap-4 shrink-0 shadow-lg">
          {/* Quantity Counter */}
          <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl bg-white disabled:opacity-40 text-slate-800 flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-sm w-5 text-center text-[#172434]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-white text-slate-800 flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAdd}
            className="flex-1 h-12 rounded-2xl bg-[#E44222] hover:bg-[#d43717] active:scale-98 text-white font-bold text-sm flex items-center justify-between px-5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
          >
            <span>Tambah ke Keranjang</span>
            <span>Rp{itemTotal.toLocaleString('id-ID')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
