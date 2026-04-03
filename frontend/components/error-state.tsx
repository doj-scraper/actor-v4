"use client";

import type { ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  secondaryAction,
  className,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" className={cn("border-red-500/20 bg-red-500/10 text-red-200", className)}>
      <AlertCircle className="size-4 text-red-300" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="space-y-4">
          <p className="text-sm text-red-200/90">{message}</p>
          <div className="flex flex-wrap gap-3">
            {onRetry && (
              <Button
                type="button"
                variant="outline"
                onClick={onRetry}
                className="rounded-full border-red-400/30 bg-transparent text-red-100 hover:bg-red-500/10 hover:text-white"
              >
                <RefreshCcw className="size-4" />
                {retryLabel}
              </Button>
            )}
            {secondaryAction}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
