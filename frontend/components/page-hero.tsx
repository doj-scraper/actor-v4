"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("pt-24 pb-12 lg:pt-28 lg:pb-14", className)}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col gap-6">
          <div className="max-w-3xl">
            {eyebrow && <p className="text-micro text-ct-accent mb-3">{eyebrow}</p>}
            <h1 className="heading-display text-3xl sm:text-4xl lg:text-5xl text-ct-text">
              {title}
            </h1>
            {description && (
              <p className="mt-4 text-sm lg:text-base text-ct-text-secondary max-w-2xl">
                {description}
              </p>
            )}
          </div>

          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  );
}
