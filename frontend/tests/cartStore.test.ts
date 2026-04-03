import { beforeEach, describe, expect, it, vi } from "vitest";

const cartItem = {
  skuId: "SKU-001",
  name: "Display Assembly",
  price: 1250,
  quantity: 1,
  moq: 5,
  image: "/images/product_screen.jpg",
};

describe("cart store", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("persists guest session and cart items across reloads", async () => {
    const { useCartStore } = await import("@/store/cartStore");
    useCartStore.setState({ guestSessionId: "guest-session-abc123", items: [] });

    useCartStore.getState().addItem({ ...cartItem, quantity: 2 });

    const globalAny = globalThis as typeof globalThis & {
      __CELLTECH_CART_STORAGE__?: Record<string, string>;
    };
    expect(globalAny.__CELLTECH_CART_STORAGE__?.["celltech-cart-store"]).toContain(
      "guest-session-abc123"
    );

    vi.resetModules();
    const { useCartStore: reloadedStore } = await import("@/store/cartStore");

    expect(reloadedStore.getState().guestSessionId).toBe("guest-session-abc123");
    expect(reloadedStore.getState().items).toHaveLength(1);
    expect(reloadedStore.getState().items[0]).toMatchObject({
      skuId: "SKU-001",
      quantity: 5,
    });
  });

  it("enforces MOQ and merges repeated adds", async () => {
    const { useCartStore } = await import("@/store/cartStore");

    useCartStore.getState().addItem({ ...cartItem, quantity: 1 });
    expect(useCartStore.getState().items[0].quantity).toBe(5);

    useCartStore.getState().addItem({ ...cartItem, quantity: 2 });
    expect(useCartStore.getState().items[0].quantity).toBe(10);
  });

  it("updates and removes items while preserving totals", async () => {
    const { useCartStore } = await import("@/store/cartStore");

    useCartStore.getState().addItem({ ...cartItem, quantity: 6, price: 300 });
    useCartStore.getState().updateQuantity("SKU-001", 4);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
    expect(useCartStore.getState().getTotalItems()).toBe(5);
    expect(useCartStore.getState().getTotalPrice()).toBe(1500);

    useCartStore.getState().removeItem("SKU-001");
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("removes an item when quantity is updated to zero", async () => {
    const { useCartStore } = await import("@/store/cartStore");

    useCartStore.getState().addItem({ ...cartItem, quantity: 5 });
    useCartStore.getState().updateQuantity("SKU-001", 0);

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
