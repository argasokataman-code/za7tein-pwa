import React from 'react';
import { X, Bell, Tag, Sparkles, CheckCheck } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onApplyPromoClick?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onApplyPromoClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center p-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full bg-white rounded-t-[32px] max-h-[92%] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#E44222]" />
            <h2 className="text-base font-black text-[#172434]">Notifikasi</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Tandai dibaca</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.type === 'promo' && onApplyPromoClick) {
                  onApplyPromoClick();
                  onClose();
                }
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                item.read
                  ? 'bg-white border-slate-200/80 opacity-80'
                  : 'bg-[#FFF8F5] border-orange-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === 'promo'
                      ? 'bg-[#E44222] text-white'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {item.type === 'promo' ? (
                    <Tag className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-[#172434]">{item.title}</h3>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{item.message}</p>
                  {item.type === 'promo' && (
                    <span className="inline-block mt-2 text-[11px] font-bold text-[#E44222] underline">
                      Klaim Kupon Sekarang →
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
