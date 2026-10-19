import { supabase } from '@/lib/supabase';
import type { Category, Food, Order, OrderItem, OrderStatus, PaymentMethod } from '@/types';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data as Category[];
}

export async function fetchFoods(categorySlug?: string, search?: string): Promise<Food[]> {
  let query = supabase
    .from('foods')
    .select('*, category:categories(*)')
    .order('rating', { ascending: false });
  if (search && search.trim()) {
    query = query.ilike('name', `%${search.trim()}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  let foods = data as Food[];
  if (categorySlug && categorySlug !== 'all') {
    foods = foods.filter((f) => f.category?.slug === categorySlug);
  }
  return foods;
}

export async function fetchFoodById(id: string): Promise<Food | null> {
  const { data, error } = await supabase
    .from('foods')
    .select('*, category:categories(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Food | null;
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), profiles:profiles(full_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export interface PlaceOrderInput {
  userId: string;
  items: { food: Food; quantity: number }[];
  deliveryAddress: string;
  contactPhone: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  total: number;
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  // 1. create the order row
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id: input.userId,
      total: input.total,
      status: 'pending' as OrderStatus,
      delivery_address: input.deliveryAddress,
      contact_phone: input.contactPhone,
      notes: input.notes ?? '',
    })
    .select()
    .single();
  if (orderErr) throw orderErr;

  // 2. insert order items
  const items: Omit<OrderItem, 'id'>[] = input.items.map((line) => ({
    order_id: order.id,
    food_id: line.food.id,
    name: line.food.name,
    price: line.food.price,
    quantity: line.quantity,
    image_url: line.food.image_url,
  }));
  const { error: itemsErr } = await supabase.from('order_items').insert(items);
  if (itemsErr) throw itemsErr;

  // 3. create a payment record
  const { error: payErr } = await supabase.from('payments').insert({
    order_id: order.id,
    method: input.paymentMethod,
    status: input.paymentMethod === 'cod' ? 'pending' : 'paid',
  });
  if (payErr) throw payErr;

  return order as Order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) throw error;
}

// ---------- admin food CRUD ----------
export async function createFood(food: Omit<Food, 'id' | 'created_at' | 'category'>): Promise<Food> {
  const { data, error } = await supabase.from('foods').insert(food).select().single();
  if (error) throw error;
  return data as Food;
}

export async function updateFood(id: string, patch: Partial<Food>): Promise<void> {
  const { error } = await supabase.from('foods').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteFood(id: string): Promise<void> {
  const { error } = await supabase.from('foods').delete().eq('id', id);
  if (error) throw error;
}

// ---------- dashboard stats ----------
export async function fetchDashboardStats() {
  const [foods, orders, users] = await Promise.all([
    supabase.from('foods').select('id, price'),
    supabase.from('orders').select('id, total, status, created_at'),
    supabase.from('profiles').select('id, role'),
  ]);
  if (foods.error) throw foods.error;
  if (orders.error) throw orders.error;
  if (users.error) throw users.error;

  const revenue = (orders.data as Order[]).reduce((s, o) => s + Number(o.total), 0);
  return {
    foodCount: foods.data.length,
    orderCount: orders.data.length,
    customerCount: (users.data as { role: string }[]).filter((u) => u.role === 'customer').length,
    revenue,
    orders: orders.data as Order[],
  };
}
