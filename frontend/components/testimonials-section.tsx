"use client";

import { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';

export function TestimonialsSection() {
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      quote: "Parts arrive consistent and well-packed. That reduces comebacks.",
      author: "Repair Lead",
      location: "Midwest",
      metric: "Monthly reorder"
    },
    {
      quote: "Quote response is fast. We plan inventory around it.",
      author: "Ops Manager",
      location: "West Coast",
      metric: "500+ units/month"
    },
    {
      quote: "The guides cut training time for new techs.",
      author: "Shop Owner",
      location: "Southeast",
      metric: "12 technicians"
    },
    {
      quote: "MOQ flexibility lets us test new parts without big commitment.",
      author: "Procurement Lead",
      location: "Northeast",
      metric: "3 locations"
    },
    {
      quote: "Same-day dispatch keeps our turnaround tight.",
      author: "Service Manager",
      location: "Southwest",
      metric: "24hr repair"
    },
    {
      quote: "Quality control is consistent. Rarely see DOA issues.",
      author: "Technical Director",
      location: "Pacific Northwest",
      metric: "99.2% success"
    },
  ];

  return (
    <section ref={sectionRef} className="section-flowing py-20 lg:py-32" style={{ zIndex: 100 }}>
      <div className="w-full px-6 lg:px-12">
        {/* Header */}
        <div 
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="heading-display text-3xl sm:text-4xl lg:text-5xl text-ct-text mb-2">
            TRUSTED BY <span className="text-ct-accent">SHOPS</span>
          </h2>
          <p className="text-ct-text-secondary text-sm lg:text-base">
            Teams that prioritize turnaround and consistency.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className={`testimonial-card transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-ct-accent text-ct-accent" />
                ))}
              </div>
              <p className="text-ct-text text-sm mb-4 leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ct-text text-sm font-medium">{testimonial.author}</p>
                  <p className="text-micro text-ct-text-secondary">{testimonial.location}</p>
                </div>
                <span className="badge">{testimonial.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
