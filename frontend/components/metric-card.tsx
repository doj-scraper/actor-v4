"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  description,
  icon,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("bg-ct-bg-secondary/80 border-white/10 shadow-card", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-micro text-ct-text-secondary">{label}</p>
            <p className="mt-2 heading-display text-2xl lg:text-3xl text-ct-text">
              {value}
            </p>
            {description && (
              <p className="mt-2 text-xs text-ct-text-secondary">{description}</p>
            )}
          </div>
          {icon && (
            <div className="flex size-10 items-center justify-center rounded-xl bg-ct-accent/10 text-ct-accent">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
