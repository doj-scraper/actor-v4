'use client';

import { useEffect, useState } from 'react';

export function GridBackground() {
  const [theme, setTheme] = useState<string>('classic');
  
  useEffect(() => {
    // Listen for theme changes on document element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') || 'classic');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    setTheme(document.documentElement.getAttribute('data-theme') || 'classic');

    return () => observer.disconnect();
  }, []);

  if (theme === 'classic') {
    return (
      <>
        <div className="grid-overlay" />
        <div className="vignette-overlay" />
        <div className="noise-overlay" />
      </>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center overflow-hidden">
      {/* The Engineering Grid */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)'
        }}
      />
      
      {/* Subtle top glow using the Primary Cyan */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
