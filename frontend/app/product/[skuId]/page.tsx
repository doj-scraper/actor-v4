import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPartDetails } from "@/lib/api";
import { ProductDetailWrapper } from "@/components/product/ProductDetailWrapper";

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

export default async function ProductPage({ params }: Props) {
  const { skuId } = await params;

  const data = await getPartDetails(skuId).catch(() => null);
  const part = data?.part;

  if (!part) notFound();

  // Try to find the brand and model from the compatibility tree
  const firstCompat = part.compatibilities?.[0]?.variant;
  const brand = firstCompat?.generation?.modelType?.brand?.name || "Premium Parts";
  const model = firstCompat?.generation?.name || "Mobile Components";

  return (
    <div className="pt-24 pb-20 px-6 lg:px-12">
      <ProductDetailWrapper 
        product={{
          ...part,
          brand,
          model
        }} 
      />
    </div>
  );
}
