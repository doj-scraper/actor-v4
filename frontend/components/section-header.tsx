"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" ? "items-center text-center" : "items-start",
        className
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className="text-micro text-ct-accent mb-3">{eyebrow}</p>
        )}
        <h1 className="heading-display text-3xl sm:text-4xl lg:text-5xl text-ct-text">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-sm lg:text-base text-ct-text-secondary max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className={cn("flex flex-wrap gap-3", align === "center" && "justify-center")}>
          {actions}
        </div>
      )}
    </div>
  );
}
