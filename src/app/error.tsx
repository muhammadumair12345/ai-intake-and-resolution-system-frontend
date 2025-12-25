"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 text-center min-h-[400px] border-2 border-dashed rounded-xl p-8 bg-muted/20">
      <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
        <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Something went wrong!
        </h2>
        <p className="text-muted-foreground max-w-md">
          {error.message ||
            "An unexpected error occurred while processing your request."}
        </p>
      </div>
      <Button onClick={() => reset()} className="gap-2">
        <RefreshCw className="w-4 h-4" />
        Try again
      </Button>
    </div>
  );
}
