import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  MapPin,
  Check,
  Plus,
  Pencil,
  ArrowLeft,
  Home,
  Briefcase,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { Address } from '../types';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  currentAddressId: string;
  onSelectAddress: (address: Address) => void;
  onAddAddress: (newAddr: Omit<Address, 'id' | 'isDefault'>) => void;
  onUpdateAddress: (updatedAddr: Address) => void;
  onDeleteAddress?: (id: string) => void;
}

type CountryCode = 'JO' | 'ID' | 'MY';

interface CountryConfig {
  code: CountryCode;
  name: string;
  dialCode: string;
}

const COUNTRIES: CountryConfig[] = [
  {
    code: 'JO',
    name: 'Yordania',
    dialCode: '+962',
  },
  {
    code: 'ID',
    name: 'Indonesia',
    dialCode: '+62',
  },
  {
    code: 'MY',
    name: 'Malaysia',
    dialCode: '+60',
  },
];

// Helper to render crisp, full-size, identically-proportioned flags
const renderFlag = (code: CountryCode) => {
  if (code === 'ID') {
    return (
      <div className="w-7 h-4.5 rounded-[3px] overflow-hidden border border-slate-300/80 shadow-2xs shrink-0 flex flex-col bg-white select-none">
        <div className="w-full h-1/2 bg-[#ED1C24]" />
        <div className="w-full h-1/2 bg-white" />
      </div>
    );
  }
  if (code === 'JO') {
    return (
      <div className="w-7 h-4.5 rounded-[3px] overflow-hidden border border-slate-300/80 shadow-2xs shrink-0 bg-white select-none">
        <svg
          className="w-full h-full block"
          viewBox="0 0 60 36"
          preserveAspectRatio="none"
        >
          <rect width="60" height="12" y="0" fill="#000000" />
          <rect width="60" height="12" y="12" fill="#FFFFFF" />
          <rect width="60" height="12" y="24" fill="#007A3D" />
          <polygon points="0,0 24,18 0,36" fill="#CE1126" />
          <polygon
            points="9.0,14.8 9.6,16.8 11.6,16.1 10.7,17.9 12.2,19.3 10.2,19.7 10.4,21.8 8.7,20.6 7.6,22.0 7.8,20.0 5.8,19.3 7.7,18.3 7.2,16.3 8.8,17.4"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    );
  }
  // MY (Malaysia)
  return (
    <div className="w-7 h-4.5 rounded-[3px] overflow-hidden border border-slate-300/80 shadow-2xs shrink-0 bg-white select-none">
      <svg
        className="w-full h-full block"
        viewBox="0 0 60 36"
        preserveAspectRatio="none"
      >
        <rect width="60" height="36" fill="#CC0000" />
        <rect width="60" height="2.57" y="2.57" fill="#FFFFFF" />
        <rect width="60" height="2.57" y="7.71" fill="#FFFFFF" />
        <rect width="60" height="2.57" y="12.86" fill="#FFFFFF" />
        <rect width="60" height="2.57" y="18.00" fill="#FFFFFF" />
        <rect width="60" height="2.57" y="23.14" fill="#FFFFFF" />
        <rect width="60" height="2.57" y="28.29" fill="#FFFFFF" />
        <rect width="60" height="2.57" y="33.43" fill="#FFFFFF" />
        <rect width="30" height="20.57" fill="#000066" />
        <circle cx="12.5" cy="10.28" r="6.2" fill="#FFCC00" />
        <circle cx="14.3" cy="10.28" r="5.2" fill="#000066" />
        <polygon
          points="20.5,6.5 21.2,8.6 23.3,7.9 22.4,9.9 24.5,10.3 22.4,10.7 23.3,12.7 21.2,12.0 20.5,14.1 19.8,12.0 17.7,12.7 18.6,10.7 16.5,10.3 18.6,9.9 17.7,7.9 19.8,8.6"
          fill="#FFCC00"
        />
      </svg>
    </div>
  );
};

