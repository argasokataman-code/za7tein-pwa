import React from 'react';
import { Heart, Star, Plus } from 'lucide-react';
import { FoodItem } from '../types';

export type SubFilterType = 'paling_cocok' | 'rating_tinggi' | 'ongkir_hemat';

interface NearbyDishesProps {
  dishes: FoodItem[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  onSelectDish: (dish: FoodItem) => void;
  onQuickAdd: (dish: FoodItem) => void;
  activeSubFilter: SubFilterType;
  onSubFilterChange: (filter: SubFilterType) => void;
  onViewAll?: () => void;
}

export const NearbyDishes: React.FC<NearbyDishesProps> = ({
  dishes,
  favoriteIds,
  onToggleFavorite,
  onSelectDish,
  onQuickAdd,
  activeSubFilter,
  onSubFilterChange,
  onViewAll,
}) => {
  return (
    <section className="px-5 py-3">
      {/* Header & View All */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[#172434] tracking-tight">
          Pilihan di dekatmu
        </h2>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-[#E44222] hover:text-orange-700 transition-colors cursor-pointer"
        >
          Lihat semua
        </button>
      </div>

      {/* Filter Chips Bar (Exact replica of chips in screenshot) */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => onSubFilterChange('paling_cocok')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 cursor-pointer ${
            activeSubFilter === 'paling_cocok'
              ? 'bg-[#FFEAE2] text-[#E44222] border border-[#E44222]/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-transparent'
          }`}
        >
          Paling cocok
        </button>

        <button
          onClick={() => onSubFilterChange('rating_tinggi')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 cursor-pointer ${
            activeSubFilter === 'rating_tinggi'
              ? 'bg-[#FFEAE2] text-[#E44222] border border-[#E44222]/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-transparent'
          }`}
        >
          Rating 4,5+
        </button>

        <button
          onClick={() => onSubFilterChange('ongkir_hemat')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 cursor-pointer ${
            activeSubFilter === 'ongkir_hemat'
              ? 'bg-[#FFEAE2] text-[#E44222] border border-[#E44222]/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-transparent'
          }`}
        >
          Ongkir hemat
        </button>
      </div>

      {/* Dish Cards Row / Grid */}
      <div className="grid grid-cols-2 gap-3.5 mt-3.5">
        {dishes.length === 0 ? (
          <div className="col-span-2 py-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-500">Tidak ada menu yang sesuai filter.</p>
            <button
              onClick={() => onSubFilterChange('paling_cocok')}
              className="mt-2 text-xs font-bold text-[#E44222]"
            >
              Reset filter
            </button>
          </div>
        ) : (
          dishes.map((dish) => {
            const isFav = favoriteIds.includes(dish.id);

            return (
              <div
                key={dish.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group relative"
              >
                {/* Image Container with Favorite Button */}
                <div
                  className="relative aspect-4/3 overflow-hidden cursor-pointer bg-stone-100"
                  onClick={() => onSelectDish(dish)}
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Fallback pattern if image cannot load */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-50 to-orange-100 -z-1 flex items-center justify-center p-3 text-center">
                    <span className="text-xs font-bold text-orange-900">{dish.name}</span>
                  </div>

                  {/* Favorite Toggle Button (Circular pill from screenshot) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(dish.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-xs active:scale-80 transition-all cursor-pointer hover:bg-white"
                    aria-label={isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isFav
                          ? 'fill-[#E44222] text-[#E44222]'
                          : 'text-slate-600 hover:text-[#E44222]'
                      }`}
                    />
                  </button>

                  {/* Discount pill if promo */}
                  {dish.originalPrice && (
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-[#E44222] text-white text-[10px] font-black shadow-xs">
                      Hemat {Math.round(((dish.originalPrice - dish.price) / dish.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div
                  className="p-3 flex-1 flex flex-col justify-between cursor-pointer"
                  onClick={() => onSelectDish(dish)}
                >
                  <div>
                    {/* Dish Name */}
                    <h3 className="font-bold text-sm text-[#172434] leading-snug line-clamp-2 group-hover:text-[#E44222] transition-colors">
                      {dish.name}
                    </h3>

                    {/* Merchant / Warung Name */}
                    <p className="text-xs font-medium text-slate-400 mt-1">
                      {dish.merchantName}
                    </p>

                    {/* Rating & Delivery Time */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1.5 font-medium">
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[#172434] font-bold text-xs">
                          {dish.rating.toFixed(1).replace('.', ',')}
                        </span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 text-[11px] truncate">
                        {dish.timeEstimate}
                      </span>
                    </div>
                  </div>

                  {/* Price & Quick Add Button */}
                  <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-sm font-black text-[#E44222] tracking-tight">
                        Rp{dish.price.toLocaleString('id-ID')}
                      </span>
                      {dish.originalPrice && (
                        <span className="block text-[10px] text-slate-400 line-through">
                          Rp{dish.originalPrice.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAdd(dish);
                      }}
                      className="w-7 h-7 rounded-full bg-[#FFF0EB] text-[#E44222] hover:bg-[#E44222] hover:text-white flex items-center justify-center transition-all active:scale-85 shadow-xs cursor-pointer"
                      title="Tambah ke keranjang"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
