"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SummaryPanel } from "@/components/summary-panel";
import { useCart } from "@/hooks/useCart";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** Formats cents to USD display string */
function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function getItemSku(item: { skuId?: string; sku?: string }) {
  return item.skuId ?? item.sku ?? "unknown-sku";
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    items,
    guestSessionId,
    initializeGuest,
    updateQuantity,
    removeItem,
  } = useCart();

  useEffect(() => {
    if (open) {
      initializeGuest();
    }
  }, [initializeGuest, open]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const sessionId = guestSessionId ?? "initializing...";

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close cart"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-ct-bg shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <p className="text-micro text-ct-text-secondary">Cart drawer</p>
            <h2 className="mt-1 text-xl font-semibold text-ct-text">
              {itemCount} unit{itemCount === 1 ? "" : "s"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-lg border border-white/10 text-ct-text-secondary transition-colors hover:border-white/20 hover:text-ct-text"
            aria-label="Close cart"
          >
            <X className="mx-auto h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              description="Add parts from the product pages or start a quote."
              icon={<ShoppingCart className="size-8" />}
              actions={
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/inventory" className="btn-primary" onClick={onClose}>
                    Return to Explorer
                  </Link>
                  <Link href="/quote" className="btn-secondary" onClick={onClose}>
                    Build a Quote
                  </Link>
                </div>
              }
            />
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const itemSku = getItemSku(item);

                return (
                  <div
                    key={itemSku}
                    className="rounded-2xl border border-white/10 bg-ct-bg-secondary/50 p-4"
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg border border-white/10 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ct-text">
                              {item.name}
                            </p>
                            <p className="mt-1 font-mono text-xs text-ct-text-secondary">
                              {itemSku}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(itemSku)}
                            className="text-ct-text-secondary transition-colors hover:text-ct-text"
                            aria-label={`Remove ${item.name}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemSku, Math.max(item.quantity - 1, item.moq))}
                              disabled={item.quantity <= item.moq}
                              className="h-8 w-8 rounded-md border border-white/10 text-ct-text-secondary transition-colors hover:text-ct-text disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label={`Decrease ${item.name}`}
                            >
                              <Minus className="mx-auto h-3.5 w-3.5" />
                            </button>
                            <span className="w-10 text-center font-mono text-sm text-ct-text">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemSku, item.quantity + 1)}
                              className="h-8 w-8 rounded-md border border-white/10 text-ct-text-secondary transition-colors hover:text-ct-text"
                              aria-label={`Increase ${item.name}`}
                            >
                              <Plus className="mx-auto h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-ct-accent">
                            {item.price === 0 ? "Contact for Price" : formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-micro text-ct-text-secondary">Session ID</span>
            <span className="font-mono text-micro text-ct-accent">{sessionId}</span>
          </div>

          {items.length > 0 ? (
            <SummaryPanel
              title="Cart summary"
              description="Wholesale totals update in real time."
              items={[
                {
                  label: "Subtotal",
                  value: formatCurrency(subtotal),
                  tone: "accent",
                },
                {
                  label: "Shipping",
                  value: "Calculated at checkout",
                  helper: "Freight and priority options are finalized on the checkout page.",
                },
                {
                  label: "Items",
                  value: String(itemCount),
                },
              ]}
              footerLabel="Estimated total"
              footerValue={formatCurrency(subtotal)}
              footerNote="Cart totals only include currently staged parts."
              action={
                <div className="flex flex-wrap gap-3">
                  <Link href="/checkout" className="btn-primary flex-1 text-center" onClick={onClose}>
                    Proceed to Checkout
                  </Link>
                  <Link href="/quote" className="btn-secondary" onClick={onClose}>
                    Build Quote
                  </Link>
                </div>
              }
            />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-ct-bg-secondary/40 p-4">
              <p className="text-sm text-ct-text-secondary">
                Your session is active. Add parts from the inventory explorer to populate the summary.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
