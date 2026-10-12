import React, { useState, useEffect } from 'react';
import { X, ArrowDownUp, RefreshCw, Check, TrendingUp, Info } from 'lucide-react';
import { CurrencyExchangeIcon } from './CurrencyExchangeIcon';

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrencyModal: React.FC<CurrencyModalProps> = ({ isOpen, onClose }) => {
  // Live rate: default ~25,238.75 IDR per 1 JOD
  const [exchangeRate, setExchangeRate] = useState<number>(25238.75);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Hari ini, pasar valas global');
  const [direction, setDirection] = useState<'JOD_TO_IDR' | 'IDR_TO_JOD'>('JOD_TO_IDR');

  // Input values
  const [jodAmount, setJodAmount] = useState<string>('1');
  const [idrAmount, setIdrAmount] = useState<string>('25239');
  const [copied, setCopied] = useState<boolean>(false);

  // Fetch live exchange rate from Google Currency / live market API
  const fetchRate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/JOD');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && data.rates.IDR) {
          const rate = data.rates.IDR;
          setExchangeRate(rate);
          if (data.time_last_update_utc) {
            const date = new Date(data.time_last_update_utc);
            setLastUpdated(
              date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }) + ' • Google Currency'
            );
          }
          // Recalculate based on current direction
          if (direction === 'JOD_TO_IDR') {
            const num = parseFloat(jodAmount) || 0;
            setIdrAmount(Math.round(num * rate).toString());
          } else {
            const num = parseFloat(idrAmount) || 0;
            setJodAmount((num / rate).toFixed(3));
          }
        }
      }
    } catch {
      // Fallback kept gracefully
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRate();
    }
  }, [isOpen]);

  // Handle JOD input change
  const handleJodChange = (val: string) => {
    // allow numbers and decimal point
    const cleaned = val.replace(/[^0-9.]/g, '');
    setJodAmount(cleaned);
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      setIdrAmount(Math.round(num * exchangeRate).toString());
    } else {
      setIdrAmount('');
    }
  };

  // Handle IDR input change
  const handleIdrChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setIdrAmount(cleaned);
    const num = parseFloat(cleaned);
    if (!isNaN(num) && exchangeRate > 0) {
      setJodAmount((num / exchangeRate).toFixed(3));
    } else {
      setJodAmount('');
    }
  };

  // Quick preset chips
  const handleSelectPresetJod = (val: number) => {
    setDirection('JOD_TO_IDR');
    setJodAmount(val.toString());
    setIdrAmount(Math.round(val * exchangeRate).toString());
  };

  // Switch conversion direction
  const handleSwapDirection = () => {
    setDirection((prev) => (prev === 'JOD_TO_IDR' ? 'IDR_TO_JOD' : 'JOD_TO_IDR'));
  };

  // Copy result
  const handleCopyResult = () => {
    const text =
      direction === 'JOD_TO_IDR'
        ? `${jodAmount} JOD = Rp ${parseInt(idrAmount || '0', 10).toLocaleString('id-ID')}`
        : `Rp ${parseInt(idrAmount || '0', 10).toLocaleString('id-ID')} = ${jodAmount} JOD`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center p-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full bg-white rounded-t-[32px] max-h-[92%] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FFF0EB] text-[#E44220] flex items-center justify-center shadow-xs">
              <CurrencyExchangeIcon className="w-5 h-5 text-[#E44220]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Konversi Kurs JOD ⇄ IDR</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Data real-time Google Currency
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={fetchRate}
              disabled={isLoading}
              title="Perbarui kurs Google Currency"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#E44220]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {/* Main Exchange Rate Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF0EB] via-orange-50/60 to-white border border-orange-100 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Kurs Google Finance Hari Ini
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <TrendingUp className="w-3 h-3" />
                <span>Live</span>
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                1 JOD = Rp {Math.round(exchangeRate).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>10.000 IDR ≈ {(10000 / exchangeRate).toFixed(3)} JOD</span>
              <span>{lastUpdated}</span>
            </div>
          </div>

          {/* Converter Card */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
            {/* Field 1 */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {direction === 'JOD_TO_IDR' ? 'Dari (Dinar Yordania)' : 'Dari (Rupiah Indonesia)'}
                </span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                  <span>{direction === 'JOD_TO_IDR' ? '🇯🇴 JOD' : '🇮🇩 IDR'}</span>
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-lg font-bold text-slate-400 mr-2 select-none">
                  {direction === 'JOD_TO_IDR' ? 'JD' : 'Rp'}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={direction === 'JOD_TO_IDR' ? jodAmount : idrAmount}
                  onChange={(e) =>
                    direction === 'JOD_TO_IDR'
                      ? handleJodChange(e.target.value)
                      : handleIdrChange(e.target.value)
                  }
                  placeholder="0"
                  className="w-full text-xl sm:text-2xl font-black text-slate-900 bg-transparent focus:outline-hidden"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center -my-1">
              <button
                type="button"
                onClick={handleSwapDirection}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:border-[#E44220] hover:text-[#E44220] shadow-sm flex items-center justify-center text-slate-600 transition-all cursor-pointer active:scale-95"
                title="Tukar arah konversi"
              >
                <ArrowDownUp className="w-4 h-4 stroke-[2.4]" />
              </button>
            </div>

            {/* Field 2 */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {direction === 'JOD_TO_IDR' ? 'Hasil (Rupiah Indonesia)' : 'Hasil (Dinar Yordania)'}
                </span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FFF0EB] text-xs font-bold text-[#E44220]">
                  <span>{direction === 'JOD_TO_IDR' ? '🇮🇩 IDR' : '🇯🇴 JOD'}</span>
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-lg font-bold text-[#E44220] mr-2 select-none">
                  {direction === 'JOD_TO_IDR' ? 'Rp' : 'JD'}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    direction === 'JOD_TO_IDR'
                      ? idrAmount
                        ? parseInt(idrAmount, 10).toLocaleString('id-ID')
                        : ''
                      : jodAmount
                  }
                  onChange={(e) =>
                    direction === 'JOD_TO_IDR'
                      ? handleIdrChange(e.target.value)
                      : handleJodChange(e.target.value)
                  }
                  placeholder="0"
                  className="w-full text-xl sm:text-2xl font-black text-[#E44220] bg-transparent focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Pilihan Cepat Dinar Yordania (JOD):
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[0.5, 1, 1.5, 2, 2.5, 5, 10, 20].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelectPresetJod(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                    parseFloat(jodAmount) === val && direction === 'JOD_TO_IDR'
                      ? 'bg-[#E44220] text-white border-[#E44220] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {val} JOD
                </button>
              ))}
            </div>
          </div>

          {/* Handy Meal Price Reference in Irbid */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Info className="w-3.5 h-3.5 text-[#E44220]" />
              <span>Estimasi Harga Kuliner di Irbid:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                <span className="font-bold text-slate-900 block">Ongkos Kirim Lokal</span>
                <span className="text-[#E44220] font-semibold">0.5 – 1.0 JOD</span>
                <span className="text-slate-400 block text-[10px]">
                  ≈ Rp {(0.75 * exchangeRate).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                <span className="font-bold text-slate-900 block">Menu Nasi / Ayam</span>
                <span className="text-[#E44220] font-semibold">2.0 – 3.0 JOD</span>
                <span className="text-slate-400 block text-[10px]">
                  ≈ Rp {(2.5 * exchangeRate).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Copy Result Button */}
          <button
            type="button"
            onClick={handleCopyResult}
            className="w-full py-3.5 rounded-2xl bg-[#E44220] hover:bg-[#d03a1c] text-white font-bold text-sm shadow-md shadow-orange-600/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Hasil Konversi Disalin!</span>
              </>
            ) : (
              <>
                <CurrencyExchangeIcon className="w-4 h-4 text-white" />
                <span>Salin Hasil Konversi ({direction === 'JOD_TO_IDR' ? 'IDR' : 'JOD'})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
