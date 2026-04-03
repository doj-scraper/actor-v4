"use client";

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

export function QualitySection() {
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

  const features = [
    'Functional test on key assemblies',
    'Visual + fit check',
    'Anti-static packaging',
  ];

  const badges = ['ISO 9001', 'QC Check', 'Traceable Batches'];

  return (
    <section ref={sectionRef} className="section-pinned flex items-center" style={{ zIndex: 60 }}>
      <div className="w-full px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-screen">
          {/* Left: Image */}
          <div 
            className={`relative transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <img 
                src="/images/testing_lab.jpg" 
                alt="Testing lab"
                className="w-full h-full object-cover animate-drift"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ct-bg/40 to-transparent" />
            </div>
          </div>

          {/* Right: Content */}
          <div 
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-5xl text-ct-text mb-4">
              LAB-VERIFIED<br />
              <span className="text-ct-accent">QUALITY</span>
            </h2>
            <p className="text-ct-text-secondary text-sm lg:text-base max-w-md mb-8">
              Every batch is function-tested, inspected, and packed to minimize DOA.
            </p>

            <div className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-ct-accent flex-shrink-0" />
                  <span className="text-ct-text text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {badges.map((badge, index) => (
                <span key={index} className="text-micro px-3 py-2 rounded-lg bg-ct-accent/10 text-ct-accent border border-ct-accent/20">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
