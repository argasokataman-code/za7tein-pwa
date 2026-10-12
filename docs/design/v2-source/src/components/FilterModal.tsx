import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export interface FilterState {
  sortBy: 'relevan' | 'rating' | 'harga_rendah' | 'jarak';
  maxPrice?: number;
  onlyPromo: boolean;
  onlyFreeDelivery: boolean;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilter: FilterState;
  onApplyFilter: (filter: FilterState) => void;
  onResetFilter: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  currentFilter,
  onApplyFilter,
  onResetFilter,
}) => {
  const [localFilter, setLocalFilter] = useState<FilterState>(currentFilter);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilter(localFilter);
    onClose();
  };

  const handleReset = () => {
    onResetFilter();
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center p-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full bg-white rounded-t-[32px] max-h-[92%] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-black text-[#172434]">Filter Makanan</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Urutkan */}
          <div>
            <h3 className="font-bold text-[#172434] mb-2.5">Urutkan Berdasarkan</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'relevan', label: 'Paling Sesuai' },
                { id: 'rating', label: 'Rating Tertinggi' },
                { id: 'jarak', label: 'Jarak Terdekat' },
                { id: 'harga_rendah', label: 'Harga Terendah' },
              ].map((opt) => {
                const isSelected = localFilter.sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      setLocalFilter({
                        ...localFilter,
                        sortBy: opt.id as FilterState['sortBy'],
                      })
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#E44222] bg-[#FFF0EB] text-[#E44222]'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Batas Harga */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="font-bold text-[#172434] mb-2.5">Batas Harga Maksimal</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Semua', val: undefined },
                { label: '< Rp25.000', val: 25000 },
                { label: '< Rp35.000', val: 35000 },
              ].map((p, idx) => {
                const isSelected = localFilter.maxPrice === p.val;
                return (
                  <button
                    key={idx}
                    onClick={() =>
                      setLocalFilter({
                        ...localFilter,
                        maxPrice: p.val,
                      })
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#E44222] bg-[#FFF0EB] text-[#E44222]'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Promo */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <h3 className="font-bold text-[#172434] mb-1">Keuntungan Promo</h3>
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 cursor-pointer">
              <span className="text-xs font-bold text-slate-700">Hanya Menu Sedang Promo</span>
              <input
                type="checkbox"
                checked={localFilter.onlyPromo}
                onChange={(e) =>
                  setLocalFilter({ ...localFilter, onlyPromo: e.target.checked })
                }
                className="w-4 h-4 accent-[#E44222] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 cursor-pointer">
              <span className="text-xs font-bold text-slate-700">Gratis Ongkos Kirim</span>
              <input
                type="checkbox"
                checked={localFilter.onlyFreeDelivery}
                onChange={(e) =>
                  setLocalFilter({ ...localFilter, onlyFreeDelivery: e.target.checked })
                }
                className="w-4 h-4 accent-[#E44222] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-2 py-3 rounded-2xl bg-[#E44222] text-white font-bold text-xs hover:bg-[#d43717] active:scale-98 cursor-pointer shadow-md shadow-orange-600/20"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  );
};
