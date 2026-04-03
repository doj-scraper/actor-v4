"use client";

import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CartBadgeProps {
  count: number;
  className?: string;
  showIcon?: boolean;
}

export function CartBadge({ count, className, showIcon = true }: CartBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1.5 border-ct-accent/20 bg-ct-accent/15 text-ct-accent",
        className
      )}
    >
      {showIcon && <ShoppingCart className="size-3.5" />}
      <span className="font-mono text-[11px] tabular-nums">{count}</span>
    </Badge>
  );
}
