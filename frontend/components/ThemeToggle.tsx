'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Zap } from 'lucide-react';

type Palette = 'classic' | 'lab-tech-light' | 'lab-tech-dark';

export function ThemeToggle() {
  const [palette, setPalette] = useState<Palette>('classic');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedPalette = localStorage.getItem('app-palette') as Palette | null;
    if (storedPalette) {
      applyPalette(storedPalette);
    } else {
      applyPalette('classic'); // Default to Classic
    }
  }, []);

  const applyPalette = (newPalette: Palette) => {
    setPalette(newPalette);
    localStorage.setItem('app-palette', newPalette);

    const root = document.documentElement;
    if (newPalette === 'classic') {
      root.setAttribute('data-theme', 'classic');
      root.classList.remove('dark');
    } else if (newPalette === 'lab-tech-light') {
      root.setAttribute('data-theme', 'lab-tech');
      root.classList.remove('dark');
    } else if (newPalette === 'lab-tech-dark') {
      root.setAttribute('data-theme', 'lab-tech');
      root.classList.add('dark');
    }
  };

  if (!mounted) {
    return <div className="w-32 h-9 bg-secondary/50 rounded-sm animate-pulse" />;
  }

  return (
    <div className="flex items-center bg-card border border-border p-1 rounded-sm shadow-sm">
      <button
        onClick={() => applyPalette('classic')}
        className={`p-1.5 rounded-sm transition-colors flex items-center justify-center gap-1 ${
          palette === 'classic' 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
        title="Classic Theme"
      >
        <Zap className="w-4 h-4" strokeWidth={2.5} />
        {palette === 'classic' && <span className="text-[10px] font-bold uppercase tracking-tighter">Classic</span>}
      </button>
      
      <button
        onClick={() => applyPalette('lab-tech-light')}
        className={`p-1.5 rounded-sm transition-colors flex items-center justify-center gap-1 ${
          palette === 'lab-tech-light' 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
        title="Lab-Tech Light"
      >
        <Sun className="w-4 h-4" strokeWidth={2.5} />
        {palette === 'lab-tech-light' && <span className="text-[10px] font-bold uppercase tracking-tighter">Light</span>}
      </button>

      <button
        onClick={() => applyPalette('lab-tech-dark')}
        className={`p-1.5 rounded-sm transition-colors flex items-center justify-center gap-1 ${
          palette === 'lab-tech-dark' 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
        title="Lab-Tech Dark"
      >
        <Moon className="w-4 h-4" strokeWidth={2.5} />
        {palette === 'lab-tech-dark' && <span className="text-[10px] font-bold uppercase tracking-tighter">Dark</span>}
      </button>
    </div>
  );
}
