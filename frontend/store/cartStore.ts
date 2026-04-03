/**
 * Cart store — client-side Zustand with localStorage persistence.
 *
 * PRICE CONTRACT:
 *   item.price is stored in CENTS (Int) to match the backend.
 *   Divide by 100 at display time. wholesalePrice === 0 means "Contact for Price".
 *
 * FIELD CONTRACT:
 *   item.skuId matches Inventory.skuId (the Smart SKU primary key).
 *
 * MOQ (Minimum Order Quantity):
 *   Default MOQ is 5 units, enforced by normalizeQuantity().
 *   Per-item MOQ overrides are respected if > 5.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface CartItem {
  skuId: string;       // Smart SKU — matches backend Inventory.skuId
  name: string;        // partName snapshot
  price: number;       // wholesalePrice in CENTS. 0 = "Contact for Price"
  quantity: number;
  moq: number;         // minimum order quantity (default 5)
  image: string;
}

export interface CartState {
  guestSessionId: string | null;
  items: CartItem[];
  initializeGuest: () => string;
  addItem: (item: CartItem) => void;
  removeItem: (skuId: string) => void;
  updateQuantity: (skuId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number; // returns cents
  getTotalItems: () => number;
}

// ---------------------------------------------------------------------------
// Storage — SSR-safe with localStorage fallback to in-memory
// ---------------------------------------------------------------------------

const cartStorageState = (() => {
  const globalAny = globalThis as typeof globalThis & {
    __CELLTECH_CART_STORAGE__?: Record<string, string>;
  };
  if (!globalAny.__CELLTECH_CART_STORAGE__) {
    globalAny.__CELLTECH_CART_STORAGE__ = {};
  }
  return globalAny.__CELLTECH_CART_STORAGE__;
})();

const memoryStorage = {
  getItem: (name: string) => cartStorageState[name] ?? null,
  setItem: (name: string, value: string) => { cartStorageState[name] = value; },
  removeItem: (name: string) => { delete cartStorageState[name]; },
};

const persistentStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return memoryStorage.getItem(name);
    try { return window.localStorage.getItem(name); } catch { return memoryStorage.getItem(name); }
  },
  setItem: (name: string, value: string) => {
    if (typeof window === 'undefined') { memoryStorage.setItem(name, value); return; }
    try { window.localStorage.setItem(name, value); } catch { memoryStorage.setItem(name, value); }
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') { memoryStorage.removeItem(name); return; }
    try { window.localStorage.removeItem(name); } catch { memoryStorage.removeItem(name); }
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Guest session ID matches backend userid-gXXXXX format for visual consistency. */
const createGuestSessionId = () => {
  const sequence = Math.floor(Math.random() * 90000) + 10000;
  return `userid-g${sequence}`;
};

const DEFAULT_MOQ = 5;

const normalizeQuantity = (item: CartItem, quantity: number): number => {
  if (quantity <= 0) return 0;
  return Math.max(quantity, Math.max(item.moq, DEFAULT_MOQ));
};

const notifyCartAdded = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('ct-cart:item-added'));
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      guestSessionId: null,
      items: [],

      initializeGuest: () => {
        const existingId = get().guestSessionId;
        if (existingId) return existingId;
        const guestSessionId = createGuestSessionId();
        set({ guestSessionId });
        return guestSessionId;
      },

      addItem: (item: CartItem) =>
        set((state) => {
          const nextQuantity = normalizeQuantity(item, item.quantity);
          if (nextQuantity <= 0) return state;

          const guestSessionId = state.guestSessionId ?? createGuestSessionId();
          const existingItem = state.items.find((i) => i.skuId === item.skuId);

          notifyCartAdded();

          if (existingItem) {
            return {
              guestSessionId,
              items: state.items.map((i) =>
                i.skuId === item.skuId
                  ? {
                      ...i,
                      name: item.name,
                      price: item.price,
                      image: item.image,
                      moq: Math.max(i.moq, item.moq),
                      quantity: i.quantity + nextQuantity,
                    }
                  : i
              ),
            };
          }

          return {
            guestSessionId,
            items: [...state.items, { ...item, quantity: nextQuantity }],
          };
        }),

      removeItem: (skuId: string) =>
        set((state) => ({
          guestSessionId: state.guestSessionId,
          items: state.items.filter((i) => i.skuId !== skuId),
        })),

      updateQuantity: (skuId: string, quantity: number) =>
        set((state) => ({
          guestSessionId: state.guestSessionId,
          items: state.items
            .map((item) => {
              if (item.skuId !== skuId) return item;
              const nextQuantity = normalizeQuantity(item, quantity);
              return nextQuantity > 0 ? { ...item, quantity: nextQuantity } : null;
            })
            .filter((item): item is CartItem => item !== null),
        })),

      clearCart: () =>
        set((state) => ({ guestSessionId: state.guestSessionId, items: [] })),

      /** Returns total in CENTS */
      getTotalPrice: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: 'celltech-cart-store',
      storage: createJSONStorage(() => persistentStorage),
      partialize: (state) => ({
        guestSessionId: state.guestSessionId,
        items: state.items,
      }),
    }
  )
);
