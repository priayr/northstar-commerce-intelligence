"use client";

import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-[var(--color-negative)]/20 bg-[var(--color-negative)]/5 rounded-xl my-4 w-full h-full min-h-[300px]">
      <div className="w-12 h-12 bg-[var(--color-negative)]/10 text-[var(--color-negative)] rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Something went wrong rendering this component</h3>
      <p className="text-[var(--color-text-secondary)] mb-6 max-w-md">
        {error.message || "An unexpected error occurred."}
      </p>
      <Button 
        onClick={resetErrorBoundary} 
        variant="outline" 
        className="border-[var(--color-negative)]/50 text-[var(--color-negative)] hover:bg-[var(--color-negative)]/10"
      >
        <RefreshCw className="w-4 h-4 mr-2" /> Retry
      </Button>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
