import type { ReactNode } from 'react';
import { Navigation } from './navigation';
import { FooterSection } from './footer-section';

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-ct-bg">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <FooterSection />
    </div>
  );
}
