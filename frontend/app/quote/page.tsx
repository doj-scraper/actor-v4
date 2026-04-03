import type { Metadata } from "next";
import { QuoteSection } from '@/components/quote-section';

export const metadata: Metadata = {
  title: "Request Quote | CellTech Distributor",
  description: "Get a custom quote for bulk orders of mobile phone parts. Competitive wholesale pricing.",
};

export default function QuotePage() {
  return <QuoteSection />;
}
