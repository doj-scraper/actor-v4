import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SummaryItem {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "accent";
  icon?: ReactNode;
}

interface SummaryPanelProps {
  title: string;
  description?: string;
  items: SummaryItem[];
  footerLabel?: string;
  footerValue?: string;
  footerNote?: string;
  action?: ReactNode;
  className?: string;
}

export function SummaryPanel({
  title,
  description,
  items,
  footerLabel,
  footerValue,
  footerNote,
  action,
  className,
}: SummaryPanelProps) {
  return (
    <Card className={cn("bg-ct-bg-secondary/80 border-white/10 shadow-card", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-ct-text">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/5 bg-ct-bg/40 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {item.icon && <span className="text-ct-accent">{item.icon}</span>}
                  <span className="text-sm text-ct-text-secondary truncate">
                    {item.label}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-sm font-medium text-right",
                    item.tone === "accent" ? "text-ct-accent" : "text-ct-text"
                  )}
                >
                  {item.value}
                </span>
              </div>
              {item.helper && (
                <p className="mt-2 text-xs text-ct-text-secondary">{item.helper}</p>
              )}
            </div>
          ))}
        </div>

        {(footerLabel || footerValue) && (
          <>
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between gap-3">
              <div>
                {footerLabel && (
                  <p className="text-micro text-ct-text-secondary">{footerLabel}</p>
                )}
                {footerNote && (
                  <p className="mt-1 text-xs text-ct-text-secondary">{footerNote}</p>
                )}
              </div>
              {footerValue && (
                <p className="heading-display text-2xl text-ct-text">{footerValue}</p>
              )}
            </div>
          </>
        )}

        {action && <div className="pt-1">{action}</div>}
      </CardContent>
    </Card>
  );
}
