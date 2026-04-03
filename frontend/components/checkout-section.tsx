"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSafeClerkAuth } from "@/lib/clerk-safe";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { AddressForm } from "@/components/forms/AddressForm";
import { FormInput } from "@/components/forms/FormInput";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { PageHero } from "@/components/page-hero";
import { PageLoadingState } from "@/components/loading-state";
import { SectionHeader } from "@/components/section-header";
import { SummaryPanel } from "@/components/summary-panel";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { createCheckout } from "@/lib/api";
import type { AddressFormData } from "@/lib/validation";

type ShippingMethod = "standard" | "priority" | "freight";
type PaymentMethod = "card" | "net-30" | "wire";

/** Format cents to USD display string */
function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function CheckoutSection() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { getToken } = useSafeClerkAuth();
  const {
    guestSessionId,
    initializeGuest,
    items,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [contactName, setContactName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("net-30");
  const [address, setAddress] = useState<Partial<AddressFormData>>({ country: "US" });
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill from Clerk user
  useEffect(() => {
    initializeGuest();
    if (user) {
      if (user.name) setContactName(user.name);
      if (user.email) setEmail(user.email);
      if (user.company) setCompany(user.company);
    }
  }, [initializeGuest, user]);

  // Prices are in CENTS throughout
  const subtotalCents = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Shipping in cents
  const shippingCents = useMemo(() => {
    if (shippingMethod === "priority") return 3500;
    if (shippingMethod === "freight") return subtotalCents > 50000 ? 0 : 8500;
    return subtotalCents > 50000 ? 0 : 1800;
  }, [shippingMethod, subtotalCents]);

  const taxCents = useMemo(() => Math.round(subtotalCents * 0.0725), [subtotalCents]);
  const totalCents = subtotalCents + shippingCents + taxCents;

  const addressComplete =
    !!address.street && !!address.city && !!address.state && !!address.zipCode && !!address.country;

  const readyToSubmit =
    items.length > 0 &&
    contactName.trim().length > 0 &&
    company.trim().length > 0 &&
    email.trim().length > 0 &&
    addressComplete;

  const identityText = isLoggedIn
    ? user?.name ?? "Signed in buyer"
    : guestSessionId
      ? `Guest session ${guestSessionId}`
      : "Guest session initializing";

  const handleSubmit = async () => {
    if (!readyToSubmit) {
      setSubmissionError(
        "Fill the required contact and shipping fields before placing the order."
      );
      return;
    }

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      let token: string | null = null;

      if (isLoggedIn) {
        token = await getToken();
      }

      // For guest checkout we pass the email; backend creates/reuses a guest User
      const result = await createCheckout(
        token,
        isLoggedIn ? undefined : email
      );

      if (!result) {
        throw new Error("No response from checkout service");
      }

      clearCart();

      // Redirect to success page — pass orderId and guestCustomId if present
      const params = new URLSearchParams({ order: result.orderId });
      if (result.guestCustomId) params.set("guest", result.guestCustomId);

      router.push(`/checkout/success?${params.toString()}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSubmissionError(message);
      setIsSubmitting(false);
    }
  };

  const heroActions = (
    <>
      <Link href="/inventory" className="btn-secondary">
        Back to explorer
      </Link>
      <Link href="/quote" className="btn-primary">
        Quote instead
      </Link>
    </>
  );

  if (isSubmitting) {
    return (
      <section className="pt-24 pb-20">
        <PageHero
          eyebrow="Checkout"
          title={<>LOCK IN THE <span className="text-ct-accent">ORDER</span></>}
          description="Submitting the wholesale order and preparing the confirmation flow."
          actions={heroActions}
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <PageLoadingState />
        </div>
      </section>
    );
  }

  return (
    <section className="pt-24 pb-20">
      <PageHero
        eyebrow="Checkout"
        title={<>LOCK IN THE <span className="text-ct-accent">ORDER</span></>}
        description="Review quantities, capture shipping details, and confirm a clean order without leaving the storefront flow."
        actions={heroActions}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {submissionError && (
          <div className="mb-8">
            <ErrorState
              title="Checkout failed"
              message={submissionError}
              onRetry={() => setSubmissionError(null)}
              retryLabel="Fix details"
              secondaryAction={
                <Link href="/support" className="btn-secondary">Contact support</Link>
              }
            />
          </div>
        )}

        {items.length === 0 && (
          <div className="mb-8">
            <EmptyState
              title="Your cart is empty."
              description="Add compatible parts from the inventory explorer before placing a wholesale order."
              icon={<ShoppingCart className="size-8" />}
              actions={
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/inventory" className="btn-primary">Return to Explorer</Link>
                  <Link href="/quote" className="btn-secondary">Build a Quote</Link>
                </div>
              }
            />
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT — cart review + contact details */}
          <div className="space-y-6">
            <div className="dashboard-card p-6">
              <SectionHeader
                eyebrow="Cart review"
                title={`${itemCount} unit${itemCount === 1 ? "" : "s"} in the order`}
                description="MOQ is enforced at 5 units minimum. Quantities can be adjusted before submission."
              />

              <div className="mt-6 space-y-4">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div
                      key={item.skuId}
                      className="rounded-2xl border border-white/10 bg-ct-bg-secondary/40 p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 rounded-lg border border-white/10 object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ct-text">{item.name}</p>
                            <p className="mt-1 font-mono text-xs text-ct-text-secondary">{item.skuId}</p>
                            <p className="mt-2 text-xs text-ct-text-secondary">MOQ {item.moq} · Wholesale part</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.skuId, Math.max(item.quantity - 1, item.moq))}
                            disabled={item.quantity <= item.moq}
                            className="h-9 w-9 rounded-md border border-white/10 text-ct-text-secondary disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Decrease ${item.name}`}
                          >−</button>
                          <span className="w-16 text-center font-mono text-sm text-ct-text">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.skuId, item.quantity + 1)}
                            className="h-9 w-9 rounded-md border border-white/10 text-ct-text-secondary"
                            aria-label={`Increase ${item.name}`}
                          >+</button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.skuId)}
                            className="h-9 w-9 rounded-md border border-white/10 text-ct-text-secondary"
                            aria-label={`Remove ${item.name}`}
                          >×</button>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <span className="text-sm text-ct-text-secondary">
                          {item.price === 0 ? "Contact for Price" : `${formatCurrency(item.price)} each`}
                        </span>
                        <span className="text-lg font-semibold text-ct-accent">
                          {item.price === 0 ? "—" : formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-ct-bg-secondary/30 p-6 text-center text-sm text-ct-text-secondary">
                    No line items yet. Add parts from the inventory explorer to stage the order.
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-card p-6">
              <SectionHeader
                eyebrow="Shipping details"
                title="Contact and delivery"
                description="Guest buyers can submit the form below. Signed-in accounts are pre-filled from your profile."
              />

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <FormInput
                  id="contactName"
                  label="Contact name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your name"
                  required
                />
                <FormInput
                  id="company"
                  label="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name"
                  required
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormInput
                  id="email"
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
                <FormInput
                  id="poNumber"
                  label="PO number"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="mt-4">
                <AddressForm
                  values={address}
                  onAddressChange={(patch) => setAddress((cur) => ({ ...cur, ...patch }))}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — summary + order method */}
          <aside className="space-y-6">
            <SummaryPanel
              title="Checkout identity"
              description="Technical session state and order method live side by side for quick review."
              items={[
                {
                  label: "Identity",
                  value: identityText,
                  tone: "accent",
                },
                {
                  label: "Mode",
                  value: isLoggedIn ? "Signed in" : "Guest checkout",
                  helper: isLoggedIn
                    ? "Order history will attach to the active account."
                    : "Guest session persists locally. Create an account after checkout to claim your order history.",
                },
              ]}
              footerLabel="Session ID"
              footerValue={guestSessionId ?? "initializing"}
              footerNote="Displayed in IBM Plex Mono — your unique session reference."
            />

            <div className="dashboard-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-ct-accent" />
                <h2 className="font-semibold text-ct-text">Order method</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-ct-text-secondary mb-2">Shipping speed</label>
                  <select
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
                    className="input-dark"
                  >
                    <option value="standard">Standard — {formatCurrency(1800)} (free over $500)</option>
                    <option value="priority">Priority — {formatCurrency(3500)}</option>
                    <option value="freight">Freight — {formatCurrency(8500)} (free over $500)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-ct-text-secondary mb-2">Payment terms</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="input-dark"
                  >
                    <option value="net-30">Net 30</option>
                    <option value="card">Card</option>
                    <option value="wire">Wire transfer</option>
                  </select>
                </div>
              </div>
            </div>

            <SummaryPanel
              title="Order summary"
              description="Wholesale totals update in real time."
              items={[
                { label: "Subtotal", value: formatCurrency(subtotalCents), tone: "accent" },
                { label: "Shipping", value: shippingCents === 0 ? "Free" : formatCurrency(shippingCents) },
                { label: "Tax (7.25%)", value: formatCurrency(taxCents) },
                { label: "Items", value: String(itemCount) },
              ]}
              footerLabel="Estimated total"
              footerValue={formatCurrency(totalCents)}
              footerNote="Final pricing confirmed on invoice."
              action={
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!readyToSubmit || isSubmitting}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting…" : "Place Wholesale Order"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              }
            />

            <div className="flex items-center gap-2 text-xs text-ct-text-secondary">
              <ShieldCheck className="h-4 w-4 text-ct-accent flex-shrink-0" />
              <span>Orders are reviewed by the CellTech team before fulfillment.</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
