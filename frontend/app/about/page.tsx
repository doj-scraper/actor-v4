import type { Metadata } from "next";
import { QualitySection } from '@/components/quality-section';
import { ShippingSection } from '@/components/shipping-section';
import { TestimonialsSection } from '@/components/testimonials-section';

export const metadata: Metadata = {
  title: "About | CellTech Distributor",
  description: "Learn about CellTech's quality standards, global shipping, and why repair shops trust us for wholesale mobile parts.",
};

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Page header */}
      <div className="px-6 lg:px-12 py-16 lg:py-24 text-center">
        <h1 className="heading-display text-4xl sm:text-5xl lg:text-6xl text-ct-text mb-4">
          WHY <span className="text-ct-accent">CELLTECH</span>
        </h1>
        <p className="text-ct-text-secondary text-sm lg:text-base max-w-2xl mx-auto">
          Lab-verified quality, global dispatch, and the trust of repair shops across the country.
        </p>
      </div>

      <QualitySection />
      <ShippingSection />
      <TestimonialsSection />
    </div>
  );
}
