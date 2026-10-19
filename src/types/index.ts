export type Role = 'customer' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  created_at: string;
}

export interface Food {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  rating: number;
  prep_minutes: number;
  is_available: boolean;
  created_at: string;
  // joined fields (optional)
  category?: Category;
}

export type OrderStatus = 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  food_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  delivery_address: string;
  contact_phone: string;
  notes: string;
  created_at: string;
  order_items?: OrderItem[];
  profiles?: { full_name: string };
}

export type PaymentMethod = 'cod' | 'card' | 'upi';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  created_at: string;
}

export interface CartLine {
  food: Food;
  quantity: number;
}
