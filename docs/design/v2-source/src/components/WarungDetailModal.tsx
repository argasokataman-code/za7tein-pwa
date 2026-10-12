import React from 'react';
import { X, Star, Clock, MapPin, ShieldCheck, Heart, Plus, Sparkles, ChefHat } from 'lucide-react';
import { Warung, FoodItem } from '../types';

interface WarungDetailModalProps {
  warung: Warung | null;
  onClose: () => void;
  dishes: FoodItem[];
  onSelectDish: (dish: FoodItem) => void;
  onQuickAdd: (dish: FoodItem) => void;
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
}

export const WarungDetailModal: React.FC<WarungDetailModalProps> = ({
  warung,
  onClose,
  dishes,
  onSelectDish,
  onQuickAdd,
  favoriteIds,
  onToggleFavorite,
}) => {
  if (!warung) return null;

  const warungDishes = dishes.filter((d) => d.merchantId === warung.id);

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center p-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full bg-white rounded-t-[32px] max-h-[92%] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warung Header Banner */}
        <div className="relative h-48 sm:h-52 w-full bg-slate-800 shrink-0">
          <img
            src={warung.image}
            alt={warung.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Warung info over image */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E44222] text-white text-[10px] font-black uppercase tracking-wider">
                {warung.category}
              </span>
              {warung.verified && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tetangga Terverifikasi</span>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-black mt-1 leading-tight">{warung.name}</h2>
            <p className="text-xs text-white/90 mt-0.5">{warung.tagline}</p>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Key Stats Row */}
          <div className="grid grid-cols-3 gap-2 bg-[#FFF0EB]/50 p-3 rounded-2xl border border-orange-100 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-amber-500 font-extrabold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{warung.rating.toFixed(1)}</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {warung.reviewCount} ulasan
              </span>
            </div>

            <div className="border-x border-orange-200/60">
              <div className="font-extrabold text-sm text-[#172434]">
                {warung.distance}
              </div>
              <span className="text-[11px] text-slate-500">Jarak antar</span>
            </div>

            <div>
              <div className="font-extrabold text-sm text-[#E44222]">
                15-25 mnt
              </div>
              <span className="text-[11px] text-slate-500">Estimasi</span>
            </div>
          </div>

          {/* Address & Hours */}
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#E44222] shrink-0 mt-0.5" />
              <span>{warung.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Buka: {warung.openHours}</span>
            </div>
          </div>

          {/* Story / About */}
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5">
              <ChefHat className="w-4 h-4 text-[#E44222]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#172434]">
                Cerita Dapur: {warung.ownerName}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              "{warung.description}"
            </p>
          </div>

          {/* Menu Items List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-[#172434] tracking-tight">
                Menu Masakan dari {warung.name}
              </h3>
              <span className="text-xs font-bold text-slate-400">
                {warungDishes.length} menu tersedia
              </span>
            </div>

            <div className="space-y-3">
              {warungDishes.map((dish) => {
                const isFav = favoriteIds.includes(dish.id);
                return (
                  <div
                    key={dish.id}
                    onClick={() => onSelectDish(dish)}
                    className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:border-[#E44222]/40 transition-all cursor-pointer group"
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-18 h-18 rounded-xl object-cover shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-[#172434] group-hover:text-[#E44222] transition-colors truncate">
                        {dish.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {dish.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-black text-[#E44222]">
                          Rp{dish.price.toLocaleString('id-ID')}
                        </span>
                        <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{dish.rating}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAdd(dish);
                      }}
                      className="w-8 h-8 rounded-full bg-[#FFF0EB] text-[#E44222] hover:bg-[#E44222] hover:text-white flex items-center justify-center transition-colors active:scale-90 shadow-xs shrink-0 cursor-pointer"
                      title="Tambah ke keranjang"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Close Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
