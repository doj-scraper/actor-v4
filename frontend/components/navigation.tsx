"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Menu,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { CartBadge } from "@/components/cart-badge";
import { CartDrawer } from "@/components/cart-drawer";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const { items } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isCartOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCartOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isCartOpen]);

  useEffect(() => {
    const handleCartOpen = () => setIsCartOpen(true);
    window.addEventListener("ct-cart:item-added", handleCartOpen as EventListener);
    return () => window.removeEventListener("ct-cart:item-added", handleCartOpen as EventListener);
  }, []);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-ct-bg/90 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-ct-accent flex items-center justify-center">
                <span className="text-ct-bg font-bold text-sm">CT</span>
              </div>
              <span className="font-display font-bold text-ct-text tracking-wide">
                CellTech
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/catalog" className="nav-link">
                Catalog
              </Link>
              <Link href="/inventory" className="nav-link">
                Inventory
              </Link>
              <Link href="/quote" className="nav-link">
                Quote
              </Link>
              <Link href="/checkout" className="nav-link">
                Checkout
              </Link>
              <Link href="/support" className="nav-link">
                Support
              </Link>
              <Link href="/dashboard" className="nav-link">
                Account
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button
                className="flex items-center gap-2 text-sm text-ct-text-secondary hover:text-ct-text transition-colors"
                onClick={() => setIsCartOpen(true)}
                type="button"
              >
                <ShoppingCart className="w-4 h-4" />
                <CartBadge count={cartCount} showIcon={false} className="px-2 py-0.5" />
              </button>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-ct-text-secondary hover:text-ct-text transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{isLoggedIn ? user?.name ?? "Account" : "Sign in"}</span>
              </Link>
            </div>

            <button
              className="md:hidden text-ct-text"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-ct-bg/95 backdrop-blur-md border-t border-white/5">
            <div className="px-6 py-4 space-y-4">
              <Link
                href="/catalog"
                className="block w-full text-left nav-link py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Catalog
              </Link>
              <Link
                href="/inventory"
                className="block w-full text-left nav-link py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inventory
              </Link>
              <Link
                href="/quote"
                className="block w-full text-left nav-link py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Quote
              </Link>
              <Link
                href="/checkout"
                className="block w-full text-left nav-link py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Checkout
              </Link>
              <Link
                href="/support"
                className="block w-full text-left nav-link py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Support
              </Link>
              <Link
                href="/dashboard"
                className="block w-full text-left nav-link py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Account
              </Link>
              <div className="pt-4 border-t border-white/10 flex items-center gap-6">
                <button
                  className="flex items-center gap-2 text-sm text-ct-text-secondary"
                  onClick={() => {
                    setIsCartOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  type="button"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart</span>
                  <CartBadge count={cartCount} showIcon={false} className="px-2 py-0.5" />
                </button>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-ct-text-secondary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>{isLoggedIn ? user?.name ?? "Account" : "Sign in"}</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
