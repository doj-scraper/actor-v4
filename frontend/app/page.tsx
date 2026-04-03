import { HeroSection } from '@/components/hero-section';
import { CategoriesSection } from '@/components/categories-section';
import { ProductsSection } from '@/components/products-section';
import { PartnersSection } from '@/components/partners-section';
import { CTASection } from '@/components/cta-section';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <ProductsSection />
      <PartnersSection />
      <CTASection />
    </>
  );
}
