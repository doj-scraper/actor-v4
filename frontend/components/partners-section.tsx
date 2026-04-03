"use client";

import { useEffect, useRef, useState } from 'react';

export function PartnersSection() {
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

  const partners = [
    'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Motorola'
  ];

  return (
    <section ref={sectionRef} className="section-flowing py-16 lg:py-24" style={{ zIndex: 110 }}>
      <div className="w-full px-6 lg:px-12">
        <div 
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-ct-text-secondary text-sm">
            Compatible with major device families
          </p>
        </div>

        <div className="border-y border-white/10 py-8">
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {partners.map((partner, index) => (
              <div 
                key={partner}
                className={`text-ct-text-secondary font-display font-semibold text-lg lg:text-xl opacity-50 hover:opacity-100 transition-all duration-500 ${
                  isVisible ? 'opacity-50 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {partner}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-micro text-ct-text-secondary mt-6">
          OEM brands are trademarks of their respective owners.
        </p>
      </div>
    </section>
  );
}
