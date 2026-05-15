import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type CartItem,
  type Order,
  type OrderStatus,
  SEED_ORDERS,
  RESTAURANT,
} from "@/lib/mock-data";

export type Mode = "entrega" | "recolha" | "mesa";

type AppState = {
  // user
  name: string;
  phone: string;
  credits: number;
  hasOnboarded: boolean;

  // session
  mode: Mode;
  table: number | null;
  address: string;
  scheduledTime: string | null;
  restaurantOpen: boolean;

  // cart
  cart: CartItem[];

  // orders (shared by client + admin + kds)
  orders: Order[];
  lastOrderId: string | null;

  // actions
  setMode: (m: Mode) => void;
  setTable: (t: number | null) => void;
  setAddress: (a: string) => void;
  setSchedule: (s: string | null) => void;
  setOpen: (o: boolean) => void;
  setHasOnboarded: (v: boolean) => void;
  setUser: (name: string, phone: string) => void;

  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;

  placeOrder: (extra: Partial<Order>) => string;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  toggleProductAvailable: (productId: string) => void;
  unavailableProducts: string[];
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      name: "Convidado",
      phone: "",
      credits: 2.4,
      hasOnboarded: false,
      mode: "entrega",
      table: null,
      address: "Av. da Liberdade, 144 · 4ºD",
      scheduledTime: null,
      restaurantOpen: true,
      cart: [],
      orders: SEED_ORDERS,
      lastOrderId: null,
      unavailableProducts: ["p4"],

      setMode: (m) => set({ mode: m }),
      setTable: (t) => set({ table: t, mode: t ? "mesa" : get().mode }),
      setAddress: (a) => set({ address: a }),
      setSchedule: (s) => set({ scheduledTime: s }),
      setOpen: (o) => set({ restaurantOpen: o }),
      setHasOnboarded: (v) => set({ hasOnboarded: v }),
      setUser: (name, phone) => set({ name, phone }),

      addToCart: (item) => {
        const id = `ci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set({ cart: [...get().cart, { ...item, id }] });
      },
      removeFromCart: (id) =>
        set({ cart: get().cart.filter((i) => i.id !== id) }),
      updateQty: (id, delta) =>
        set({
          cart: get()
            .cart.map((i) =>
              i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
            ),
        }),
      clearCart: () => set({ cart: [] }),

      placeOrder: (extra) => {
        const cart = get().cart;
        const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
        const fee = get().mode === "entrega" ? RESTAURANT.deliveryFee : 0;
        const order: Order = {
          id: `o-${Date.now()}`,
          shortCode:
            String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
            Math.floor(Math.random() * 99)
              .toString()
              .padStart(2, "0"),
          mode: get().mode,
          table: get().table ?? undefined,
          customerName: get().name || "Convidado",
          customerPhone: get().phone || undefined,
          address: get().mode === "entrega" ? get().address : undefined,
          items: cart,
          total: subtotal + fee,
          createdAt: Date.now(),
          status: "novo",
          paymentMethod: "mbway",
          ...extra,
        };
        set({
          orders: [order, ...get().orders],
          lastOrderId: order.id,
          cart: [],
          credits: get().credits + Math.round(subtotal * 0.02 * 100) / 100,
        });
        return order.id;
      },
      updateOrderStatus: (id, status) =>
        set({
          orders: get().orders.map((o) =>
            o.id === id ? { ...o, status } : o,
          ),
        }),
      toggleProductAvailable: (productId) => {
        const cur = get().unavailableProducts;
        set({
          unavailableProducts: cur.includes(productId)
            ? cur.filter((p) => p !== productId)
            : [...cur, productId],
        });
      },
    }),
    {
      name: "comaqui-app",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : (undefined as never),
      ),
      partialize: (s) => ({
        name: s.name,
        phone: s.phone,
        credits: s.credits,
        hasOnboarded: s.hasOnboarded,
        mode: s.mode,
        table: s.table,
        address: s.address,
        cart: s.cart,
        orders: s.orders,
        lastOrderId: s.lastOrderId,
        unavailableProducts: s.unavailableProducts,
        restaurantOpen: s.restaurantOpen,
      }),
    },
  ),
);
