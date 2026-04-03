"use client";

import { useEffect, useRef, useState } from 'react';
import { Search, Zap, Package, RotateCcw } from 'lucide-react';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={sectionRef} className="section-pinned flex items-center" style={{ zIndex: 10 }}>
      <div className="w-full px-6 lg:px-12 pt-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-4rem)]">
          {/* Left: Image */}
          <div 
            className={`relative transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'
            }`}
          >
            <div className="relative aspect-[3/4] max-w-lg mx-auto lg:mx-0">
              <img 
                src="/images/hero_phone_internals.jpg" 
                alt="Phone internals"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-ct-bg/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex flex-col justify-center">
            <h1 
              className={`heading-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-ct-text mb-6 transition-all duration-1000 delay-200 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              PRECISION PARTS.<br />
              <span className="text-ct-accent">BUILT FOR VOLUME.</span>
            </h1>
            
            <p 
              className={`text-ct-text-secondary text-base lg:text-lg max-w-md mb-8 transition-all duration-1000 delay-300 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Wholesale components for repair shops—OEM-grade, tested, and ready to ship.
            </p>

            {/* Search Bar */}
            <div 
              className={`relative max-w-md mb-8 transition-all duration-1000 delay-400 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ct-text-secondary" />
                <input 
                  type="text"
                  placeholder="Search by model, part number, or symptom..."
                  className="input-dark pl-12 pr-4 py-4 w-full"
                />
              </div>
            </div>

            {/* CTAs */}
            <div 
              className={`flex flex-wrap gap-4 mb-8 transition-all duration-1000 delay-500 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <button onClick={() => scrollToSection('catalog')} className="btn-primary">
                Browse Catalog
              </button>
              <button onClick={() => scrollToSection('quote')} className="btn-secondary">
                Request a Quote
              </button>
            </div>

            {/* Micro Stats */}
            <div 
              className={`flex flex-wrap gap-4 text-micro text-ct-text-secondary transition-all duration-1000 delay-600 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-ct-accent" />
                Same-day dispatch
              </span>
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-ct-accent" />
                MOQ-friendly
              </span>
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-ct-accent" />
                14-day returns
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
