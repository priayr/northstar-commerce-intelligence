import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12 w-full max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64 bg-[var(--color-surface-2)]" />
        <Skeleton className="h-4 w-48 bg-[var(--color-surface-2)]" />
      </div>
      
      {/* KPI Row Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)]" />
        ))}
      </div>
      
      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-[350px] rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)]" />
        <Skeleton className="h-[350px] rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)]" />
      </div>
      
      {/* Full width table skeleton */}
      <Skeleton className="h-[400px] rounded-xl w-full bg-[var(--color-surface-1)] border border-[var(--color-border)]" />
    </div>
  );
}
