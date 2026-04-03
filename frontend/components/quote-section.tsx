"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  FileText,
  ListPlus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { useQuoteStore } from "@/store/quoteStore";
import { submitQuoteRequest } from "@/lib/api";

const suggestedTerms = ["Display", "Battery", "Camera", "Charging"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function QuoteSection() {
  const {
    lineItems,
    metadata,
    searchQuery,
    searchResults,
    isSearching,
    addLineItem,
    removeLineItem,
    updateQuantity,
    updateNotes,
    updateMetadata,
    searchProducts,
    setSearchQuery,
    clearQuote,
    getSubtotal,
    getTotalItems,
  } = useQuoteStore();
  const [message, setMessage] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  const readyToSubmit =
    lineItems.length > 0 &&
    metadata.email.trim().length > 0 &&
    metadata.company.trim().length > 0 &&
    metadata.contactName.trim().length > 0;

  const searchDisabled = !searchQuery.trim();

  const resultRows = useMemo(
    () =>
      searchResults.map((product) => ({
        ...product,
        alreadySelected: lineItems.some((item) => item.product.sku === product.sku),
      })),
    [lineItems, searchResults]
  );

  const handleSearch = () => {
    searchProducts(searchQuery.trim());
    setMessage(null);
  };

  const handleSuggestedSearch = (term: string) => {
    searchProducts(term);
    setMessage(null);
  };

  const handleQuantityChange = (id: string, nextValue: number, moq: number, increment: number) => {
    const normalized = Math.max(moq, Math.ceil(nextValue / increment) * increment);
    updateQuantity(id, normalized);
  };

  const handleDownloadCsv = () => {
    if (!lineItems.length) {
      setMessage("Add at least one line item before downloading a quote list.");
      return;
    }

    const rows = [
      ["SKU", "Name", "Category", "Quantity", "Unit Price", "Line Total", "Notes"],
      ...lineItems.map((item) => [
        item.product.sku,
        item.product.name,
        item.product.category,
        String(item.quantity),
        item.product.unitPrice.toFixed(2),
        (item.product.unitPrice * item.quantity).toFixed(2),
        item.notes.replaceAll(",", ";"),
      ]),
    ];

    const csv = rows.map((row) => row.map((value) => `"${value}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "celltech-quote-list.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("CSV quote list downloaded.");
  };

  const handleSubmit = async () => {
    if (!readyToSubmit) {
      setMessage("Fill in contact and company details before sending the quote.");
      return;
    }

    try {
      const items = lineItems.map((li) => ({
        skuId: li.product.sku,
        quantity: li.quantity,
        note: li.notes || undefined,
      }));

      const notesSummary = lineItems
        .map((li) => `${li.product.sku} x${li.quantity}${li.notes ? ` — ${li.notes}` : ""}`)
        .join("; ");

      const result = await submitQuoteRequest({
        email: metadata.email,
        company: metadata.company || undefined,
        contactName: metadata.contactName || undefined,
        notes: notesSummary || "Quote request submitted via web form.",
        items,
      });

      if (result) {
        setMessage(`Quote request ${result.quoteRequestId} submitted successfully.`);
        clearQuote();
      } else {
        setMessage("Quote submission failed. Please try again.");
      }
    } catch {
      setMessage("Quote submission failed. Please try again.");
    }
  };

  return (
    <section className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <PageHero
          eyebrow="Request quote"
          title={
            <>
              BUILD A <span className="text-ct-accent">WHOLESALE</span> REQUEST
            </>
          }
          description="Search parts, stage quantities, and send a clean quote list to the sales team. The form stays readable even with a large order."
          actions={
            <>
              <Link href="/catalog" className="btn-secondary">
                Browse catalog
              </Link>
              <Link href="/checkout" className="btn-primary">
                Go to checkout
              </Link>
            </>
          }
        />

        {message && (
          <div className="mb-8 rounded-2xl border border-ct-accent/20 bg-ct-accent/10 px-4 py-3 text-sm text-ct-accent">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="dashboard-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-ct-accent" />
                <h2 className="font-semibold text-ct-text">Search inventory</h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search SKU, part name, or category"
                  className="input-dark flex-1"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searchDisabled || isSearching}
                  className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? "Searching..." : "Search parts"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {suggestedTerms.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSuggestedSearch(term)}
                    className="filter-chip"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="dashboard-card p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-micro text-ct-text-secondary mb-2">Search results</p>
                  <h2 className="text-xl font-semibold text-ct-text">
                    Parts ready to add to the quote
                  </h2>
                </div>
                <div className="text-sm text-ct-text-secondary">
                  {resultRows.length} result{resultRows.length === 1 ? "" : "s"}
                </div>
              </div>

              {resultRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-ct-bg-secondary/40 p-6 text-sm text-ct-text-secondary">
                  Search a part or pick a suggested term to start building the request.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {resultRows.map((product) => (
                    <div
                      key={product.sku}
                      className="rounded-2xl border border-white/10 bg-ct-bg-secondary/40 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover border border-white/10"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-ct-text line-clamp-2">
                                {product.name}
                              </p>
                              <p className="text-xs text-ct-text-secondary font-mono mt-1">
                                {product.sku}
                              </p>
                            </div>
                            <span className="badge">{product.category}</span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ct-text-secondary">
                            <span>MOQ {product.moq}</span>
                            <span>Step {product.moqIncrement}</span>
                            <span>{product.brand}</span>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-ct-accent">
                                {formatCurrency(product.unitPrice)}
                              </p>
                              <p className="text-xs text-ct-text-secondary">
                                {product.stockStatus.replaceAll("_", " ")}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addLineItem(product)}
                              disabled={product.alreadySelected}
                              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ListPlus className="w-4 h-4" />
                              {product.alreadySelected ? "Added" : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-card p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-micro text-ct-text-secondary mb-2">Quote line items</p>
                  <h2 className="text-xl font-semibold text-ct-text">
                    {totalItems} unit{totalItems === 1 ? "" : "s"} staged
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={clearQuote}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>

              {lineItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-ct-bg-secondary/40 p-6 text-sm text-ct-text-secondary">
                  Add products from the search panel and they will appear here with MOQ
                  quantities and notes.
                </div>
              ) : (
                <div className="space-y-4">
                  {lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-ct-bg-secondary/40 p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3 min-w-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-lg object-cover border border-white/10"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ct-text">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-ct-text-secondary font-mono mt-1">
                              {item.product.sku}
                            </p>
                            <p className="text-xs text-ct-text-secondary mt-2">
                              MOQ {item.product.moq} · Step {item.product.moqIncrement}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.quantity - item.product.moqIncrement,
                                item.product.moq,
                                item.product.moqIncrement
                              )
                            }
                            disabled={item.quantity <= item.product.moq}
                            className="w-9 h-9 rounded-md border border-white/10 text-ct-text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            −
                          </button>
                          <input
                            value={item.quantity}
                            onChange={(event) =>
                              handleQuantityChange(
                                item.id,
                                Number(event.target.value || item.product.moq),
                                item.product.moq,
                                item.product.moqIncrement
                              )
                            }
                            className="w-20 input-dark text-center font-mono"
                            inputMode="numeric"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.quantity + item.product.moqIncrement,
                                item.product.moq,
                                item.product.moqIncrement
                              )
                            }
                            className="w-9 h-9 rounded-md border border-white/10 text-ct-text-secondary"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLineItem(item.id)}
                            className="w-9 h-9 rounded-md border border-white/10 text-ct-text-secondary"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                        <textarea
                          value={item.notes}
                          onChange={(event) => updateNotes(item.id, event.target.value)}
                          className="input-dark min-h-[92px] resize-none"
                          placeholder="Add notes, color options, timing, or fitment details..."
                        />
                        <div className="text-right">
                          <p className="text-xs text-ct-text-secondary uppercase tracking-widest">
                            Line total
                          </p>
                          <p className="text-xl font-semibold text-ct-accent mt-2">
                            {formatCurrency(item.product.unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="dashboard-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-ct-accent" />
                <h2 className="font-semibold text-ct-text">Request details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-ct-text-secondary mb-2">
                    Contact name
                  </label>
                  <input
                    value={metadata.contactName}
                    onChange={(event) =>
                      updateMetadata({ contactName: event.target.value })
                    }
                    className="input-dark"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ct-text-secondary mb-2">Company</label>
                  <input
                    value={metadata.company}
                    onChange={(event) => updateMetadata({ company: event.target.value })}
                    className="input-dark"
                    placeholder="Your company"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ct-text-secondary mb-2">Email</label>
                  <input
                    type="email"
                    value={metadata.email}
                    onChange={(event) => updateMetadata({ email: event.target.value })}
                    className="input-dark"
                    placeholder="name@company.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-ct-text-secondary mb-2">Currency</label>
                    <select
                      value={metadata.currency}
                      onChange={(event) =>
                        updateMetadata({
                          currency: event.target.value as "USD" | "EUR" | "GBP",
                        })
                      }
                      className="input-dark"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-ct-text-secondary mb-2">
                      Delivery terms
                    </label>
                    <select
                      value={metadata.deliveryTerms}
                      onChange={(event) =>
                        updateMetadata({
                          deliveryTerms: event.target.value as "EXW" | "FOB" | "CIF" | "DDP",
                        })
                      }
                      className="input-dark"
                    >
                      <option value="EXW">EXW</option>
                      <option value="FOB">FOB</option>
                      <option value="CIF">CIF</option>
                      <option value="DDP">DDP</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="btn-secondary inline-flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!readyToSubmit}
                    className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send request
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="dashboard-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-ct-accent" />
                <h2 className="font-semibold text-ct-text">Quote summary</h2>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ct-text-secondary">Line items</span>
                  <span className="text-ct-text">{lineItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ct-text-secondary">Total units</span>
                  <span className="text-ct-text">{totalItems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ct-text-secondary">Subtotal</span>
                  <span className="text-ct-accent font-semibold">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-ct-bg-secondary/40 p-4">
                <p className="text-sm text-ct-text">
                  Sales turnaround: same business day for clean quote lists.
                </p>
                <p className="text-xs text-ct-text-secondary mt-2">
                  {readyToSubmit
                    ? "Ready to send."
                    : "Fill the contact and company fields to enable submission."}
                </p>
              </div>
            </div>

            <div className="dashboard-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-ct-accent" />
                <h2 className="font-semibold text-ct-text">Useful shortcuts</h2>
              </div>
              <div className="space-y-3">
                <Link href="/dashboard" className="link-arrow">
                  Account dashboard <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/support" className="link-arrow">
                  Support center <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/checkout" className="link-arrow">
                  Start checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
