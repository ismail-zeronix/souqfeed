import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SidebarWidget({
  title,
  showViewAll = false,
  liveIndicator = false,
  children,
  className,
}: {
  title: string;
  showViewAll?: boolean;
  liveIndicator?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {liveIndicator && (
            <span className="flex items-center gap-1 text-xs font-medium text-live">
              <span className="size-1.5 rounded-full bg-live" aria-hidden />
              Live
            </span>
          )}
        </div>
        {showViewAll && <span className="text-xs font-medium text-muted-foreground">View all</span>}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
