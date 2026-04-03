"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSafeClerkAuth } from "@/lib/clerk-safe";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Clock3,
  Package,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { fetchOrders, type Order } from "@/lib/api";

const quickActions = [
  { label: "Browse catalog", href: "/catalog" },
  { label: "Build a quote", href: "/quote" },
  { label: "Start checkout", href: "/checkout" },
  { label: "Open support", href: "/support" },
];

/** Format cents to USD display string */
function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function statusBadgeClass(status: Order["status"]): string {
  switch (status) {
    case "DELIVERED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "SHIPPED": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "CONFIRMED":
    case "PAID": return "bg-ct-accent/10 text-ct-accent border-ct-accent/20";
    case "CANCELLED":
    case "REFUNDED": return "bg-red-500/10 text-red-400 border-red-500/20";
    default: return "bg-white/5 text-ct-text-secondary border-white/10";
  }
}

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DashboardSection() {
  const { user, isLoggedIn } = useAuth();
  const { getToken } = useSafeClerkAuth();
  const { items, getTotalItems, getTotalPrice } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(false);

  const cartItems = getTotalItems();
  // Cart value is in cents — divide for display
  const cartValueCents = getTotalPrice();

  useEffect(() => {
    if (!isLoggedIn) return;

    const loadOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(false);
      try {
        const token = await getToken();
        if (!token) return;
        const { orders: fetched } = await fetchOrders(token, 1, 5);
        setOrders(fetched);
      } catch {
        setOrdersError(true);
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [isLoggedIn, getToken]);

  const initials = (user?.name || "CT")
    .split(" ")
    .map((p) => p.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <PageHero
          eyebrow="Account dashboard"
          title={<>YOUR ORDERING <span className="text-ct-accent">WORKBENCH</span></>}
          description="Track open orders, keep team buy lists organized, and move from quote to checkout without losing context."
          actions={
            <>
              <Link href="/catalog" className="btn-secondary">Browse catalog</Link>
              <Link href="/checkout" className="btn-primary">Checkout cart</Link>
            </>
          }
        />

        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT — profile card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="dashboard-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-micro text-ct-text-secondary mb-2">Profile</p>
                  <h2 className="text-xl font-semibold text-ct-text">
                    {isLoggedIn ? user?.name ?? "Signed in user" : "Guest account"}
                  </h2>
                  <p className="text-sm text-ct-text-secondary mt-2">
                    {isLoggedIn
                      ? user?.company || "Wholesale account"
                      : "Sign in to view your order history."}
                  </p>
                  {user?.email && (
                    <p className="text-xs font-mono text-ct-text-secondary mt-1">{user.email}</p>
                  )}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-ct-accent/10 border border-ct-accent/20 flex items-center justify-center text-ct-accent font-semibold">
                  {initials}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-ct-bg-secondary/50 p-4">
                  <p className="text-xs text-ct-text-secondary uppercase tracking-widest">Open cart</p>
                  <p className="mt-2 text-2xl font-semibold text-ct-text">{cartItems}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-ct-bg-secondary/50 p-4">
                  <p className="text-xs text-ct-text-secondary uppercase tracking-widest">Cart value</p>
                  <p className="mt-2 text-2xl font-semibold text-ct-text">
                    {formatCurrency(cartValueCents)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {!isLoggedIn && (
                  <Link href="/sign-in" className="btn-primary inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Sign in
                  </Link>
                )}
                <Link href="/support" className="btn-secondary inline-flex items-center gap-2">
                  Support <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="dashboard-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-ct-accent" />
                <h3 className="font-semibold text-ct-text">Account notes</h3>
              </div>
              <div className="space-y-4 text-sm text-ct-text-secondary">
                <div className="flex items-center gap-3">
                  <Clock3 className="w-4 h-4 text-ct-accent flex-shrink-0" />
                  <span>Quotes are reviewed the same business day.</span>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-ct-accent flex-shrink-0" />
                  <span>MOQ is 5 units per SKU — enforced at checkout.</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4 text-ct-accent flex-shrink-0" />
                  <span>Cart persists across sessions via local storage.</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — stats + orders */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="stat-card">
                <div className="flex items-center gap-2 text-ct-text-secondary text-xs uppercase tracking-widest">
                  <ShoppingCart className="w-4 h-4 text-ct-accent" />
                  Cart items
                </div>
                <p className="mt-3 text-3xl font-semibold text-ct-text">{cartItems}</p>
                <p className="mt-2 text-sm text-ct-text-secondary">
                  {items.length ? "Ready to convert to an order." : "Add parts to start a workflow."}
                </p>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-2 text-ct-text-secondary text-xs uppercase tracking-widest">
                  <BarChart3 className="w-4 h-4 text-ct-accent" />
                  Cart spend
                </div>
                <p className="mt-3 text-3xl font-semibold text-ct-text">{formatCurrency(cartValueCents)}</p>
                <p className="mt-2 text-sm text-ct-text-secondary">Live subtotal from the current cart.</p>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-2 text-ct-text-secondary text-xs uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-ct-accent" />
                  Service level
                </div>
                <p className="mt-3 text-3xl font-semibold text-ct-text">24h</p>
                <p className="mt-2 text-sm text-ct-text-secondary">Quote and support response target.</p>
              </div>
            </div>

            {/* Recent orders — real data */}
            <div className="dashboard-card p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-micro text-ct-text-secondary mb-2">Recent orders</p>
                  <h3 className="text-xl font-semibold text-ct-text">Order history</h3>
                </div>
                <Link href="/checkout" className="link-arrow text-sm text-ct-accent flex items-center gap-1 hover:text-ct-text transition-colors">
                  New order <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {!isLoggedIn ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-ct-text-secondary">
                  <p>Sign in to view your order history.</p>
                  <Link href="/sign-in" className="btn-primary inline-flex mt-4 items-center gap-2">
                    Sign in <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-ct-bg-secondary/40 p-4 animate-pulse">
                      <div className="h-4 w-32 rounded bg-white/10 mb-2" />
                      <div className="h-3 w-24 rounded bg-white/5" />
                    </div>
                  ))}
                </div>
              ) : ordersError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                  Could not load order history. Try refreshing.
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-ct-text-secondary">
                  No orders yet. Place your first wholesale order from the checkout page.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-white/10 bg-ct-bg-secondary/40 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-mono text-sm font-medium text-ct-text">{order.id}</p>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-ct-text-secondary mt-2">
                            {order.lines?.length ?? 0} line{order.lines?.length === 1 ? "" : "s"} · {relativeDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-ct-accent">
                            {formatCurrency(order.totalCents)}
                          </p>
                          <p className="text-xs text-ct-text-secondary">Wholesale total</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="dashboard-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-ct-accent" />
                <h3 className="font-semibold text-ct-text">Quick actions</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-ct-bg-secondary/40 px-4 py-3 hover:border-ct-accent/30 transition-colors"
                  >
                    <span className="text-sm text-ct-text">{action.label}</span>
                    <ArrowRight className="w-4 h-4 text-ct-accent" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
