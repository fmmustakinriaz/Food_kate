import { createContext, useContext, useMemo, useState, ReactNode, useCallback } from 'react';
import type { Food, CartLine } from '@/types';

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  add: (food: Food, qty?: number) => void;
  remove: (foodId: string) => void;
  setQty: (foodId: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const DELIVERY_FEE = 39;

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setOpen] = useState(false);

  const add = useCallback((food: Food, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.food.id === food.id);
      if (existing) {
        return prev.map((l) =>
          l.food.id === food.id ? { ...l, quantity: l.quantity + qty } : l,
        );
      }
      return [...prev, { food, quantity: qty }];
    });
  }, []);

  const remove = useCallback((foodId: string) => {
    setLines((prev) => prev.filter((l) => l.food.id !== foodId));
  }, []);

  const setQty = useCallback((foodId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.food.id !== foodId)
        : prev.map((l) => (l.food.id === foodId ? { ...l, quantity: qty } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { count, subtotal, total } = useMemo(() => {
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const subtotal = lines.reduce((s, l) => s + l.quantity * l.food.price, 0);
    const total = subtotal === 0 ? 0 : subtotal + DELIVERY_FEE;
    return { count, subtotal, total };
  }, [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count,
      subtotal,
      deliveryFee: lines.length > 0 ? DELIVERY_FEE : 0,
      total,
      add,
      remove,
      setQty,
      clear,
      isOpen,
      setOpen,
    }),
    [lines, count, subtotal, total, add, remove, setQty, clear, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
