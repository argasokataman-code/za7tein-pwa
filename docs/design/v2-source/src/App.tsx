import React, { useState, useMemo } from 'react';
import { ShoppingBag, ArrowRight, Smartphone, Monitor, CheckCircle, Sparkles, Tag, Bell } from 'lucide-react';
import { Header } from './components/Header';
import { HeroGreeting } from './components/HeroGreeting';
import { PromoBanner } from './components/PromoBanner';
import { CategoryList, CategoryType } from './components/CategoryList';
import { NearbyDishes, SubFilterType } from './components/NearbyDishes';
import { FavoriteWarungs } from './components/FavoriteWarungs';
import { BottomNav, NavTabType } from './components/BottomNav';
import { FoodDetailModal } from './components/FoodDetailModal';
import { WarungDetailModal } from './components/WarungDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { LiveTrackingModal } from './components/LiveTrackingModal';
import { AddressModal } from './components/AddressModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { FilterModal, FilterState } from './components/FilterModal';
import { OrdersTab } from './components/OrdersTab';
import { FavoritesTab } from './components/FavoritesTab';
import { ProfileTab } from './components/ProfileTab';
import { DynamicIslandStatusBar } from './components/DynamicIslandStatusBar';
import { CurrencyModal } from './components/CurrencyModal';

