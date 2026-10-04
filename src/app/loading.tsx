import { Skeleton } from "@/components/ui/skeleton";
import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6">
      <div className="flex justify-center py-6">
        <SouqFeedAgent state="loading" size="md" />
      </div>

      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="mt-2 h-7 w-1/2" />

      <Skeleton className="mt-6 h-12 w-full rounded-xl" />

      <div className="mt-3 flex gap-2">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 flex-1 rounded-xl" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-md" />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