// Distinct residential apartment building icon (gedung apartemen bertingkat)
export const ApartmentIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Outline gedung apartemen bertingkat */}
    <rect x="4" y="2" width="16" height="20" rx="2" />
    {/* Jendela lantai atas */}
    <rect x="7.5" y="5.5" width="3" height="3" rx="0.5" />
    <rect x="13.5" y="5.5" width="3" height="3" rx="0.5" />
    {/* Jendela lantai tengah */}
    <rect x="7.5" y="11" width="3" height="3" rx="0.5" />
    <rect x="13.5" y="11" width="3" height="3" rx="0.5" />
    {/* Pintu masuk lantai dasar */}
    <path d="M10 22v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4" />
  </svg>
);

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  addresses,
  currentAddressId,
  onSelectAddress,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
}) => {
  // Modal view states: 'list' | 'edit' | 'add' | 'pinpoint'
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'add' | 'pinpoint'>('list');
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form states
  const [addressType, setAddressType] = useState<'apartment' | 'house' | 'office'>('apartment');
  const [area, setArea] = useState<'Hijazi' | 'Syimali'>('Hijazi');
  const [buildingName, setBuildingName] = useState('');
  const [unitNo, setUnitNo] = useState('');
  const [floor, setFloor] = useState('');
  const [street, setStreet] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+962 7 9123 4567');
  const [additionalDirections, setAdditionalDirections] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Area interactive dropdown state
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const areaDropdownRef = useRef<HTMLDivElement>(null);

  // Country code interactive dropdown
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('JO');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Interactive Google Map drop-pin position
  const [pinPosition, setPinPosition] = useState({ x: 50, y: 50 });
  const [isPinDropping, setIsPinDropping] = useState(false);

  // Dedicated large map pinpoint screen states
  const [tempStreet, setTempStreet] = useState('');
  const [tempPinPosition, setTempPinPosition] = useState({ x: 50, y: 50 });

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
      if (
        areaDropdownRef.current &&
        !areaDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAreaDropdownOpen(false);
      }
    };
    if (isCountryDropdownOpen || isAreaDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen, isAreaDropdownOpen]);

  if (!isOpen) return null;

  // Start editing an address
  const handleStartEdit = (addr: Address) => {
    setEditingAddress(addr);
    setAddressType(
      addr.type ||
        (addr.label.toLowerCase().includes('kantor')
          ? 'office'
          : addr.label.toLowerCase().includes('apartemen')
          ? 'apartment'
          : 'house')
    );
    setArea(
      addr.area && addr.area.toLowerCase().includes('syimali') ? 'Syimali' : 'Hijazi'
    );
    setBuildingName(addr.buildingName || '');
    setUnitNo(addr.unitNo || '');
    setFloor(addr.floor || '');
    setStreet(addr.street || addr.address || '');

    const currentPhone = addr.phoneNumber || '+962 7 9123 4567';
    setPhoneNumber(currentPhone);

    // Detect country code from phone
    if (currentPhone.startsWith('+62')) {
      setSelectedCountry('ID');
    } else if (currentPhone.startsWith('+60')) {
      setSelectedCountry('MY');
    } else {
      setSelectedCountry('JO');
    }

    setAdditionalDirections(addr.additionalDirections || addr.detail || '');
    setAddressLabel(addr.label || '');
    setShowDeleteConfirm(false);
    setViewMode('edit');
  };

  // Start adding a new address
  const handleStartAdd = () => {
    setEditingAddress(null);
    setAddressType('apartment');
    setArea('Hijazi');
    setBuildingName('');
    setUnitNo('');
    setFloor('');
    setStreet('');
    setPhoneNumber('+962 ');
    setSelectedCountry('JO');
    setAdditionalDirections('');
    setAddressLabel('');
    setShowDeleteConfirm(false);
    setViewMode('add');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setEditingAddress(null);
    setIsCountryDropdownOpen(false);
    setShowDeleteConfirm(false);
  };

  // Buka laman khusus Google Maps yang lebih besar untuk drop pin
  const handleOpenPinpointModal = () => {
    setTempStreet(street.trim() || 'Al-Basrah St.');
    setTempPinPosition(pinPosition);
    setViewMode('pinpoint');
  };

  // Kembali dari laman khusus peta ke formulir
  const handleBackFromPinpoint = () => {
    setViewMode(editingAddress ? 'edit' : 'add');
  };

  // Drop pin pada laman khusus peta Google Maps yang besar
  const handlePinpointMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(12, Math.min(85, ((e.clientY - rect.top) / rect.height) * 100));

    setTempPinPosition({ x, y });
    setIsPinDropping(true);
    setTimeout(() => setIsPinDropping(false), 300);

    let detectedStreet = 'Al-Basrah St.';
    if (y < 35) {
      detectedStreet = 'Baghdad St.';
    } else if (y > 65) {
      detectedStreet = 'Al-Quds St.';
    } else if (x > 65) {
      detectedStreet = 'Yarmouk St.';
    } else if (x < 35) {
      detectedStreet = "Al-Jami'ah St.";
    } else {
      detectedStreet = 'Al-Basrah St.';
    }

    setTempStreet(detectedStreet);
  };

  // Pilih jalan cepat di laman khusus peta
  const handleSelectQuickStreet = (name: string, coords: { x: number; y: number }) => {
    setTempStreet(name);
    setTempPinPosition(coords);
    setIsPinDropping(true);
    setTimeout(() => setIsPinDropping(false), 300);
  };

  // Konfirmasi pilihan titik lokasi di laman peta dan kembali ke formulir
  const handleConfirmPinpoint = () => {
    setStreet(tempStreet || 'Al-Basrah St.');
    setPinPosition(tempPinPosition);
    setViewMode(editingAddress ? 'edit' : 'add');
  };

  // When user selects one of the 3 countries, automatically update country code in input
  const handleSelectCountry = (country: CountryConfig) => {
    setSelectedCountry(country.code);
    setIsCountryDropdownOpen(false);

    // Strip any existing dial code prefix and prepend the new one
    const digitsOnly = phoneNumber.replace(/^\+(62|962|60)\s*/, '').trim();
    if (!digitsOnly) {
      setPhoneNumber(`${country.dialCode} `);
    } else {
      setPhoneNumber(`${country.dialCode} ${digitsOnly}`);
    }
  };

  // Save changes (Edit or Add)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct full address string
    const fullStreetAddress =
      street.trim() ||
      (buildingName.trim()
        ? `${buildingName.trim()}, Irbid`
        : 'Al-Basrah St., Irbid, Yordania');
    const constructedDetail = [
      buildingName.trim() ? buildingName.trim() : '',
      unitNo.trim() ? `Unit ${unitNo.trim()}` : '',
      floor.trim() ? `Lt. ${floor.trim()}` : '',
      additionalDirections.trim() ? additionalDirections.trim() : '',
    ]
      .filter(Boolean)
      .join(', ');

    const computedLabel =
      addressLabel.trim() ||
      (addressType === 'apartment' ? 'Apartemen' : addressType === 'house' ? 'Rumah' : 'Kantor');

    if (viewMode === 'edit' && editingAddress) {
      onUpdateAddress({
        ...editingAddress,
        label: computedLabel,
        address: fullStreetAddress,
        detail: constructedDetail || editingAddress.detail,
        type: addressType,
        area: area.trim(),
        buildingName: buildingName.trim(),
        unitNo: unitNo.trim(),
        floor: floor.trim(),
        street: fullStreetAddress,
        phoneNumber: phoneNumber.trim(),
        additionalDirections: additionalDirections.trim(),
      });
    } else {
      onAddAddress({
        label: computedLabel,
        address: fullStreetAddress,
        detail: constructedDetail || 'Alamat baru tersimpan',
        type: addressType,
        area: area.trim(),
        buildingName: buildingName.trim(),
        unitNo: unitNo.trim(),
        floor: floor.trim(),
        street: fullStreetAddress,
        phoneNumber: phoneNumber.trim(),
        additionalDirections: additionalDirections.trim(),
      });
    }

    handleBackToList();
  };

  const isFormMode = viewMode === 'edit' || viewMode === 'add';
  const activeCountry =
    COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center p-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full bg-white rounded-t-[32px] max-h-[92%] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* TOP BAR / HEADER                                          */}
        {/* ========================================================= */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            {viewMode === 'pinpoint' ? (
              <button
                type="button"
                onClick={handleBackFromPinpoint}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shadow-2xs"
                aria-label="Kembali ke formulir"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.4]" />
              </button>
            ) : isFormMode ? (
              <button
                type="button"
                onClick={handleBackToList}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shadow-2xs"
                aria-label="Kembali"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.4]" />
              </button>
            ) : null}

            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {viewMode === 'pinpoint'
                ? 'Tentukan titik di peta'
                : viewMode === 'edit'
                ? 'Edit alamat'
                : viewMode === 'add'
                ? 'Alamat baru'
                : 'Pilih lokasi antar'}
            </h1>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* MODAL BODY                                                */}
        {/* ========================================================= */}
        <div className="overflow-y-auto no-scrollbar flex-1">
          {viewMode === 'pinpoint' ? (
            /* ======================================================= */
            /* DEDICATED LARGE MAP PINPOINT SCREEN                     */
            /* ======================================================= */
            <div className="flex flex-col h-full min-h-[480px]">
              {/* Quick street selection chips on top */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
                  Cepat:
                </span>
                {[
                  { name: 'Al-Basrah St.', coords: { x: 50, y: 50 } },
                  { name: 'Baghdad St.', coords: { x: 50, y: 25 } },
                  { name: 'Yarmouk St.', coords: { x: 75, y: 50 } },
                  { name: 'Al-Quds St.', coords: { x: 50, y: 75 } },
                  { name: "Al-Jami'ah St.", coords: { x: 25, y: 50 } },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectQuickStreet(item.name, item.coords)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      tempStreet === item.name
                        ? 'bg-[#E44220] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Large Interactive Map Canvas */}
              <div
                onClick={handlePinpointMapClick}
                className="relative flex-1 min-h-[360px] bg-slate-100 overflow-hidden cursor-crosshair select-none"
                title="Ketuk titik mana pun untuk drop pin"
              >
                {/* Embedded Large Map with all Google logos, satellite controls, pan arrows, and open in maps cleanly cropped */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                  <iframe
                    title="Google Maps Large Irbid"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      tempStreet.trim()
                        ? `${tempStreet.trim()}, Irbid, Jordan`
                        : 'Al-Basrah St, Irbid, Jordan'
                    )}&z=16&ie=UTF8&iwloc=&output=embed`}
                    className="w-[calc(100%+160px)] h-[calc(100%+150px)] -ml-[80px] -mt-[72px] border-0 select-none pointer-events-none"
                    loading="lazy"
                  />
                </div>

                {/* Animated Drop Pin on Large Map */}
                <div
                  style={{ left: `${tempPinPosition.x}%`, top: `${tempPinPosition.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none z-10 drop-shadow-lg transition-all duration-300 ${
                    isPinDropping ? 'scale-125 -translate-y-[115%]' : 'scale-100'
                  }`}
                >
                  <div className="mb-1.5 px-3 py-1 rounded-xl bg-slate-900/90 text-white text-xs font-bold shadow-md whitespace-nowrap animate-in fade-in duration-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E44220] animate-pulse" />
                    <span>{tempStreet || 'Al-Basrah St.'}</span>
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#E44220] text-white flex items-center justify-center shadow-lg ring-4 ring-white animate-pulse">
                      <div className="w-3.5 h-3.5 rounded-full bg-white" />
                    </div>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#E44220] mx-auto -mt-0.5" />
                  </div>
                  <div className="w-5 h-2 bg-slate-900/35 rounded-full blur-[1px] mt-0.5" />
                </div>

                {/* Top Hint Badge */}
                <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-xs border border-slate-200/80 text-slate-800 text-xs font-semibold pointer-events-none">
                  📍 Ketuk peta untuk drop pin
                </div>
              </div>

              {/* Bottom Confirmation Card */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF0EB] text-[#E44220] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 fill-[#E44220] stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                      Titik Lokasi Terpilih
                    </span>
                    <span className="text-sm font-bold text-slate-900 truncate block">
                      {tempStreet || 'Al-Basrah St.'}
                    </span>
                    <span className="text-xs text-slate-500 block truncate">
                      Irbid, Yordania
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPinpoint}
                  className="w-full py-3.5 rounded-2xl bg-[#E44220] hover:bg-[#d03a1c] text-white font-black text-sm shadow-md shadow-orange-600/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Pilih Lokasi Ini</span>
                </button>
              </div>
            </div>
          ) : isFormMode ? (
            /* ======================================================= */
            /* EXACT FORM LAYOUT WITH BRAND PALETTE & INTERACTIVE MAP  */
            /* ======================================================= */
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
              {/* 1. CLEAN VISUAL MAP PREVIEW (Click to open large map pinpoint screen) */}
              <div
                onClick={handleOpenPinpointModal}
                className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs group cursor-pointer select-none transition-all hover:border-slate-300 active:scale-[0.99]"
                title="Ketuk untuk buka peta lebih besar dan atur titik lokasi"
              >
                {/* Visual Map Canvas without any logos, satellite, pan controls, or "open in maps" */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                  <iframe
                    title="Visual Map Irbid"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      street.trim()
                        ? `${street.trim()}, Irbid, Jordan`
                        : 'Al-Basrah St, Irbid, Jordan'
                    )}&z=16&ie=UTF8&iwloc=&output=embed`}
                    className="w-[calc(100%+160px)] h-[calc(100%+150px)] -ml-[80px] -mt-[72px] border-0 select-none pointer-events-none"
                    loading="lazy"
                  />
                </div>

                {/* Visual Drop Pin Indicator */}
                <div
                  style={{ left: `${pinPosition.x}%`, top: `${pinPosition.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none z-10 drop-shadow-md"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-[#E44220] text-white flex items-center justify-center shadow-md ring-3 ring-white">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#E44220] mx-auto -mt-0.5" />
                  </div>
                  <div className="w-3.5 h-1.5 bg-slate-900/35 rounded-full blur-[1px] mt-0.5" />
                </div>
              </div>

              {/* 2. KOTAK AREA (Dibuat berbayang seperti kotak input lain; bila terisi Hijazi/Syimali otomatis tulisan Area hilang) */}
              <div className="relative" ref={areaDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between text-left text-sm font-semibold transition-all shadow-2xs cursor-pointer select-none focus:outline-hidden focus:border-[#E44220] focus:ring-2 focus:ring-[#E44220]/20 active:scale-[0.99]"
                  aria-haspopup="listbox"
                  aria-expanded={isAreaDropdownOpen}
                  title="Pilih area"
                >
                  {/* Kalau sudah terisi "Hijazi" atau "Syimali" otomatis tulisan "Area" hilang; kalau kosong berbayang abu-abu "Area" */}
                  <span className={area ? 'text-slate-900 font-semibold' : 'text-slate-400 font-medium'}>
                    {area || 'Area'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 stroke-[2.5] transition-transform duration-200 ${
                      isAreaDropdownOpen ? 'rotate-180 text-slate-700' : ''
                    }`}
                  />
                </button>

                {/* Area Dropdown Menu with 2 options: Hijazi & Syimali */}
                {isAreaDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    {(['Hijazi', 'Syimali'] as const).map((opt) => {
                      const isChosen = area === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setArea(opt);
                            setIsAreaDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                            isChosen
                              ? 'bg-[#FFF0EB] text-[#E44220]'
                              : 'text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <span>{opt}</span>
                          {isChosen && <Check className="w-4 h-4 stroke-[2.5] text-[#E44220]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. INPUT FORM FIELDS (IN EXACT TOP-TO-BOTTOM ORDER AS REQUESTED) */}
              <div className="space-y-3 pt-1">
                {/* 1. Nama jalan (tanpa tulisan contoh:....) */}
                <div>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Nama jalan"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#E44220] focus:ring-2 focus:ring-[#E44220]/20 transition-all shadow-2xs"
                  />
                </div>

                {/* 2. Nama bangunan (tanpa tulisan ... gedung ... contoh:...) */}
                <div>
                  <input
                    type="text"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    placeholder="Nama bangunan"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#E44220] focus:ring-2 focus:ring-[#E44220]/20 transition-all shadow-2xs"
                  />
                </div>

                {/* 3. No. Unit / Rumah bersebelahan dengan Lantai */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={unitNo}
                    onChange={(e) => setUnitNo(e.target.value)}
                    placeholder="No. Unit / Rumah"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#E44220] focus:ring-2 focus:ring-[#E44220]/20 transition-all shadow-2xs"
                  />
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="Lantai"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#E44220] focus:ring-2 focus:ring-[#E44220]/20 transition-all shadow-2xs"
                  />
                </div>

                {/* 4. Kotak bendera dan No. WhatsApp */}
                <div className="relative" ref={countryDropdownRef}>
                  <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-1.5 focus-within:border-[#E44220] focus-within:ring-2 focus-within:ring-[#E44220]/20 shadow-2xs transition-all">
                    {/* Interactive Flag Selector Button */}
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="flex items-center gap-1.5 text-slate-800 pr-3 border-r border-slate-200 hover:bg-slate-50 py-1.5 px-1 rounded-lg transition-colors cursor-pointer select-none"
                      title="Pilih bendera negara WhatsApp"
                      aria-haspopup="listbox"
                      aria-expanded={isCountryDropdownOpen}
                    >
                      {renderFlag(selectedCountry)}
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 stroke-[2.5] transition-transform duration-200 ${
                          isCountryDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Phone Input with Placeholder "No. WhatsApp" */}
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="No. WhatsApp"
                      className="flex-1 pl-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-hidden"
                    />
                  </div>

                  {/* 3 Countries Interactive Dropdown Menu */}
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Pilih Negara WhatsApp
                      </div>
                      {COUNTRIES.map((country) => {
                        const isChosen = country.code === selectedCountry;
                        return (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleSelectCountry(country)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              isChosen
                                ? 'bg-[#FFF0EB] text-[#E44220]'
                                : 'text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {renderFlag(country.code)}
                              <span>{country.name}</span>
                            </div>
                            <span
                              className={`text-[11px] font-semibold ${
                                isChosen ? 'text-[#E44220]' : 'text-slate-400'
                              }`}
                            >
                              {country.dialCode}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 5. Petunjuk arah tambahan (opsional) */}
                <div>
                  <input
                    type="text"
                    value={additionalDirections}
                    onChange={(e) => setAdditionalDirections(e.target.value)}
                    placeholder="Petunjuk arah tambahan (opsional)"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#E44220] focus:ring-2 focus:ring-[#E44220]/20 transition-all shadow-2xs"
                  />
                </div>

                {/* 6. Label alamat (opsional) */}
                <div>
                  <input
                    type="text"
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                    placeholder="Label alamat (opsional)"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#E44220] focus:ring-2 focus:ring-[#E44220]/20 transition-all shadow-2xs"
                  />
                </div>

                {/* 7. Box tipe alamat: Hanya gambar icon Rumah, Apartemen bertingkat, dan Kantor (tanpa teks) */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setAddressType('house')}
                    title="Rumah"
                    aria-label="Rumah"
                    className={`flex items-center justify-center h-12 rounded-2xl transition-all cursor-pointer select-none active:scale-95 ${
                      addressType === 'house'
                        ? 'bg-[#E44220] text-white border-2 border-[#E44220] shadow-md shadow-orange-600/20'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Home className="w-5.5 h-5.5 stroke-[2.2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddressType('apartment')}
                    title="Apartemen"
                    aria-label="Apartemen"
                    className={`flex items-center justify-center h-12 rounded-2xl transition-all cursor-pointer select-none active:scale-95 ${
                      addressType === 'apartment'
                        ? 'bg-[#E44220] text-white border-2 border-[#E44220] shadow-md shadow-orange-600/20'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <ApartmentIcon className="w-5.5 h-5.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddressType('office')}
                    title="Kantor"
                    aria-label="Kantor"
                    className={`flex items-center justify-center h-12 rounded-2xl transition-all cursor-pointer select-none active:scale-95 ${
                      addressType === 'office'
                        ? 'bg-[#E44220] text-white border-2 border-[#E44220] shadow-md shadow-orange-600/20'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Briefcase className="w-5.5 h-5.5 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* 4. BOTTOM ACTIONS WITH BRAND ORANGE PALETTE */}
              <div className="pt-2 pb-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-full sm:rounded-2xl bg-[#E44220] hover:bg-[#d03a1c] text-white font-black text-base shadow-lg shadow-orange-600/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Simpan alamat</span>
                </button>

                {/* Hapus Alamat Ini (Fully functional with inline confirmation) */}
                {viewMode === 'edit' && editingAddress && onDeleteAddress && (
                  <div>
                    {showDeleteConfirm ? (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col gap-2.5 animate-in fade-in duration-200">
                        <p className="text-xs font-bold text-rose-800 text-center">
                          Yakin ingin menghapus alamat "{editingAddress.label}"?
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-2.5 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteAddress(editingAddress.id);
                              setShowDeleteConfirm(false);
                              handleBackToList();
                            }}
                            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                          >
                            Ya, Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus alamat ini</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </form>
          ) : (
            /* ======================================================= */
            /* ADDRESS LIST VIEW (Select & Edit options)                */
            /* ======================================================= */
            <div className="p-5 space-y-3">
              {addresses.map((addr) => {
                const isSelected = addr.id === currentAddressId;
                return (
                  <div
                    key={addr.id}
                    onClick={() => {
                      onSelectAddress(addr);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#E44220] bg-[#FFF0EB]/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#E44220] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {addr.type === 'office' ||
                        addr.label.toLowerCase().includes('kantor') ? (
                          <Briefcase className="w-5 h-5" />
                        ) : addr.type === 'apartment' ||
                          addr.label.toLowerCase().includes('apartemen') ? (
                          <ApartmentIcon className="w-5 h-5" />
                        ) : (
                          <Home className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {addr.label}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 mt-1 line-clamp-2">
                          {addr.address ? (
                            addr.address
                          ) : (
                            <span className="text-slate-400 font-normal italic">
                              Belum ada alamat diatur
                            </span>
                          )}
                        </p>
                        {addr.detail ? (
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {addr.detail}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Action: Edit Icon Button + Checkmark */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(addr);
                        }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-[#E44220] bg-slate-100 hover:bg-[#FFF0EB] border border-slate-200/80 hover:border-orange-200 active:scale-95 transition-all cursor-pointer shadow-2xs"
                        aria-label={`Edit ${addr.label}`}
                        title="Edit alamat ini"
                      >
                        <Pencil className="w-4 h-4 stroke-[2.2]" />
                      </button>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#E44220] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Address Button */}
              <button
                type="button"
                onClick={handleStartAdd}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-300 text-[#E44220] hover:bg-[#FFF0EB]/40 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tambah Alamat Baru</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
