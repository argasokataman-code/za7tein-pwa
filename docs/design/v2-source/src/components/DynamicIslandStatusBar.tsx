import React from 'react';
import { Wifi, Bike } from 'lucide-react';

interface DynamicIslandStatusBarProps {
  activeOrderCount?: number;
  isScrolled?: boolean;
}

export const DynamicIslandStatusBar: React.FC<DynamicIslandStatusBarProps> = ({
  activeOrderCount = 0,
  isScrolled = false,
}) => {
  return (
    <div
      className={`w-full relative select-none pt-2.5 pb-1 px-7 flex items-center justify-between transition-colors duration-300 z-40 ${
        isScrolled ? 'text-slate-900' : 'text-white'
      }`}
    >
      {/* 1. Left: Time */}
      <div className="w-16 flex items-center justify-start">
        <span
          className={`text-[14px] font-bold tracking-tight transition-colors duration-300 ${
            isScrolled ? 'text-slate-900' : 'text-white drop-shadow-xs'
          }`}
        >
          09:41
        </span>
      </div>

      {/* 2. Center: iPhone 18 Pro Dynamic Island (Non-clickable / Static) */}
      <div className="flex-1 flex justify-center items-center pointer-events-none select-none">
        <div
          className="w-28 h-[26px] bg-black text-white rounded-full flex items-center justify-between px-2.5 py-1 ring-1 ring-black/40 shadow-sm shadow-black/25"
          aria-hidden="true"
        >
          {/* Sensor dot on left */}
          <div className="w-2 h-2 rounded-full bg-[#0a0a0a] ring-1 ring-white/5 flex items-center justify-center">
            <div className="w-0.5 h-0.5 rounded-full bg-blue-900/60" />
          </div>

          {/* Optional mini activity indicator inside dynamic island */}
          {activeOrderCount > 0 && (
            <div className="flex items-center gap-1">
              <Bike className="w-2.5 h-2.5 text-amber-400" />
              <span className="text-[9px] font-bold text-white">15m</span>
            </div>
          )}

          {/* Camera lens reflection dot on right */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#0d1117] ring-1 ring-blue-950/40 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#1e293b]/70" />
          </div>
        </div>
      </div>

      {/* 3. Right: Cellular Signal, Wifi & Battery */}
      <div className="w-16 flex items-center justify-end gap-1.5 transition-colors duration-300">
        {/* Cellular 4 bars */}
        <div className="flex items-end gap-[1.5px] h-3">
          <span
            className={`w-[3px] h-1.5 rounded-[0.5px] transition-colors duration-300 ${
              isScrolled ? 'bg-slate-900' : 'bg-white'
            }`}
          />
          <span
            className={`w-[3px] h-2 rounded-[0.5px] transition-colors duration-300 ${
              isScrolled ? 'bg-slate-900' : 'bg-white'
            }`}
          />
          <span
            className={`w-[3px] h-2.5 rounded-[0.5px] transition-colors duration-300 ${
              isScrolled ? 'bg-slate-900' : 'bg-white'
            }`}
          />
          <span
            className={`w-[3px] h-3 rounded-[0.5px] transition-colors duration-300 ${
              isScrolled ? 'bg-slate-900' : 'bg-white'
            }`}
          />
        </div>

        {/* Wi-Fi Icon */}
        <Wifi
          className={`w-3.5 h-3.5 stroke-[2.4] transition-colors duration-300 ${
            isScrolled ? 'text-slate-900' : 'text-white'
          }`}
        />

        {/* Modern iOS Battery Capsule */}
        <div className="flex items-center">
          <div
            className={`w-[22px] h-[11px] rounded-[3.5px] border p-[1.5px] flex items-center transition-colors duration-300 ${
              isScrolled ? 'border-slate-900' : 'border-white/90'
            }`}
          >
            <div
              className={`w-full h-full rounded-[1.5px] transition-colors duration-300 ${
                isScrolled ? 'bg-slate-900' : 'bg-white'
              }`}
            />
          </div>
          <div
            className={`w-[1px] h-[4px] rounded-r-[0.5px] -ml-[0.5px] transition-colors duration-300 ${
              isScrolled ? 'bg-slate-900' : 'bg-white/90'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
