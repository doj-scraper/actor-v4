"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { searchParts, type InventoryItem } from '@/lib/api';

interface MappedProduct {
  name: string;
  sku: string;
  price: string;
  moq: number;
  stock: string;
  image: string;
  category: string;
}

function mapProduct(item: InventoryItem): MappedProduct {
  return {
    name: item.partName,
    sku: item.skuId,
    price: item.wholesalePrice > 0 ? `$${(item.wholesalePrice / 100).toFixed(2)}` : 'Contact for Price',
    moq: 5,
    stock: item.stockLevel > 10 ? 'In Stock' : item.stockLevel > 0 ? 'Low Stock' : 'Out of Stock',
    image: '/images/product_placeholder.jpg',
    category: item.category,
  };
}

export function ProductsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [products, setProducts] = useState<MappedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await searchParts('iPhone');
        setProducts(data.map(mapProduct));
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
    return () => observer.disconnect();
  }, []);

  const filters = ['All', 'Display', 'Battery', 'Camera', 'Charging Port'];

  const filteredProducts = useMemo(
    () =>
      activeFilter === 'All'
        ? products
        : products.filter((product) => product.category === activeFilter),
    [activeFilter, products]
  );

  return (
    <section ref={sectionRef} id="catalog" className="section-flowing py-20 lg:py-32" style={{ zIndex: 30 }}>
      <div className="w-full px-6 lg:px-12">
        <div
          className={`flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div>
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-5xl text-ct-text mb-2">
              IN-DEMAND <span className="text-ct-accent">PARTS</span>
            </h2>
            <p className="text-ct-text-secondary text-sm lg:text-base">
              High-rotation components with clear MOQ and stock status.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-6 lg:mt-0">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="product-card animate-pulse">
                <div className="aspect-square bg-ct-bg-secondary/50" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-ct-bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-ct-bg-secondary rounded w-1/2" />
                  <div className="h-9 bg-ct-bg-secondary rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {filteredProducts.map((product, index) => (
              <Link
                key={product.sku}
                href={`/product/${encodeURIComponent(product.sku)}`}
                className={`product-card block transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-ct-accent/40 rounded-xl ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="aspect-square bg-ct-bg-secondary/50 p-4 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-micro text-ct-text-secondary font-mono">
                      {product.sku}
                    </span>
                    <span
                      className={`badge ${
                        product.stock === 'Low Stock'
                          ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                          : product.stock === 'Out of Stock'
                            ? 'text-red-400 bg-red-400/10 border-red-400/20'
                            : ''
                      }`}
                    >
                      {product.stock}
                    </span>
                  </div>

                  <h3 className="text-ct-text font-medium text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-ct-accent font-semibold">{product.price}</span>
                    <span className="text-micro text-ct-text-secondary">
                      MOQ: {product.moq}
                    </span>
                  </div>

                  <div className="w-full py-2 rounded-lg text-sm font-medium text-center border border-ct-accent/30 text-ct-accent group-hover:bg-ct-accent/10 transition-all duration-200">
                    View Details →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-ct-text-secondary">No parts found for this filter.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/catalog" className="link-arrow">
            View full catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
