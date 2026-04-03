import type { Metadata } from "next";
import { SupportSection } from '@/components/support-section';

export const metadata: Metadata = {
  title: "Support | CellTech Distributor",
  description: "Get help with your orders, technical support, and answers to frequently asked questions.",
};

export default function SupportPage() {
  return <SupportSection />;
}
