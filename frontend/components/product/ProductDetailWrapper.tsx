'use client';

import { ProductDetailCard } from './ProductDetailCard';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

interface ProductDetailWrapperProps {
  product: any; // Using any for now to handle backend/frontend model differences easily
}

export function ProductDetailWrapper({ product }: ProductDetailWrapperProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (skuId: string, quantity: number) => {
    addItem({
      skuId: product.skuId,
      name: product.partName,
      price: product.wholesalePrice,
      quantity,
      moq: 5,
      image: ""
    });

    toast.success(`Added to Cart`, {
      description: `${quantity}x ${product.skuId} added to your order.`,
      className: "font-mono",
    });
  };

  return (
    <ProductDetailCard 
      product={{
        ...product,
        name: product.partName,
        brand: product.brand ?? "Unknown", // Handle missing brand
        model: product.model ?? "Unknown", // Handle missing model
        compatibleModels: (product.compatibilities ?? []).map((c: any) => c.variant.marketingName),
      }} 
      onAddToCart={handleAddToCart}
    />
  );
}
