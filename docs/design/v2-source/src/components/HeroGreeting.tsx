import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface HeroGreetingProps {
  userName?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenFilter: () => void;
  activeFilterCount: number;
}

const FULL_PLACEHOLDER_TEXT = 'Cari makanan favoritmu';

export const HeroGreeting: React.FC<HeroGreetingProps> = ({
  userName = 'Umam',
  searchQuery,
  onSearchChange,
  onOpenFilter,
  activeFilterCount,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Pop-up typewriter typing effect for "Cari makanan favoritmu"
  useEffect(() => {
    if (searchQuery) return;

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < FULL_PLACEHOLDER_TEXT.length) {
        timer = setTimeout(() => {
          setDisplayText(FULL_PLACEHOLDER_TEXT.slice(0, displayText.length + 1));
        }, 85);
      } else {
        // Pause at complete text before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(FULL_PLACEHOLDER_TEXT.slice(0, displayText.length - 1));
        }, 40);
      } else {
        // Pause briefly before typing again
        timer = setTimeout(() => {
          setIsDeleting(false);
        }, 450);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, searchQuery]);

  return (
    <section className="px-5 pt-3 pb-5">
      {/* Greeting Title (Crisp white for warm orange background) */}
      <h1 className="text-[25px] sm:text-[27px] font-black tracking-tight text-white leading-tight drop-shadow-xs">
        Mau makan apa, {userName}?
      </h1>
      <p className="text-xs sm:text-sm font-medium text-white/85 mt-1">
        Kuliner Nusantara di Bumi Syam
      </p>

      {/* Search & Filter Bar (Elevated high-contrast white card) */}
      <div className="mt-4 flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 z-10">
            <Search className="w-5 h-5 stroke-[2.2]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-label="Cari makanan favoritmu"
            className="w-full h-12 pl-11 pr-9 rounded-2xl bg-white border border-white/80 text-sm font-semibold text-slate-800 shadow-md shadow-orange-950/15 focus:outline-hidden focus:ring-2 focus:ring-amber-300 transition-all"
          />

          {/* Pop-up Typewriter Animated Placeholder */}
          {!searchQuery && (
            <div className="absolute inset-y-0 left-11 right-9 flex items-center pointer-events-none select-none overflow-hidden">
              <span
                className={`text-sm font-semibold flex items-center transition-colors duration-150 ${
                  isFocused ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                <span>{displayText}</span>
                <span className="inline-block w-[2px] h-4 ml-0.5 bg-[#E44220] rounded-full animate-pulse shrink-0" />
              </span>
            </div>
          )}

          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer z-10"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Sliders Button */}
        <button
          onClick={onOpenFilter}
          className={`h-12 w-12 rounded-2xl border flex items-center justify-center relative transition-all active:scale-95 shadow-md shadow-orange-950/15 cursor-pointer ${
            activeFilterCount > 0
              ? 'bg-amber-300 border-amber-400 text-slate-900 font-bold'
              : 'bg-white border-white/80 text-slate-700 hover:bg-slate-50'
          }`}
          aria-label="Filter makanan"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[2.2]" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#DE3B1A] text-white rounded-full text-[11px] font-black flex items-center justify-center ring-2 ring-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </section>
  );
};
