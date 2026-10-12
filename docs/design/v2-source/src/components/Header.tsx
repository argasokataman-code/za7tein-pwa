import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { Address } from '../types';
import { CurrencyExchangeIcon } from './CurrencyExchangeIcon';

interface HeaderProps {
  currentAddress: Address;
  onOpenAddressModal: () => void;
  onOpenCurrencyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAddress,
  onOpenAddressModal,
  onOpenCurrencyModal,
}) => {
  return (
    <header className="w-full select-none text-white relative pt-4 pb-1">
      {/* Delivery Address Bar with Currency Converter Info on the Right */}
      <div className="flex items-center justify-between gap-3 px-5">
        {/* Antar ke Rumah Button (compact left-aligned with location icon) */}
        <button
          onClick={onOpenAddressModal}
          className="flex-1 min-w-0 flex items-center gap-3 text-left group focus:outline-hidden cursor-pointer"
          aria-label="Ubah alamat pengantaran"
        >
          {/* Location Pin Icon container */}
          <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-active:scale-95 transition-transform backdrop-blur-xs">
            <MapPin className="w-5 h-5 fill-white/20 stroke-[2.4]" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold tracking-wider text-white/80 uppercase">
              ANTAR KE {currentAddress.label.toUpperCase()}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-extrabold text-white truncate group-hover:text-amber-100 transition-colors">
                {currentAddress.address}
              </span>
              <ChevronDown className="w-4 h-4 text-white/90 shrink-0 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </div>
        </button>

        {/* Currency Exchange / Google Currency Info Button */}
        <button
          onClick={onOpenCurrencyModal}
          className="relative w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 active:scale-95 border border-white/25 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer shadow-xs shrink-0"
          aria-label="Info Kurs & Konversi Mata Uang JOD ke IDR"
          title="Info Kurs JOD ⇄ IDR (Google Currency)"
        >
          <CurrencyExchangeIcon className="w-5.5 h-5.5 text-white" />
        </button>
      </div>
    </header>
  );
};

