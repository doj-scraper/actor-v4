"use client";

import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export function CategoriesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const categories = [
    { name: 'DISPLAY ASSEMBLIES', image: '/images/category_display.jpg' },
    { name: 'BATTERY & POWER', image: '/images/category_battery.jpg' },
    { name: 'LOGIC & BOARDS', image: '/images/category_board.jpg' },
    { name: 'CAMERA MODULES', image: '/images/category_camera.jpg' },
  ];

  return (
    <section ref={sectionRef} id="categories" className="section-pinned flex items-center" style={{ zIndex: 20 }}>
      <div className="w-full px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-screen">
          {/* Left: Heading */}
          <div 
            className={`lg:col-span-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-5xl text-ct-text mb-4">
              BROWSE BY<br />
              <span className="text-ct-accent">MODULE</span>
            </h2>
            <p className="text-ct-text-secondary text-sm lg:text-base max-w-sm">
              Filter by device family, then drill into assemblies, cables, and shields.
            </p>
          </div>

          {/* Right: Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <div 
                  key={category.name}
                  className={`category-tile aspect-square flex flex-col items-center justify-center p-6 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                  }`}
                  style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                >
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-24 h-24 lg:w-32 lg:h-32 object-contain mb-4 animate-drift"
                  />
                  <span className="text-micro text-ct-accent text-center">{category.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <button className="link-arrow">
                View all categories <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
