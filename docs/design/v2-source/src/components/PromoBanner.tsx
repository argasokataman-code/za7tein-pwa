import React from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

interface PromoBannerProps {
  couponApplied: boolean;
  onApplyCoupon: () => void;
  onDishClick?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  couponApplied,
  onApplyCoupon,
  onDishClick,
}) => {
  return (
    <section className="px-5 py-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#175273] to-[#1D648B] shadow-md shadow-slate-900/10 text-white flex min-h-[160px]">
        {/* Left Content Area */}
        <div className="flex-1 p-5 flex flex-col justify-between z-10">
          <div>
            <span className="text-[11px] font-black tracking-wider uppercase text-white/90 drop-shadow-xs">
              MAKAN ENAK, LEBIH HEMAT
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1 leading-[1.2] drop-shadow-xs">
              Diskon 30%<br />suapan pertama
            </h2>
          </div>

          <div className="mt-3">
            <button
              onClick={onApplyCoupon}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                couponApplied
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-white text-[#1D648B] hover:bg-slate-100'
              }`}
            >
              {couponApplied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Kupon SA7BARU Aktif</span>
                </>
              ) : (
                <>
                  <span>Pakai SA7BARU</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side Dish Image */}
        <div
          onClick={onDishClick}
          className="w-[45%] relative cursor-pointer overflow-hidden group"
          title="Lihat Nasi Ayam Sambal Matah"
        >
          <img
            src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80"
            alt="Nasi Ayam Sambal Matah khas Tetangga"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Graceful SVG fallback in case network image cannot load
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          {/* Subtle gradient vignette matching the teal-blue theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#175273] via-[#1D648B]/30 to-transparent pointer-events-none" />

          {/* Interactive Tap Hint */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-[10px] font-semibold text-white/90 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Spesial</span>
          </div>
        </div>
      </div>
    </section>
  );
};
