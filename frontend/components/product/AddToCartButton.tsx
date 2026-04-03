"use client";

import { useState } from "react";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";

const MIN_QTY = 5; // MOQ enforced both client and server

interface AddToCartButtonProps {
  skuId: string;
  partName: string;
  price: number;
  stock: number;
  category: string;
}

export function AddToCartButton({
  skuId,
  partName,
  price,
  stock,
  category,
}: AddToCartButtonProps) {
  const [qty, setQty] = useState(MIN_QTY);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const isOutOfStock = stock <= 0;
  const isContactForPrice = price <= 0;
  const isDisabled = isOutOfStock || isContactForPrice;
  const clampedMax = Math.max(MIN_QTY, stock);

  const decrement = () => setQty((q) => Math.max(MIN_QTY, q - 1));
  const increment = () => setQty((q) => Math.min(clampedMax, q + 1));

  const handleAdd = () => {
    if (isDisabled) return;
    addItem({
      skuId: skuId,
      name: partName,
      price,
      quantity: qty,
      moq: MIN_QTY,
      image: "/images/product_placeholder.jpg",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Quantity selector */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-ct-text-secondary uppercase tracking-widest">
          Quantity
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={decrement}
            disabled={qty <= MIN_QTY}
            className="w-8 h-8 rounded-lg border border-white/10 bg-ct-bg flex items-center justify-center text-ct-text-secondary hover:text-ct-text hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-sm text-ct-text w-8 text-center select-none">
            {qty}
          </span>

          <button
            onClick={increment}
            disabled={qty >= clampedMax}
            className="w-8 h-8 rounded-lg border border-white/10 bg-ct-bg flex items-center justify-center text-ct-text-secondary hover:text-ct-text hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="font-mono text-xs text-ct-text-secondary">
          Min. {MIN_QTY}
        </span>
      </div>

      {/* Subtotal hint */}
      {price > 0 && (
        <div className="flex items-center justify-between font-mono text-xs text-ct-text-secondary">
          <span>Subtotal</span>
          <span className="text-ct-text font-semibold">
            ${((price * qty) / 100).toFixed(2)}
          </span>
        </div>
      )}

      {/* CTA button */}
      <motion.button
        onClick={handleAdd}
        disabled={isDisabled}
        className={`
          relative w-full py-4 rounded-xl font-semibold text-sm transition-all duration-200
          flex items-center justify-center gap-2 overflow-hidden
          ${
            isDisabled
              ? "bg-ct-bg-secondary text-ct-text-secondary cursor-not-allowed border border-white/10"
              : "btn-primary"
          }
        `}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      >
        <AnimatePresence mode="wait">
          {added ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
        Added to Cart
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? "Out of Stock" : isContactForPrice ? "Contact for Price" : "Add to Cart"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
