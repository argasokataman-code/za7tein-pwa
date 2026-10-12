import React from 'react';
import { Clock, CheckCircle2, Bike, RotateCcw, ArrowRight } from 'lucide-react';
import { Order } from '../types';

interface OrdersTabProps {
  orders: Order[];
  onTrackOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
  onExploreFood: () => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  onTrackOrder,
  onReorder,
  onExploreFood,
}) => {
  const activeOrders = orders.filter((o) => o.status !== 'selesai' && o.status !== 'dibatalkan');
  const pastOrders = orders.filter((o) => o.status === 'selesai' || o.status === 'dibatalkan');

  return (
    <div className="p-5 pb-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-[#172434]">Riwayat Pesanan</h1>
        <span className="text-xs font-bold text-slate-400">{orders.length} total</span>
      </div>

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#E44222] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E44222] animate-ping" />
            <span>Sedang Berjalan</span>
          </h2>

          {activeOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 bg-white rounded-2xl border-2 border-orange-200 shadow-md shadow-orange-950/5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-[#172434]">{order.warungName}</h3>
                  <p className="text-[11px] text-slate-400">{order.date} • ID #{order.id}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#FFF0EB] text-[#E44222] text-[11px] font-black flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5" />
                  <span>Diantar</span>
                </span>
              </div>

              {/* Status Alert */}
              <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 flex items-center gap-2 text-xs text-orange-900 font-semibold">
                <Clock className="w-4 h-4 text-[#E44222] shrink-0" />
                <span>{order.statusText}</span>
              </div>

              {/* Items summary */}
              <div className="space-y-1 text-xs text-slate-600">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {it.quantity}x {it.name}
                    </span>
                    <span className="font-medium">
                      Rp{(it.price * it.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-black text-[#172434]">
                  Rp{order.totalPrice.toLocaleString('id-ID')}
                </span>
                <button
                  onClick={() => onTrackOrder(order)}
                  className="px-4 py-2 rounded-xl bg-[#E44222] text-white text-xs font-bold hover:bg-[#d43717] active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>Lacak Pengantaran</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past Orders Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Pesanan Selesai
        </h2>

        {pastOrders.length === 0 && activeOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-orange-50 text-[#E44222] flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-black text-sm text-[#172434]">Belum Ada Riwayat Pesanan</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Cobain deh masakan lezat dari tetangga terdekatmu sekarang!
            </p>
            <button
              onClick={onExploreFood}
              className="mt-2 px-5 py-2.5 bg-[#E44222] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Jelajahi Makanan
            </button>
          </div>
        ) : (
          pastOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-[#172434]">{order.warungName}</h3>
                  <p className="text-[11px] text-slate-400">{order.date}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selesai</span>
                </span>
              </div>

              {/* Items summary */}
              <div className="space-y-1 text-xs text-slate-600">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {it.quantity}x {it.name}
                    </span>
                    <span className="font-medium">
                      Rp{(it.price * it.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-black text-[#172434]">
                  Rp{order.totalPrice.toLocaleString('id-ID')}
                </span>
                <button
                  onClick={() => onReorder(order)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:border-[#E44222] hover:text-[#E44222] text-xs font-bold active:scale-95 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Pesan Lagi</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