import {
  INITIAL_FOOD_ITEMS,
  WARUNGS,
  SAVED_ADDRESSES,
  INITIAL_ORDERS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import { FoodItem, Warung, CartItem, Address, Order, NotificationItem } from './types';

export default function App() {
  // Navigation & View
  const [activeTab, setActiveTab] = useState<NavTabType>('beranda');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('semua');
  const [activeSubFilter, setActiveSubFilter] = useState<SubFilterType>('paling_cocok');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<FilterState>({
    sortBy: 'relevan',
    onlyPromo: false,
    onlyFreeDelivery: false,
  });

  // Data states
  const [foodItems] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);
  const [warungs] = useState<Warung[]>(WARUNGS);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['food-1']);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponApplied, setCouponApplied] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>(SAVED_ADDRESSES);
  const [currentAddress, setCurrentAddress] = useState<Address>(SAVED_ADDRESSES[0]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // User Profile
  const [userName, setUserName] = useState('Umam Lombok');
  const [userPhone, setUserPhone] = useState('+962 7 9123 4567');

  // Modals & Sheets
  const [selectedDish, setSelectedDish] = useState<FoodItem | null>(null);
  const [selectedWarung, setSelectedWarung] = useState<Warung | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Toggle Favorite
  const handleToggleFavorite = (foodId: string) => {
    if (favoriteIds.includes(foodId)) {
      setFavoriteIds(favoriteIds.filter((id) => id !== foodId));
      showToast('Dihapus dari menu favorit');
    } else {
      setFavoriteIds([...favoriteIds, foodId]);
      showToast('Disimpan ke menu favorit ❤️');
    }
  };

  // Quick Add to Cart
  const handleQuickAdd = (dish: FoodItem) => {
    const existingIndex = cartItems.findIndex(
      (item) => item.foodItem.id === dish.id && !item.selectedOptions?.length && !item.notes
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          foodItem: dish,
          quantity: 1,
          selectedSpicyLevel: dish.spicyLevels?.[0],
        },
      ]);
    }
    showToast(`Ditambahkan: ${dish.name} ke keranjang 🛒`);
  };

  // Detailed Add to Cart
  const handleDetailedAddToCart = (
    dish: FoodItem,
    quantity: number,
    spicyLevel?: string,
    options?: string[],
    notes?: string
  ) => {
    setCartItems([
      ...cartItems,
      {
        foodItem: dish,
        quantity,
        selectedSpicyLevel: spicyLevel,
        selectedOptions: options,
        notes,
      },
    ]);
    showToast(`${quantity}x ${dish.name} masuk keranjang!`);
  };

  // Cart Qty updates
  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    const updated = [...cartItems];
    updated[index].quantity = newQty;
    setCartItems(updated);
  };

  const handleRemoveCartItem = (index: number) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    showToast('Menu dihapus dari keranjang');
  };

  // Coupon handling
  const handleApplyCoupon = (code?: string): boolean => {
    const entered = (code || 'SA7BARU').toUpperCase().trim();
    if (entered === 'SA7BARU' || entered === 'TETANGGA') {
      setCouponApplied(true);
      showToast('Kupon SA7BARU berhasil dipasang! Hemat 30% 🎉');
      return true;
    }
    return false;
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    showToast('Kupon promo dicopot');
  };

  // Checkout & Place Order
  const handlePlaceOrder = (paymentMethod: string, totalAmount: number) => {
    const newOrderId = `SA7-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: newOrderId,
      date: 'Baru saja',
      warungName: cartItems[0]?.foodItem.merchantName || 'Warung Bu Sari',
      items: cartItems.map((c) => ({
        name: c.foodItem.name,
        quantity: c.quantity,
        price: c.foodItem.price,
      })),
      totalPrice: totalAmount,
      status: 'dimasak',
      statusText: 'Warung sedang menyiapkan masakan hangatmu',
      driverName: 'Kang Asep Sudrajat',
      driverPhone: '0812-3456-7890',
      estimatedArrival: '15-20 menit lagi',
    };

    setOrders([newOrder, ...orders]);
    setCartItems([]);
    setIsCartOpen(false);
    setTrackingOrder(newOrder);
    showToast('Hore! Pesanan berhasil dibuat dan mulai dimasak!');
  };

  // Mark all notifs as read
  const handleMarkAllNotifsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    showToast('Semua notifikasi telah ditandai dibaca');
  };

  // Filtered Dishes Computation
  const filteredDishes = useMemo(() => {
    let result = [...foodItems];

    // Category
    if (selectedCategory !== 'semua') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.merchantName.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    // Sub-filter chips from screenshot
    if (activeSubFilter === 'rating_tinggi') {
      result = result.filter((item) => item.rating >= 4.8);
    } else if (activeSubFilter === 'ongkir_hemat') {
      result = result.filter((item) => item.price >= 25000);
    }

    // Advanced Modal Filter
    if (filterState.onlyPromo) {
      result = result.filter((item) => item.isPromo || !!item.originalPrice);
    }

    if (filterState.maxPrice) {
      result = result.filter((item) => item.price <= filterState.maxPrice!);
    }

    // Sorting
    if (filterState.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (filterState.sortBy === 'harga_rendah') {
      result.sort((a, b) => a.price - b.price);
    } else if (filterState.sortBy === 'jarak') {
      result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }

    return result;
  }, [foodItems, selectedCategory, searchQuery, activeSubFilter, filterState]);

  // Favorite Dishes
  const favoriteDishes = useMemo(() => {
    return foodItems.filter((f) => favoriteIds.includes(f.id));
  }, [foodItems, favoriteIds]);

  // Cart total & item count
  const cartItemCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => {
    const addPrice = (item.selectedOptions || []).reduce((sum, optName) => {
      const match = item.foodItem.options?.find((o) => o.name === optName);
      return sum + (match?.price || 0);
    }, 0);
    return acc + (item.foodItem.price + addPrice) * item.quantity;
  }, 0);

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'selesai' && o.status !== 'dibatalkan'
  ).length;

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-slate-800 flex flex-col items-center justify-start antialiased font-sans">
      {/* Top Floating Viewport Control Bar (Desktop Only) */}
      <div className="w-full max-w-xl hidden md:flex items-center justify-between px-6 py-2.5 text-xs text-slate-600 bg-white/70 backdrop-blur-md rounded-b-2xl shadow-xs border-b border-slate-200 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-[#172434]">sa7tein Interactive Preview</span>
        </div>

        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 rounded-full border border-slate-300 font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
        >
          {isPhoneFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5" />
              <span>Ganti ke Layar Lebar</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone 18 Pro (402×874)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container: Exact iPhone 18 Pro Viewport (402px x 874px) or Fluid on Phones */}
      <div
        className={`w-full bg-white transition-all duration-300 relative isolate flex flex-col ${
          isPhoneFrame
            ? 'w-full max-w-[402px] h-screen sm:h-[874px] my-0 sm:my-3 rounded-none sm:rounded-[56px] shadow-2xl overflow-hidden border-0 sm:border-[10px] sm:border-[#1a1a1e] sm:ring-1 sm:ring-slate-700/60'
            : 'max-w-2xl my-0 sm:my-3 rounded-none sm:rounded-3xl shadow-xl overflow-hidden border border-slate-200 min-h-[90vh]'
        }`}
      >
        {/* Dynamic Island Status Bar at top of iPhone 18 Pro - adapts color dynamically on scroll */}
        <div
          className={`shrink-0 transition-all duration-300 z-40 ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs'
              : 'bg-[#E44220]'
          }`}
        >
          <DynamicIslandStatusBar
            activeOrderCount={activeOrdersCount}
            isScrolled={isScrolled}
          />
        </div>

        {/* Dynamic Tab Body */}
        <main
          onScroll={(e) => {
            const top = e.currentTarget.scrollTop;
            if (top > 60 && !isScrolled) {
              setIsScrolled(true);
            } else if (top <= 60 && isScrolled) {
              setIsScrolled(false);
            }
          }}
          className="flex-1 overflow-y-auto no-scrollbar bg-white"
        >
          {/* Top Bar for non-home tabs */}
          {activeTab !== 'beranda' && (
            <div className="bg-[#E44220] text-white px-5 pt-3.5 pb-3.5 shadow-xs relative">
              <div className="relative z-10 flex items-center justify-between min-h-[36px]">
                <div>
                  <h1 className="text-lg font-black tracking-tight text-white">
                    {activeTab === 'pesanan' ? 'Pesanan Saya' : activeTab === 'notifikasi' ? 'Notifikasi' : 'Profil'}
                  </h1>
                  {activeTab !== 'akun' && (
                    <p className="text-[11px] text-white/80 font-medium">
                      {activeTab === 'pesanan' ? 'Lacak dan kelola pesananmu' : 'Pemberitahuan & promo terbaru'}
                    </p>
                  )}
                </div>
                {activeTab !== 'akun' && (
                  <span className="text-xs font-black tracking-tight text-white bg-white/20 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
                    {activeTab === 'pesanan' ? `${orders.length} Pesanan` : `${unreadNotifCount} Baru`}
                  </span>
                )}
              </div>
            </div>
          )}
          {activeTab === 'beranda' && (
            <div className={cartItemCount > 0 ? "pb-20" : "pb-1"}>
              {/* TOP 1/3 SECTION: Brand Orange Header #E44220 */}
              <div className="relative bg-[#E44220] text-white pt-0 pb-4 rounded-b-[32px] shadow-sm">
                <div className="relative z-10">
                  {/* Top Header with Address & Currency Converter Info */}
                  <Header
                    currentAddress={currentAddress}
                    onOpenAddressModal={() => setIsAddressModalOpen(true)}
                    onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
                  />

                  {/* Mau makan apa, Umam? Greeting & Search Bar */}
                  <HeroGreeting
                    userName={userName.split(' ')[0]}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onOpenFilter={() => setIsFilterModalOpen(true)}
                    activeFilterCount={
                      (filterState.sortBy !== 'relevan' ? 1 : 0) +
                      (filterState.onlyPromo ? 1 : 0) +
                      (filterState.maxPrice ? 1 : 0)
                    }
                  />
                </div>
              </div>

              {/* BOTTOM 2/3 SECTION: Crisp White Canvas */}
              <div className="relative bg-white pt-3 space-y-2">
                {/* Promo Banner: "Diskon 30% suapan pertama" */}
                <PromoBanner
                  couponApplied={couponApplied}
                  onApplyCoupon={() => handleApplyCoupon('SA7BARU')}
                  onDishClick={() => {
                    const nasiDish = foodItems.find((f) => f.id === 'food-1');
                    if (nasiDish) setSelectedDish(nasiDish);
                  }}
                />

                {/* Category Quick Filter (Semua, Nasi, Mie, Minuman, Camilan) */}
                <CategoryList
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => setSelectedCategory(cat)}
                />

                {/* "Pilihan di dekatmu" Section */}
                <NearbyDishes
                  dishes={filteredDishes}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectDish={(dish) => setSelectedDish(dish)}
                  onQuickAdd={handleQuickAdd}
                  activeSubFilter={activeSubFilter}
                  onSubFilterChange={(filter) => setActiveSubFilter(filter)}
                  onViewAll={() => {
                    setSelectedCategory('semua');
                    setActiveSubFilter('paling_cocok');
                    showToast('Menampilkan seluruh menu terdekat');
                  }}
                />

                {/* "Tetangga favorit" Section */}
                <FavoriteWarungs
                  warungs={warungs}
                  onSelectWarung={(warung) => setSelectedWarung(warung)}
                  onExploreAll={() => {
                    showToast('Daftar tetangga masak di area Dago & sekitarnya');
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'pesanan' && (
            <OrdersTab
              orders={orders}
              onTrackOrder={(order) => setTrackingOrder(order)}
              onReorder={(order) => {
                order.items.forEach((it) => {
                  const dish = foodItems.find((f) => f.name === it.name) || foodItems[0];
                  handleQuickAdd(dish);
                });
                setActiveTab('beranda');
                setIsCartOpen(true);
              }}
              onExploreFood={() => setActiveTab('beranda')}
            />
          )}

          {activeTab === 'notifikasi' && (
            <div className={`p-4 space-y-3 ${cartItemCount > 0 ? 'pb-20' : 'pb-4'}`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500">
                  {notifications.length} Pemberitahuan
                </span>
                <button
                  onClick={handleMarkAllNotifsRead}
                  className="text-xs font-bold text-[#E44220] hover:underline cursor-pointer"
                >
                  Tandai semua dibaca
                </button>
              </div>
              {notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'promo') {
                      handleApplyCoupon('SA7BARU');
                      setIsCartOpen(true);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    item.read
                      ? 'bg-white border-slate-200/80'
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
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'akun' && (
            <ProfileTab
              userName={userName}
              userPhone={userPhone}
              onUpdateProfile={(newName, newPhone) => {
                setUserName(newName);
                setUserPhone(newPhone);
              }}
              currentAddress={currentAddress}
              savedAddressCount={addresses.length}
              onOpenAddressModal={() => setIsAddressModalOpen(true)}
              onOpenCouponModal={() => setIsCartOpen(true)}
              couponApplied={couponApplied}
              onShowToast={showToast}
            />
          )}
        </main>

        {/* Floating Cart Quick Bar (when items are in cart) */}
        {cartItemCount > 0 && !isCartOpen && (
          <div className="absolute bottom-[68px] left-4 right-4 z-20 animate-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-[#172434] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between hover:bg-[#203144] active:scale-[0.98] transition-all cursor-pointer border border-slate-700/50"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-xl bg-[#E44222] flex items-center justify-center text-white">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-[#172434] text-[10px] font-black flex items-center justify-center">
                    {cartItemCount}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-200">
                    {cartItemCount} Menu Siap Diantar
                  </div>
                  <div className="text-sm font-black text-white">
                    Rp{cartSubtotal.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold bg-[#E44222] px-3.5 py-1.5 rounded-xl shadow-xs">
                <span>Lihat Keranjang</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </button>
          </div>
        )}

        {/* Fixed Bottom Navigation (4 Tabs: Beranda, Pesanan, Notifikasi, Akun) */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsScrolled(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          activeOrderCount={activeOrdersCount}
          unreadNotifCount={unreadNotifCount}
        />

        {/* Floating Micro Toast Message (Centered inside mobile screen) */}
        {toastMessage && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200 whitespace-nowrap pointer-events-none">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Food Detail Modal */}
        <FoodDetailModal
          dish={selectedDish}
          onClose={() => setSelectedDish(null)}
          onAddToCart={handleDetailedAddToCart}
          isFavorite={selectedDish ? favoriteIds.includes(selectedDish.id) : false}
          onToggleFavorite={handleToggleFavorite}
          onViewWarung={(merchantId) => {
            const warung = warungs.find((w) => w.id === merchantId);
            if (warung) setSelectedWarung(warung);
          }}
        />

        {/* Warung Profile & Menu Modal */}
        <WarungDetailModal
          warung={selectedWarung}
          onClose={() => setSelectedWarung(null)}
          dishes={foodItems}
          onSelectDish={(dish) => setSelectedDish(dish)}
          onQuickAdd={handleQuickAdd}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Checkout Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          couponApplied={couponApplied}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
          currentAddress={currentAddress}
          onPlaceOrder={handlePlaceOrder}
        />

        {/* Live Order Tracking Modal */}
        <LiveTrackingModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
          onOrderDelivered={(orderId) => {
            setOrders(
              orders.map((o) =>
                o.id === orderId
                  ? { ...o, status: 'selesai', statusText: 'Pesanan telah selesai dinikmati' }
                  : o
              )
            );
            showToast('Pesanan selesai diantar! Selamat menikmati masakan tetangga 🎉');
          }}
        />

        {/* Address Switcher Modal */}
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          addresses={addresses}
          currentAddressId={currentAddress.id}
          onSelectAddress={(addr) => {
            setCurrentAddress(addr);
            showToast(`Alamat diubah ke ${addr.label}`);
          }}
          onAddAddress={(newAddr) => {
            const created: Address = {
              ...newAddr,
              id: `addr-${Date.now()}`,
              isDefault: false,
            };
            setAddresses([...addresses, created]);
            setCurrentAddress(created);
            showToast(`Alamat baru "${created.label}" disimpan!`);
          }}
          onUpdateAddress={(updated) => {
            setAddresses(addresses.map((a) => (a.id === updated.id ? updated : a)));
            if (currentAddress.id === updated.id) {
              setCurrentAddress(updated);
            }
            showToast(`Alamat "${updated.label}" berhasil diperbarui!`);
          }}
          onDeleteAddress={(id) => {
            const filtered = addresses.filter((a) => a.id !== id);
            if (filtered.length === 0) {
              const fallback: Address = {
                id: `addr-${Date.now()}`,
                label: 'Rumah',
                address: '',
                detail: '',
                isDefault: true,
              };
              setAddresses([fallback]);
              setCurrentAddress(fallback);
            } else {
              setAddresses(filtered);
              if (currentAddress.id === id) {
                setCurrentAddress(filtered[0]);
              }
            }
            showToast('Alamat berhasil dihapus');
          }}
        />

        {/* Notification Drawer */}
        <NotificationDrawer
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotifsRead}
          onApplyPromoClick={() => {
            handleApplyCoupon('SA7BARU');
            setIsCartOpen(true);
          }}
        />

        {/* Food Filter Modal */}
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          currentFilter={filterState}
          onApplyFilter={(f) => {
            setFilterState(f);
            showToast('Filter makanan berhasil diterapkan');
          }}
          onResetFilter={() => {
            setFilterState({
              sortBy: 'relevan',
              onlyPromo: false,
              onlyFreeDelivery: false,
            });
            showToast('Filter dikembalikan ke awal');
          }}
        />

        {/* Currency Converter Modal (JOD ke IDR Google Currency) */}
        <CurrencyModal
          isOpen={isCurrencyModalOpen}
          onClose={() => setIsCurrencyModalOpen(false)}
        />
      </div>
    </div>
  );
}
