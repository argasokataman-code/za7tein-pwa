export interface FoodItem {
  id: string;
  name: string;
  merchantName: string;
  merchantId: string;
  category: 'nasi' | 'mie' | 'minuman' | 'camilan';
  rating: number;
  timeEstimate: string;
  distance: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  spicyLevels?: string[];
  options?: {
    name: string;
    price: number;
  }[];
  isPopular?: boolean;
  isPromo?: boolean;
}

export interface Warung {
  id: string;
  name: string;
  tagline: string;
  category: string;
  distance: string;
  rating: number;
  reviewCount: number;
  promoText: string;
  image: string;
  ownerName: string;
  description: string;
  verified: boolean;
  openHours: string;
  address: string;
  menuItemIds: string[];
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  selectedSpicyLevel?: string;
  selectedOptions?: string[];
  notes?: string;
}

export interface Address {
  id: string;
  label: string;
  address: string;
  detail: string;
  isDefault: boolean;
  type?: 'apartment' | 'house' | 'office';
  area?: string;
  buildingName?: string;
  unitNo?: string;
  floor?: string;
  street?: string;
  phoneNumber?: string;
  additionalDirections?: string;
}

export interface Order {
  id: string;
  date: string;
  warungName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  status: 'dimasak' | 'diantar' | 'selesai' | 'dibatalkan';
  statusText: string;
  driverName?: string;
  driverPhone?: string;
  estimatedArrival?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'promo' | 'order' | 'info';
}
