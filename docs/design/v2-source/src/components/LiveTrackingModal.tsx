import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, Phone, MessageSquare, Bike, ChefHat, Check, MapPin } from 'lucide-react';
import { Order } from '../types';

interface LiveTrackingModalProps {
  order: Order | null;
  onClose: () => void;
  onOrderDelivered: (orderId: string) => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  order,
  onClose,
  onOrderDelivered,
}) => {
  if (!order) return null;

  // Step tracker: 1 = Diterima, 2 = Dimasak, 3 = Diantar, 4 = Sampai
  const [currentStep, setCurrentStep] = useState<number>(order.status === 'selesai' ? 4 : 2);
  const [estimatedMins, setEstimatedMins] = useState(15);

  useEffect(() => {
    if (currentStep === 4) return;
    const interval = setInterval(() => {
      setEstimatedMins((prev) => Math.max(1, prev - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [currentStep]);

  const handleNextStep = () => {
    if (currentStep < 4) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next === 4) {
        onOrderDelivered(order.id);
      }
    }
  };

  const steps = [
    { num: 1, title: 'Pesanan Diterima', desc: `${order.warungName} telah menerima pesananmu` },
    { num: 2, title: 'Sedang Dimasak', desc: 'Dimasak higienis dan hangat dari dapur tetangga' },
    { num: 3, title: 'Driver Menuju Rumahmu', desc: 'Kang Asep sedang meluncur ke lokasimu' },
    { num: 4, title: 'Pesanan Tiba!', desc: 'Selamat menikmati hidangan lezat masakan tetangga' },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center p-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full bg-white rounded-t-[32px] max-h-[92%] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#172434] text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
              STATUS PENGANTARAN
            </span>
            <h2 className="text-base font-black">ID Pesanan #{order.id}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Estimated Arrival Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF0EB] to-orange-50 border border-orange-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#E44222] uppercase tracking-wider">
                {currentStep === 4 ? 'Pesanan Selesai' : 'Estimasi Waktu Tiba'}
              </div>
              <div className="text-2xl font-black text-[#172434] mt-0.5">
                {currentStep === 4 ? 'Sudah Diantar' : `${estimatedMins} Menit Lagi`}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Alamat: Jl. Dago No. 24, Bandung
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-[#E44222] text-white flex items-center justify-center shadow-md shadow-orange-600/20">
              {currentStep < 3 ? (
                <ChefHat className="w-6 h-6 animate-pulse" />
              ) : currentStep === 3 ? (
                <Bike className="w-6 h-6 animate-bounce" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-4 relative pl-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {steps.map((st) => {
              const isPast = currentStep > st.num;
              const isCurrent = currentStep === st.num;

              return (
                <div key={st.num} className="relative">
                  {/* Step bullet */}
                  <div
                    className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                        : isCurrent
                        ? 'bg-[#E44222] text-white ring-4 ring-orange-100 animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.num}
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-bold ${
                        isCurrent ? 'text-[#E44222]' : isPast ? 'text-[#172434]' : 'text-slate-400'
                      }`}
                    >
                      {st.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Driver Card */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-800 text-white flex items-center justify-center font-black text-sm">
                KA
              </div>
              <div>
                <div className="text-xs font-bold text-[#172434]">Kang Asep Sudrajat</div>
                <div className="text-[11px] text-slate-500">Honda Vario D 4921 AD • ⭐ 4,9</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Menghubungkan telepon ke Kang Asep (0812-3456-7890)...')}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                title="Telepon Driver"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => alert('Membuka pesan singkat ke Kang Asep: "Siap, makanan sudah diambil dan langsung meluncur!"')}
                className="w-9 h-9 rounded-xl bg-[#FFF0EB] border border-[#E44222]/30 text-[#E44222] flex items-center justify-center hover:bg-[#FFE6DC] active:scale-95 transition-all cursor-pointer"
                title="Chat Driver"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Rincian Menu ({order.warungName})
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {it.quantity}x {it.name}
                  </span>
                  <span className="font-semibold text-slate-800">
                    Rp{(it.price * it.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-1 border-t border-slate-100 font-black text-[#172434]">
                <span>Total Pesanan</span>
                <span className="text-[#E44222]">Rp{order.totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Interactive Fast Forward Test Button */}
          {currentStep < 4 && (
            <div className="pt-2 text-center">
              <button
                onClick={handleNextStep}
                className="text-xs font-bold text-[#E44222] hover:underline cursor-pointer bg-orange-50 px-3 py-1.5 rounded-full"
              >
                ⚡ Simulasi: Percepat Status Pengantaran ({steps[currentStep].title})
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            Tutup Pelacakan
          </button>
        </div>
      </div>
    </div>
  );
};
