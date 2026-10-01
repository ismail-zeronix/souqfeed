import { Skeleton } from "@/components/ui/skeleton";

function TickerSkeletonRow() {
  return (
    <div className="border-border bg-card flex flex-col gap-2 rounded-md border px-4 py-2.5">
      <Skeleton className="h-3 w-40" />
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function TickerSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, index) => (
        <TickerSkeletonRow key={index} />
      ))}
    </div>
  );
}
