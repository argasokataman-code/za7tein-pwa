import React from 'react';
import { Home, ReceiptText, Bell, User } from 'lucide-react';

export type NavTabType = 'beranda' | 'pesanan' | 'notifikasi' | 'favorit' | 'akun';

interface BottomNavProps {
  activeTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
  activeOrderCount: number;
  unreadNotifCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  activeOrderCount,
  unreadNotifCount,
}) => {
  return (
    <nav className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-3 z-30 select-none">
      <div className="grid grid-cols-4 items-center">
        {/* Beranda */}
        <button
          onClick={() => onTabChange('beranda')}
          className="flex flex-col items-center justify-center py-1 group focus:outline-hidden transition-all active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <Home
              className={`w-6 h-6 transition-colors ${
                activeTab === 'beranda'
                  ? 'text-[#E44222] stroke-[2.4]'
                  : 'text-slate-400 group-hover:text-slate-600 stroke-[1.8]'
              }`}
            />
          </div>
          <span
            className={`text-[11px] mt-1 font-bold tracking-tight transition-colors ${
              activeTab === 'beranda' ? 'text-[#E44222]' : 'text-slate-500'
            }`}
          >
            Beranda
          </span>
        </button>

        {/* Pesanan */}
        <button
          onClick={() => onTabChange('pesanan')}
          className="flex flex-col items-center justify-center py-1 group focus:outline-hidden transition-all active:scale-95 cursor-pointer relative"
        >
          <div className="relative">
            <ReceiptText
              className={`w-6 h-6 transition-colors ${
                activeTab === 'pesanan'
                  ? 'text-[#E44222] stroke-[2.4]'
                  : 'text-slate-400 group-hover:text-slate-600 stroke-[1.8]'
              }`}
            />
            {activeOrderCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#E44222] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white animate-bounce">
                {activeOrderCount}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] mt-1 font-bold tracking-tight transition-colors ${
              activeTab === 'pesanan' ? 'text-[#E44222]' : 'text-slate-500'
            }`}
          >
            Pesanan
          </span>
        </button>

        {/* Notifikasi (Menggantikan Favorit) */}
        <button
          onClick={() => onTabChange('notifikasi')}
          className="flex flex-col items-center justify-center py-1 group focus:outline-hidden transition-all active:scale-95 cursor-pointer relative"
        >
          <div className="relative">
            <Bell
              className={`w-6 h-6 transition-colors ${
                activeTab === 'notifikasi'
                  ? 'text-[#E44222] stroke-[2.4]'
                  : 'text-slate-400 group-hover:text-slate-600 stroke-[1.8]'
              }`}
            />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#E44222] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] mt-1 font-bold tracking-tight transition-colors ${
              activeTab === 'notifikasi' ? 'text-[#E44222]' : 'text-slate-500'
            }`}
          >
            Notifikasi
          </span>
        </button>

        {/* Akun */}
        <button
          onClick={() => onTabChange('akun')}
          className="flex flex-col items-center justify-center py-1 group focus:outline-hidden transition-all active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <User
              className={`w-6 h-6 transition-colors ${
                activeTab === 'akun'
                  ? 'text-[#E44222] stroke-[2.4]'
                  : 'text-slate-400 group-hover:text-slate-600 stroke-[1.8]'
              }`}
            />
          </div>
          <span
            className={`text-[11px] mt-1 font-bold tracking-tight transition-colors ${
              activeTab === 'akun' ? 'text-[#E44222]' : 'text-slate-500'
            }`}
          >
            Akun
          </span>
        </button>
      </div>

      {/* iPhone 18 Pro iOS Home Indicator Bar */}
      <div className="w-32 h-1 bg-slate-900/30 rounded-full mx-auto mt-2 mb-0.5 pointer-events-none select-none" />
    </nav>
  );
};
