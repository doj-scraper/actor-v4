'use client';

import { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Settings2, 
  Layers, 
  ShoppingCart,
  ChevronRight
} from 'lucide-react';

interface ProductDetailProps {
  product: {
    skuId: string;
    name: string; // e.g., "iPhone 15 Pro Screen"
    brand: string;
    model: string;
    qualityGrade: 'OEM' | 'Premium' | 'Aftermarket' | 'Pulled' | string;
    wholesalePrice: number; // In cents!
    stockLevel: number;
    specifications: Record<string, string> | { label: string; value: string }[];
    compatibleModels: string[];
  };
  onAddToCart?: (skuId: string, quantity: number) => void;
}

export function ProductDetailCard({ product, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(5); // B2B MOQ
  
  const isContactForPrice = product.wholesalePrice === 0;
  const formattedPrice = isContactForPrice 
    ? "Contact for Price" 
    : `$${(product.wholesalePrice / 100).toFixed(2)}`;

  const specs = Array.isArray(product.specifications) 
    ? product.specifications 
    : Object.entries(product.specifications).map(([label, value]) => ({ label, value }));

  return (
    <div className="w-full max-w-6xl mx-auto bg-background text-foreground animate-in fade-in duration-500">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono uppercase tracking-wider mb-6">
        <span className="hover:text-primary cursor-pointer transition-colors">Catalog</span>
        <ChevronRight className="w-3 h-3" />
        <span className="hover:text-primary cursor-pointer transition-colors">{product.brand}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="hover:text-primary cursor-pointer transition-colors">{product.model}</span>
        <ChevronRight className="w-3 h-3 text-primary" />
        <span className="text-foreground">{product.skuId}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visuals */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="aspect-square bg-card border border-border rounded-sm flex flex-col items-center justify-center p-8 relative overflow-hidden group">
            {/* Background Blueprint Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
                 style={{ backgroundImage: 'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
            
            <Layers className="w-24 h-24 text-muted-foreground group-hover:text-primary transition-colors duration-500 mb-4 z-10" strokeWidth={1} />
            <p className="font-mono text-xs text-muted-foreground z-10 uppercase tracking-widest border border-border px-3 py-1 bg-background/50 backdrop-blur-sm">
              Exploded View Available
            </p>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`aspect-square rounded-sm border ${i === 1 ? 'border-primary' : 'border-border'} bg-card opacity-80 hover:opacity-100 cursor-pointer transition-opacity`}></div>
            ))}
          </div>
        </div>

        {/* Right Column: Data & Actions */}
        <div className="lg:col-span-7 flex flex-col">
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
              {product.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-sm uppercase tracking-widest">
                {product.skuId}
              </span>
              
              <span className="font-mono text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-sm uppercase tracking-wider">
                {product.qualityGrade} Grade
              </span>
              
              {product.stockLevel > 0 ? (
                <span className="flex items-center gap-1 font-mono text-xs text-success border border-success/30 bg-success/10 px-2 py-1 rounded-sm uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> {product.stockLevel} In Stock
                </span>
              ) : (
                <span className="flex items-center gap-1 font-mono text-xs text-destructive border border-destructive/30 bg-destructive/10 px-2 py-1 rounded-sm uppercase tracking-wider">
                  <AlertCircle className="w-3 h-3" /> Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-border my-6" />

          {/* Pricing & Cart Action Block */}
          <div className="bg-card border border-border p-6 rounded-sm mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">Wholesale Tier 1</p>
                <p className={`font-mono font-bold ${isContactForPrice ? 'text-2xl text-warning' : 'text-4xl text-foreground'}`}>
                  {formattedPrice}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex flex-col">
                  <input 
                    type="number" 
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-20 bg-background border border-input text-foreground font-mono px-3 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-ring text-center"
                  />
                  <span className="text-[10px] text-muted-foreground text-center mt-1 uppercase tracking-widest">Qty</span>
                </div>
                
                <button 
                  disabled={product.stockLevel === 0}
                  onClick={() => onAddToCart?.(product.skuId, quantity)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:brightness-110 transition-all px-8 py-3 rounded-sm font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-auto">
            
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-widest mb-4 border-b border-border pb-2">
                <Settings2 className="w-4 h-4 text-primary" /> Technical Specs
              </h3>
              <div className="space-y-2">
                {specs.map((spec, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{spec.label}</span>
                    <span className="font-mono text-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-widest mb-4 border-b border-border pb-2">
                <Package className="w-4 h-4 text-primary" /> Compatibility
              </h3>
              <ul className="flex flex-wrap gap-2">
                {product.compatibleModels.map((model) => (
                  <li key={model} className="text-xs font-mono bg-secondary/50 text-secondary-foreground border border-border px-2 py-1 rounded-sm">
                    {model}
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
