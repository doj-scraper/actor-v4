import type { Metadata } from "next";
import { CheckoutSection } from "@/components/checkout-section";

export const metadata: Metadata = {
  title: "Checkout | CellTech Distributor",
  description: "Review your cart, capture shipping details, and place a wholesale order.",
};

export default function CheckoutPage() {
  return <CheckoutSection />;
}
