import React from 'react';
import { Heart, Star, Plus, Trash2 } from 'lucide-react';
import { FoodItem } from '../types';

interface FavoritesTabProps {
  favoriteDishes: FoodItem[];
  onRemoveFavorite: (id: string) => void;
  onSelectDish: (dish: FoodItem) => void;
  onQuickAdd: (dish: FoodItem) => void;
  onExploreFood: () => void;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({
  favoriteDishes,
  onRemoveFavorite,
  onSelectDish,
  onQuickAdd,
  onExploreFood,
}) => {
  return (
    <div className="p-5 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-[#172434]">Menu Favoritmu</h1>
        <span className="text-xs font-bold text-slate-400">
          {favoriteDishes.length} menu disimpan
        </span>
      </div>

      {favoriteDishes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-3">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-black text-sm text-[#172434]">Belum Ada Menu Favorit</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Tekan ikon hati pada menu makanan yang kamu sukai untuk menyimpannya di sini.
          </p>
          <button
            onClick={onExploreFood}
            className="mt-2 px-5 py-2.5 bg-[#E44222] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Cari Menu Enak
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {favoriteDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => onSelectDish(dish)}
              className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group"
            >
              <img
                src={dish.image}
                alt={dish.name}
                className="w-18 h-18 rounded-xl object-cover shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-[#172434] truncate group-hover:text-[#E44222] transition-colors">
                  {dish.name}
                </h3>
                <p className="text-xs text-slate-400">{dish.merchantName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-black text-[#E44222]">
                    Rp{dish.price.toLocaleString('id-ID')}
                  </span>
                  <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{dish.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(dish.id);
                  }}
                  className="w-8 h-8 rounded-full text-slate-300 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                  title="Hapus dari favorit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAdd(dish);
                  }}
                  className="w-8 h-8 rounded-full bg-[#FFF0EB] text-[#E44222] hover:bg-[#E44222] hover:text-white flex items-center justify-center transition-colors active:scale-90 shadow-xs cursor-pointer"
                  title="Tambah ke keranjang"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
