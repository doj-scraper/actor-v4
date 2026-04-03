import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface QuoteProduct {
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  moq: number;
  moqIncrement: number;
  stock: number;
  stockStatus: StockStatus;
  image: string;
  brand: string;
}

export interface QuoteLineItem {
  id: string;
  product: QuoteProduct;
  quantity: number;
  notes: string;
}

export interface QuoteMetadata {
  contactName: string;
  company: string;
  email: string;
  currency: 'USD' | 'EUR' | 'GBP';
  deliveryTerms: 'EXW' | 'FOB' | 'CIF' | 'DDP';
}

export interface QuoteState {
  lineItems: QuoteLineItem[];
  metadata: QuoteMetadata;
  searchQuery: string;
  searchResults: QuoteProduct[];
  isSearching: boolean;

  // Actions
  addLineItem: (product: QuoteProduct) => void;
  removeLineItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  updateMetadata: (patch: Partial<QuoteMetadata>) => void;
  setSearchQuery: (q: string) => void;
  searchProducts: (q: string) => void;
  clearQuote: () => void;

  // Computed (derived helpers)
  getSubtotal: () => number;
  getTotalItems: () => number;
  hasValidationErrors: () => boolean;
}

// ─── Mock Product Catalogue ────────────────────────────────────────────────────

export const MOCK_PRODUCTS: QuoteProduct[] = [
  {
    sku: 'DSP-001',
    name: 'OLED Display Assembly – iPhone 14 Pro',
    category: 'Displays',
    unitPrice: 48.50,
    moq: 10,
    moqIncrement: 5,
    stock: 340,
    stockStatus: 'in_stock',
    image: '/images/product_screen.jpg',
    brand: 'OEM',
  },
  {
    sku: 'DSP-002',
    name: 'LCD Display Assembly – Samsung S22',
    category: 'Displays',
    unitPrice: 32.00,
    moq: 10,
    moqIncrement: 10,
    stock: 80,
    stockStatus: 'low_stock',
    image: '/images/product_screen.jpg',
    brand: 'OEM',
  },
  {
    sku: 'BAT-001',
    name: 'Li-Ion Battery – iPhone 13 (3227mAh)',
    category: 'Batteries',
    unitPrice: 11.75,
    moq: 20,
    moqIncrement: 10,
    stock: 1200,
    stockStatus: 'in_stock',
    image: '/images/product_battery.jpg',
    brand: 'OEM',
  },
  {
    sku: 'BAT-002',
    name: 'Li-Ion Battery – Samsung A54 (5000mAh)',
    category: 'Batteries',
    unitPrice: 9.50,
    moq: 20,
    moqIncrement: 20,
    stock: 0,
    stockStatus: 'out_of_stock',
    image: '/images/product_battery.jpg',
    brand: 'Compatible',
  },
  {
    sku: 'CAM-001',
    name: 'Rear Camera Module – iPhone 14',
    category: 'Cameras',
    unitPrice: 67.00,
    moq: 5,
    moqIncrement: 5,
    stock: 55,
    stockStatus: 'low_stock',
    image: '/images/product_camera.jpg',
    brand: 'OEM',
  },
  {
    sku: 'CAM-002',
    name: 'Front Camera – Samsung S23',
    category: 'Cameras',
    unitPrice: 24.00,
    moq: 10,
    moqIncrement: 5,
    stock: 200,
    stockStatus: 'in_stock',
    image: '/images/product_camera.jpg',
    brand: 'OEM',
  },
  {
    sku: 'CHG-001',
    name: 'Charging Port Assembly – iPhone 15',
    category: 'Charging',
    unitPrice: 8.25,
    moq: 25,
    moqIncrement: 25,
    stock: 600,
    stockStatus: 'in_stock',
    image: '/images/product_charging.jpg',
    brand: 'OEM',
  },
  {
    sku: 'CHG-002',
    name: 'Wireless Charging Coil – Pixel 7',
    category: 'Charging',
    unitPrice: 14.00,
    moq: 15,
    moqIncrement: 5,
    stock: 30,
    stockStatus: 'low_stock',
    image: '/images/product_charging.jpg',
    brand: 'Compatible',
  },
  {
    sku: 'PWR-001',
    name: 'Power Button Flex Cable – iPhone 12',
    category: 'Internal Parts',
    unitPrice: 3.80,
    moq: 50,
    moqIncrement: 50,
    stock: 2000,
    stockStatus: 'in_stock',
    image: '/images/product_power.jpg',
    brand: 'OEM',
  },
  {
    sku: 'SPK-001',
    name: 'Earpiece Speaker – iPhone 13 Pro',
    category: 'Audio',
    unitPrice: 6.50,
    moq: 20,
    moqIncrement: 10,
    stock: 450,
    stockStatus: 'in_stock',
    image: '/images/product_speaker.jpg',
    brand: 'OEM',
  },
];

// ─── Mock search handler ───────────────────────────────────────────────────────

function mockSearch(query: string): QuoteProduct[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
  ).slice(0, 6);
}

// ─── Default metadata ──────────────────────────────────────────────────────────

const DEFAULT_METADATA: QuoteMetadata = {
  contactName: '',
  company: '',
  email: '',
  currency: 'USD',
  deliveryTerms: 'EXW',
};

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      lineItems: [],
      metadata: DEFAULT_METADATA,
      searchQuery: '',
      searchResults: [],
      isSearching: false,

      addLineItem: (product) => {
        const state = get();
        const existing = state.lineItems.find((li) => li.product.sku === product.sku);
        if (existing) return; // already in quote

        const id = `${product.sku}-${Date.now()}`;
        set((s) => ({
          lineItems: [
            ...s.lineItems,
            { id, product, quantity: product.moq, notes: '' },
          ],
          searchQuery: '',
          searchResults: [],
        }));
      },

      removeLineItem: (id) =>
        set((s) => ({ lineItems: s.lineItems.filter((li) => li.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((s) => ({
          lineItems: s.lineItems.map((li) =>
            li.id === id ? { ...li, quantity } : li
          ),
        })),

      updateNotes: (id, notes) =>
        set((s) => ({
          lineItems: s.lineItems.map((li) =>
            li.id === id ? { ...li, notes } : li
          ),
        })),

      updateMetadata: (patch) =>
        set((s) => ({ metadata: { ...s.metadata, ...patch } })),

      setSearchQuery: (q) => set({ searchQuery: q }),

      searchProducts: (q) => {
        set({ isSearching: true, searchQuery: q });
        // Simulate async latency with mock data
        setTimeout(() => {
          set({ searchResults: mockSearch(q), isSearching: false });
        }, 180);
      },

      clearQuote: () =>
        set({ lineItems: [], metadata: DEFAULT_METADATA, searchQuery: '', searchResults: [] }),

      getSubtotal: () => {
        const { lineItems } = get();
        return lineItems.reduce(
          (sum, li) => sum + li.product.unitPrice * li.quantity,
          0
        );
      },

      getTotalItems: () => {
        const { lineItems } = get();
        return lineItems.reduce((sum, li) => sum + li.quantity, 0);
      },

      hasValidationErrors: () => {
        const { lineItems } = get();
        return lineItems.some(
          (li) =>
            li.quantity < li.product.moq ||
            li.quantity % li.product.moqIncrement !== 0 ||
            li.product.stockStatus === 'out_of_stock'
        );
      },
    }),
    {
      name: 'celltech-quote-store',
      // Only persist line items + metadata, not transient search state
      partialize: (state) => ({
        lineItems: state.lineItems,
        metadata: state.metadata,
      }),
    }
  )
);
