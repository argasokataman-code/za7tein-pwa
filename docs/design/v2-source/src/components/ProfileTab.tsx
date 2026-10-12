import React, { useState } from 'react';
import {
  MapPin,
  Tag,
  CreditCard,
  HelpCircle,
  Shield,
  ChevronRight,
  Pencil,
  X,
  Check,
  User,
  Phone,
} from 'lucide-react';
import { Address } from '../types';

interface ProfileTabProps {
  userName?: string;
  userPhone?: string;
  onUpdateProfile?: (name: string, phone: string) => void;
  savedAddressCount?: number;
  currentAddress?: Address;
  onOpenAddressModal: () => void;
  onOpenCouponModal: () => void;
  couponApplied: boolean;
  onShowToast?: (msg: string) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userName = 'Umam Lombok',
  userPhone = '+962 7 9123 4567',
  onUpdateProfile,
  savedAddressCount = 1,
  currentAddress,
  onOpenAddressModal,
  onOpenCouponModal,
  couponApplied,
  onShowToast,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempPhone, setTempPhone] = useState(userPhone);

  // Generate initials (e.g. Umam Lombok -> UL)
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return 'UL';
  };

  const handleOpenEdit = () => {
    setTempName(userName);
    setTempPhone(userPhone);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = tempName.trim() || userName;
    const trimmedPhone = tempPhone.trim() || userPhone;
    if (onUpdateProfile) {
      onUpdateProfile(trimmedName, trimmedPhone);
    }
    setIsEditModalOpen(false);
    if (onShowToast) {
      onShowToast('Profil berhasil disimpan! ✨');
    }
  };

  const handleInfoNotice = (text: string) => {
    if (onShowToast) {
      onShowToast(text);
    }
  };

  return (
    <div className="p-5 pb-6 space-y-6">
      {/* Profile Header Box (Nama default Umam Lombok & Tombol Edit Profil) */}
      <div className="flex items-center justify-between gap-4 bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar with initials */}
          <div className="w-14 h-14 rounded-full bg-linear-to-tr from-amber-400 to-[#E44222] p-0.5 shadow-sm shrink-0">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#E44222] font-black text-lg tracking-wider">
              {getInitials(userName)}
            </div>
          </div>

          {/* Name & Phone info */}
          <div className="min-w-0">
            <h1 className="text-lg font-black text-[#172434] truncate leading-tight">
              {userName}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
              {userPhone}
            </p>
          </div>
        </div>

        {/* Edit Profile Button in Name Box (Icon only) */}
        <button
          onClick={handleOpenEdit}
          className="w-9 h-9 rounded-2xl flex items-center justify-center bg-orange-50 hover:bg-orange-100/90 text-[#E44222] transition-all border border-orange-200 active:scale-95 cursor-pointer shadow-2xs shrink-0"
          aria-label="Edit Profil"
          title="Edit Profil"
        >
          <Pencil className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>

      {/* Quick Stat / Kupon Aktif Card */}
      <div
        onClick={onOpenCouponModal}
        className="p-3.5 bg-gradient-to-br from-orange-50 to-orange-100/60 rounded-2xl border border-orange-200/80 cursor-pointer hover:border-[#E44222] transition-colors flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2 text-[#E44222] mb-1">
            <Tag className="w-4 h-4" />
            <span className="text-xs font-bold">Kupon Aktif</span>
          </div>
          <div className="text-sm font-black text-[#172434]">
            {couponApplied ? '1 Kupon Terpasang' : '1 Siap Pakai'}
          </div>
          <span className="text-[11px] text-slate-500">Kode: SA7BARU (Diskon 30%)</span>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-[#E44222] text-white text-xs font-bold shadow-xs">
          Gunakan
        </div>
      </div>

      {/* Settings & Controls (Langsung Daftar Alamat Pengantaran, Mode Tampilan Layar Dihapus) */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-2xs">
        {/* 1. Langsung Daftar Alamat Pengantaran */}
        <div
          onClick={onOpenAddressModal}
          className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#E44222] flex items-center justify-center border border-orange-100">
              <MapPin className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Daftar Alamat Pengantaran</span>
              <span className="text-[11px] text-slate-400 block">Kelola lokasi antar dan titik peta</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* 2. Metode Pembayaran */}
        <div
          onClick={() => handleInfoNotice('Metode pembayaran: Tunai / COD saat pengantaran & Transfer Bank')}
          className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Metode Pembayaran</span>
              <span className="text-[11px] text-slate-400 block">Cash on delivery (JOD) & Transfer</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* 3. Pusat Bantuan */}
        <div
          onClick={() => handleInfoNotice('Pusat Bantuan: Hubungi admin sa7tein via WhatsApp & Customer Care')}
          className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Pusat Bantuan</span>
              <span className="text-[11px] text-slate-400 block">Hubungi admin sa7tein</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* 4. Tentang sa7tein & Kebijakan */}
        <div
          onClick={() => handleInfoNotice('sa7tein v1.0.0 — Kuliner Nusantara di Bumi Syam (Irbid, Yordania)')}
          className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Tentang sa7tein & Kebijakan</span>
              <span className="text-[11px] text-slate-400 block">Syarat ketentuan & privasi pengguna</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Modal Dialog: Edit Profil */}
      {isEditModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#E44222] flex items-center justify-center">
                  <Pencil className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Edit Profil</h3>
                  <p className="text-[11px] text-slate-500">Ubah nama dan nomor kontak</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#E44222]" />
                  <span>Nama Lengkap</span>
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder=""
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E44222]/30 focus:border-[#E44222] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#E44222]" />
                  <span>No.WhatsApp</span>
                </label>
                <input
                  type="text"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  placeholder=""
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E44222]/30 focus:border-[#E44222] transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-98 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#E44222] hover:bg-[#c9361a] text-white text-xs font-black shadow-md shadow-orange-950/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
