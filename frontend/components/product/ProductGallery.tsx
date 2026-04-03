"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  partName?: string;
  category: string;
  skuId: string;
}

// Category → image path mapping. Extend as real product photos are added.
const CATEGORY_IMAGES: Record<string, string[]> = {
  Display: ["/images/product_screen.jpg", "/images/category_display.jpg"],
  Battery: ["/images/product_battery.jpg"],
  Camera: ["/images/category_camera.jpg"],
  Board: ["/images/category_board.jpg"],
};

const FALLBACK = "/images/product_placeholder.jpg";

function getImagesForCategory(category: string): string[] {
  const key = Object.keys(CATEGORY_IMAGES).find(
    (k) => category.toLowerCase().includes(k.toLowerCase())
  );
  const imgs = key ? CATEGORY_IMAGES[key] : [];
  const result = [...new Set(imgs)];
  while (result.length < 2) result.push(FALLBACK);
  return result;
}

export function ProductGallery({ partName, category, skuId }: ProductGalleryProps) {
  const images = getImagesForCategory(category);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Main image container */}
      <div
        className="relative rounded-2xl overflow-hidden flex items-center justify-center"
        style={{
          background:
            "linear-gradient(145deg, #0D1120 0%, #111725 60%, #0A0F1C 100%)",
          border: "1px solid rgba(242, 245, 250, 0.07)",
          minHeight: 420,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Ambient cyan glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,229,192,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Corner grid decoration */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg,rgba(242,245,250,0.03) 0px,rgba(242,245,250,0.03) 1px,transparent 1px,transparent 60px),repeating-linear-gradient(0deg,rgba(242,245,250,0.03) 0px,rgba(242,245,250,0.03) 1px,transparent 1px,transparent 60px)",
          }}
        />

        {/* Main image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={images[activeIndex]}
            alt={partName || category}
            className="relative z-10 object-contain w-full max-w-xs select-none"
            style={{
              filter:
                "drop-shadow(0 0 32px rgba(0,229,192,0.10)) drop-shadow(0 8px 24px rgba(0,0,0,0.5))",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: isHovered ? 1.03 : 1.0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            draggable={false}
          />
        </AnimatePresence>

        {/* Category badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="font-mono text-xs bg-ct-bg-secondary/80 border border-white/10 backdrop-blur-sm px-2.5 py-1 rounded-md text-ct-accent uppercase tracking-widest">
            {category}
          </span>
        </div>

        {/* SKU watermark */}
        <div className="absolute bottom-4 right-4 z-20">
          <span className="font-mono text-xs text-ct-text-secondary/30 uppercase tracking-widest">
            {skuId}
          </span>
        </div>

        {/* Zoom icon hint on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg bg-ct-bg-secondary/70 border border-white/10 backdrop-blur-sm flex items-center justify-center"
            >
              <ZoomIn className="w-4 h-4 text-ct-text-secondary" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`
              relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200
              flex items-center justify-center p-2.5
              ${
                activeIndex === i
                  ? "border-ct-accent bg-ct-bg-secondary shadow-[0_0_12px_rgba(0,229,192,0.2)]"
                  : "border-white/8 bg-ct-bg-secondary hover:border-white/20"
              }
            `}
            aria-label={`View image ${i + 1}`}
          >
            <img
              src={src}
              alt=""
              className={`w-full h-full object-contain transition-opacity duration-200 ${
                activeIndex === i ? "opacity-100" : "opacity-50"
              }`}
              draggable={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
