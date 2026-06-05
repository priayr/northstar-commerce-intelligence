"use client";

import { useState } from "react";
import { CsvUploader } from "@/components/ui/csv-uploader";
import { ChartCard } from "@/components/ui/chart-card";
import { Button } from "@/components/ui/button";
import { DatabaseBackup, RotateCcw } from "lucide-react";

export default function DataStudioPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset the database? All custom imported data will be lost and replaced with the demo dataset.")) {
      return;
    }
    
    setIsResetting(true);
    setResetMessage(null);
    
    try {
      const res = await fetch("/api/reset-db", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Reset failed");
      
      setResetMessage("Database successfully reset. Please refresh the page.");
    } catch (err: any) {
      setResetMessage(err.message || "Failed to reset database");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-text-primary">Data Studio</h1>
          <p className="text-sm text-text-secondary mt-1">Manage data pipelines, imports, and integrations.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {resetMessage && (
            <span className="text-sm font-medium text-[var(--color-success)]">{resetMessage}</span>
          )}
          <Button 
            variant="outline" 
            onClick={handleReset} 
            disabled={isResetting}
            className="border-[var(--color-warning)]/50 text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10"
          >
            <RotateCcw className={`w-4 h-4 mr-2 ${isResetting ? "animate-spin" : ""}`} />
            {isResetting ? "Resetting..." : "Reset to Demo Data"}
          </Button>
        </div>
      </div>

      <ChartCard
        title="CSV Batch Import"
        subtitle="Upload raw transaction or order data to update your analytics models. Client-side validation ensures schema compatibility before uploading."
      >
        <div className="pt-6 pb-2">
          <CsvUploader />
        </div>
      </ChartCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard
          title="Active Integrations"
          subtitle="Data sources connected to Northstar"
        >
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center justify-between p-3 border border-[var(--color-border-strong)] rounded-lg bg-[var(--color-surface-1)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">S</div>
                <div>
                  <p className="font-semibold text-sm">Shopify API</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Last synced: 2 mins ago</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full font-medium">Active</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-0)] opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5469D4] flex items-center justify-center text-white font-bold">St</div>
                <div>
                  <p className="font-semibold text-sm">Stripe Billing</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Requires authentication</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] rounded-full font-medium">Disconnected</span>
            </div>
          </div>
        </ChartCard>
        
        <ChartCard
          title="Data Health"
          subtitle="Status of your analytics database"
        >
          <div className="flex items-start gap-4 mt-4">
            <div className="p-3 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-lg">
              <DatabaseBackup className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">SQLite Database (Prisma)</h4>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 mb-3">All schema migrations are up to date. Python FastAPI layer has successfully mapped the local dataset.</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Storage Used</span>
                  <span className="font-medium">24 MB / 1 GB</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-accent)] w-[2.4%]"></div>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
