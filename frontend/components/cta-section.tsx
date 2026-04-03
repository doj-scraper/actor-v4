"use client";

import { useEffect, useRef, useState } from 'react';

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');

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

  return (
    <section ref={sectionRef} className="section-pinned flex items-center" style={{ zIndex: 120 }}>
      <div className="w-full px-6 lg:px-12">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h2 
            className={`heading-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-ct-text mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            STOCK YOUR<br />
            <span className="text-ct-accent">BENCH TODAY</span>
          </h2>
          
          <p 
            className={`text-ct-text-secondary text-base lg:text-lg max-w-md mb-10 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Get access to wholesale pricing, bulk quotes, and same-day dispatch.
          </p>

          <div 
            className={`flex flex-col sm:flex-row gap-4 max-w-md w-full mb-6 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="input-dark flex-1"
            />
            <button className="btn-primary whitespace-nowrap">
              Get Access
            </button>
          </div>

          <p 
            className={`text-micro text-ct-text-secondary transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            No minimum first order • Unsubscribe anytime
          </p>
        </div>
      </div>
    </section>
  );
}
