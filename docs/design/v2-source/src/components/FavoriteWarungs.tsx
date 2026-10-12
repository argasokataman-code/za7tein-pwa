import React from 'react';
import { ChevronRight, Store, ShieldCheck } from 'lucide-react';
import { Warung } from '../types';

interface FavoriteWarungsProps {
  warungs: Warung[];
  onSelectWarung: (warung: Warung) => void;
  onExploreAll?: () => void;
}

export const FavoriteWarungs: React.FC<FavoriteWarungsProps> = ({
  warungs,
  onSelectWarung,
  onExploreAll,
}) => {
  return (
    <section className="px-5 pt-3 pb-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[#172434] tracking-tight">
          Tetangga favorit
        </h2>
        <button
          onClick={onExploreAll}
          className="text-xs font-bold text-[#E44222] hover:text-orange-700 transition-colors cursor-pointer"
        >
          Jelajahi
        </button>
      </div>

      {/* Warung List */}
      <div className="mt-3.5 space-y-3">
        {warungs.map((warung) => (
          <div
            key={warung.id}
            onClick={() => onSelectWarung(warung)}
            className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99]"
          >
            {/* Warung Thumbnail */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
              <img
                src={warung.image}
                alt={warung.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-amber-50 -z-1 flex items-center justify-center">
                <Store className="w-6 h-6 text-amber-600" />
              </div>
            </div>

            {/* Warung Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-[#172434] truncate group-hover:text-[#E44222] transition-colors">
                  {warung.name}
                </h3>
                {warung.verified && (
                  <span title="Tetangga Terverifikasi">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                {warung.category} • {warung.distance}
              </p>

              {/* Promo badge / shipping perk */}
              <p className="text-xs font-bold text-[#205493] mt-1 truncate">
                {warung.promoText}
              </p>
            </div>

            {/* Chevron Arrow */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#172434] group-hover:translate-x-0.5 transition-all">
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
