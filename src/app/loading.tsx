"use client";

import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function Loading() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4 min-h-[400px]">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground animate-pulse">
        Loading experience...
      </p>
    </div>
  );
}
