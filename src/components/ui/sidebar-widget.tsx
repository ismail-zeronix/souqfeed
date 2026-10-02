import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SidebarWidget({
  title,
  icon: Icon,
  showViewAll = false,
  liveIndicator = false,
  children,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  showViewAll?: boolean;
  liveIndicator?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("border-border bg-card rounded-md border p-4", className)}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-full">
              <Icon className="size-3.5" aria-hidden />
            </span>
          )}
          <h3 className="text-foreground text-sm font-semibold">{title}</h3>
          {liveIndicator && (
            <span className="text-live flex items-center gap-1 text-xs font-medium">
              <span className="bg-live size-1.5 rounded-full" aria-hidden />
              Live
            </span>
          )}
        </div>
        {showViewAll && (
          <span className="text-muted-foreground text-xs font-medium">
            View all
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
