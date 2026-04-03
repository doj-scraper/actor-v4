import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navigation } from "@/components/navigation";
import { CartDrawer } from "@/components/cart-drawer";

const updateQuantity = vi.fn();
const removeItem = vi.fn();
const initializeGuest = vi.fn();
let cartItems: Array<{
  sku: string;
  name: string;
  price: number;
  quantity: number;
  moq: number;
  image: string;
}> = [];

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { name: "Ada" }, isLoggedIn: true }),
}));

vi.mock("@/hooks/useCart", () => ({
  useCart: () => ({
    guestSessionId: "guest-session-abc123",
    initializeGuest,
    items: cartItems,
    updateQuantity,
    removeItem,
    getTotalPrice: () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    getTotalItems: () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
  }),
}));

describe("navigation cart drawer", () => {
  beforeEach(() => {
    updateQuantity.mockReset();
    removeItem.mockReset();
    initializeGuest.mockReset();
    cartItems = [];
  });

  it("shows the live badge count", () => {
    cartItems = [
      {
        sku: "SKU-1",
        name: "Display",
        price: 10,
        quantity: 3,
        moq: 5,
        image: "/x.jpg",
      },
    ];

    render(<Navigation />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders the empty cart drawer state", () => {
    render(<CartDrawer open={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByText("Session ID")).toBeInTheDocument();
  });

  it("wires cart update and remove actions in the drawer", async () => {
    cartItems = [
      {
        sku: "SKU-1",
        name: "Display",
        price: 10,
        quantity: 5,
        moq: 5,
        image: "/x.jpg",
      },
    ];

    render(<Navigation />);

    await userEvent.click(screen.getByText("5").closest("button")!);
    await userEvent.click(screen.getByRole("button", { name: /increase display/i }));
    await userEvent.click(screen.getByRole("button", { name: /remove display/i }));

    expect(updateQuantity).toHaveBeenCalledWith("SKU-1", 6);
    expect(removeItem).toHaveBeenCalledWith("SKU-1");
  });
});
