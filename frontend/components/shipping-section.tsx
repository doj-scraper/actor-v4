"use client";

import { useEffect, useRef, useState } from 'react';

export function ShippingSection() {
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

  const metrics = [
    { value: '2–5', unit: 'days', label: 'Delivery' },
    { value: 'DDP', unit: '', label: 'Available' },
    { value: 'Batch', unit: '', label: 'Tracking' },
  ];

  return (
    <section ref={sectionRef} className="section-pinned flex items-center" style={{ zIndex: 70 }}>
      <div className="w-full px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-screen">
          {/* Left: Content */}
          <div 
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-5xl text-ct-text mb-4">
              GLOBAL<br />
              <span className="text-ct-accent">DISPATCH</span>
            </h2>
            <p className="text-ct-text-secondary text-sm lg:text-base max-w-md mb-8">
              Consolidated packing, customs docs included, and tracked from warehouse to door.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {metrics.map((metric, index) => (
                <div key={index} className="stat-card text-center">
                  <div className="text-ct-accent font-display font-bold text-2xl lg:text-3xl">
                    {metric.value}
                    <span className="text-lg">{metric.unit}</span>
                  </div>
                  <div className="text-micro text-ct-text-secondary mt-1">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Map */}
          <div 
            className={`relative transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden dashboard-card">
              <img 
                src="/images/shipping_map.jpg" 
                alt="Global shipping map"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
