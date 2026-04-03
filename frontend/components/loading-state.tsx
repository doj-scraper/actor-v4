"use client";

import { Skeleton } from "@/components/Skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PageLoadingState() {
  return (
    <Card className="bg-ct-bg-secondary/80 border-white/10 shadow-card">
      <span className="sr-only">inventory-loading</span>
      <CardHeader className="space-y-3">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-10 w-2/3 rounded-lg" />
        <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </CardContent>
    </Card>
  );
}
