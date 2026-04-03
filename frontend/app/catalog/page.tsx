import type { Metadata } from "next";
import { DeviceExplorer } from '@/components/device-explorer';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Parts Catalog | CellTech Distributor",
  description: "Browse our extensive catalog of premium mobile phone parts - screens, batteries, cameras, and more.",
};

export default function CatalogPage() {
  return (
    <div>
      <PageHero
        eyebrow="Catalog"
        title={
          <>
            Find parts by <span className="text-ct-accent">device tree</span>
          </>
        }
        description="Use the device explorer to move through brand, model type, generation, and variant without losing the thread."
        actions={
          <Button asChild className="rounded-full">
            <Link href="/inventory">Open inventory table</Link>
          </Button>
        }
      />
      <DeviceExplorer />
    </div>
  );
}
