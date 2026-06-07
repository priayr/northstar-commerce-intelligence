"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard Page Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-[var(--color-negative)]/20 bg-[var(--color-negative)]/5 rounded-xl my-4 w-full min-h-[400px]">
      <div className="w-16 h-16 bg-[var(--color-negative)]/10 text-[var(--color-negative)] rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
        Something went wrong
      </h2>
      <p className="text-[var(--color-text-secondary)] mb-6 max-w-md">
        {error.message || "An unexpected error occurred while rendering the dashboard. We've been notified and are looking into it."}
      </p>
      <div className="flex gap-4">
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
        >
          Refresh Page
        </Button>
        <Button 
          onClick={() => reset()} 
          className="bg-[var(--color-negative)] text-white hover:bg-[var(--color-negative)]/90"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    </div>
  );
}
