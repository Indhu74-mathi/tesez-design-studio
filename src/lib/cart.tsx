import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  productSlug: string;
  name: string;
  image: string;
  price: number;
  color: string;
  size: string;
  qty: number;
  customDesign?: string;
  basePrice?: number;
  customizationCharge?: number;
  finalPrice?: number;
};

type CartCtx = {
  items: CartItem[];
  add: (i: Omit<CartItem, "id" | "qty"> & { qty?: number }) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "tesez_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartCtx>(() => ({
    items,
    add: (i) => setItems((curr) => {
      const id = `${i.productSlug}|${i.color}|${i.size}`;
      const found = curr.find((x) => x.id === id);
      if (found) return curr.map((x) => x.id === id ? { ...x, qty: x.qty + (i.qty ?? 1) } : x);
      return [...curr, { ...i, id, qty: i.qty ?? 1 }];
    }),
    remove: (id) => setItems((c) => c.filter((x) => x.id !== id)),
    setQty: (id, qty) => setItems((c) => c.map((x) => x.id === id ? { ...x, qty: Math.max(1, qty) } : x)),
    clear: () => setItems([]),
    count: items.reduce((a, x) => a + x.qty, 0),
    subtotal: items.reduce((a, x) => a + x.qty * x.price, 0),
  }), [items]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart outside provider");
  return v;
}