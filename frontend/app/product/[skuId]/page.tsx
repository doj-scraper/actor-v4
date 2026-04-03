import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Package, RotateCcw, Zap } from "lucide-react";
import { getPartDetails } from "@/lib/api";
import { FitmentChecker } from "@/components/product/FitmentChecker";
import { ProductGallery } from "@/components/product/ProductGallery";
import { CompatibilityMatrix } from "@/components/product/CompatibilityMatrix";
import { AddToCartButton } from "@/components/product/AddToCartButton";

interface Props {
  params: Promise<{ skuId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { skuId } = await params;
  const data = await getPartDetails(skuId).catch(() => null);
  const part = data?.part;
  return {
    title: part
      ? `${part.partName} | CellTech Distributor`
      : "Part Not Found | CellTech Distributor",
    description: part
      ? `Wholesale ${part.partName} — ${part.qualityGrade} quality. SKU: ${part.skuId}`
      : "Wholesale mobile repair parts.",
  };
}

/**
 * Format wholesalePrice (cents) for display.
 * wholesalePrice === 0 → "Contact for Price" (never "$0.00")
 */
function formatPrice(cents: number): string {
  if (cents === 0) return "Contact for Price";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function ProductPage({ params }: Props) {
  const { skuId } = await params;

  const data = await getPartDetails(skuId).catch(() => null);
  const part = data?.part;

  if (!part) notFound();

  // Build the unified compatible models list the FitmentChecker and Matrix both consume
  const allCompatibleModels: Array<{ modelNumber: string; marketingName: string }> =
    (part.compatibilities ?? []).map((c) => ({
      modelNumber: c.variant.modelNumber ?? c.variant.marketingName,
      marketingName: c.variant.marketingName,
    }));

  const priceDisplay = formatPrice(part.wholesalePrice);
  const isInStock = part.stockLevel > 0;

  // Build spec pairs from the backend array (label/value pairs)
  const specPairs: Array<{ label: string; value: string }> = [
    ...(part.specifications ?? []),
    { label: "Category", value: part.category },
    { label: "Quality Grade", value: part.qualityGrade },
  ];

  const trustBadges = [
    { Icon: ShieldCheck, text: "Batch Verified" },
    { Icon: Package, text: "Anti-static Pack" },
    { Icon: Zap, text: "Same-day Dispatch" },
    { Icon: RotateCcw, text: "14-day Returns" },
  ];

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 font-mono text-xs text-ct-text-secondary mb-10 uppercase tracking-widest">
          <Link href="/" className="hover:text-ct-accent transition-colors">Home</Link>
          <span className="opacity-30">/</span>
          <Link href="/catalog" className="hover:text-ct-accent transition-colors">Catalog</Link>
          <span className="opacity-30">/</span>
          <Link
            href={`/catalog?category=${encodeURIComponent(part.category)}`}
            className="hover:text-ct-accent transition-colors"
          >
            {part.category}
          </Link>
          <span className="opacity-30">/</span>
          <span className="text-ct-text truncate max-w-[200px]">{part.partName}</span>
        </nav>

        {/* Main split-screen */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start mb-16">

          {/* LEFT – image gallery */}
          <ProductGallery
            partName={part.partName}
            category={part.category}
            skuId={part.skuId}
          />

          {/* RIGHT – purchase & fitment */}
          <div className="flex flex-col">

            {/* Status row */}
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isInStock ? "bg-green-400 animate-pulse" : "bg-red-400"
                }`}
              />
              <span className="font-mono text-xs text-ct-text-secondary uppercase tracking-widest">
                {isInStock ? `${part.stockLevel} units in stock` : "Out of stock"}
              </span>
              {part.qualityGrade && part.qualityGrade !== "NA" && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="font-mono text-xs text-ct-accent uppercase tracking-widest">
                    {part.qualityGrade}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="heading-display text-3xl lg:text-4xl text-ct-text mb-3 leading-tight">
              {part.partName}
            </h1>

            {/* SKU pill */}
            <div className="flex items-center gap-3 mb-8">
              <span className="font-mono text-xs bg-ct-bg-secondary border border-white/10 px-3 py-1.5 rounded-md text-ct-accent">
                SKU: {part.skuId}
              </span>
            </div>

            {/* Price & CTA card */}
            <div className="bg-ct-bg-secondary border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="font-mono text-xs text-ct-text-secondary uppercase tracking-widest mb-1">
                    Wholesale Price
                  </div>
                  <div className="heading-display text-4xl text-ct-text">
                    {priceDisplay}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-ct-text-secondary uppercase tracking-widest mb-1">
                    Min. Order
                  </div>
                  <div className="font-mono text-xl text-ct-accent font-semibold">
                    5 units
                  </div>
                </div>
              </div>

              <AddToCartButton
                skuId={part.skuId}
                partName={part.partName}
                price={part.wholesalePrice}
                stock={part.stockLevel}
                category={part.category}
              />
            </div>

            {/* Fitment Checker */}
            <FitmentChecker compatibleModels={allCompatibleModels} />

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 pt-6 border-t border-white/5">
              {trustBadges.map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-ct-accent flex-shrink-0" />
                  <span className="font-mono text-xs text-ct-text-secondary uppercase tracking-wider">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: specs + compatibility matrix */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">

          {/* Specs table */}
          {specPairs.length > 0 && (
            <div>
              <h2 className="heading-display text-xl text-ct-text mb-6 pb-3 border-b border-white/10">
                Technical Specifications
              </h2>
              <div className="divide-y divide-white/5">
                {specPairs.map(({ label, value }) => (
                  <div
                    key={label}
                    className="grid grid-cols-2 gap-4 py-3 group hover:bg-ct-bg-secondary/30 px-2 -mx-2 rounded transition-colors"
                  >
                    <span className="font-mono text-xs text-ct-text-secondary uppercase tracking-widest self-center">
                      {label}
                    </span>
                    <span
                      className={`font-mono text-sm text-right self-center ${
                        label === "Quality Grade"
                          ? "text-ct-accent font-semibold"
                          : "text-ct-text"
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatibility matrix */}
          {allCompatibleModels.length > 0 && (
            <CompatibilityMatrix models={allCompatibleModels} />
          )}
        </div>

      </div>
    </div>
  );
}
