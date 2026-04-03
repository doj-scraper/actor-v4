"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("bg-ct-bg-secondary/80 border-white/10 shadow-card", className)}>
      <CardContent className="p-6 lg:p-10">
        <Empty className="border-white/10 bg-ct-bg/40">
          <EmptyHeader>
            {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
            <EmptyTitle className="text-ct-text">{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
          {actions && <EmptyContent>{actions}</EmptyContent>}
        </Empty>
      </CardContent>
    </Card>
  );
}
