import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

/**
 * One numbered step of the add-offer form. Closed steps keep their content
 * mounted (only hidden), so typed values survive moving between steps.
 */
export function Step({
  number,
  title,
  summary,
  open,
  done,
  onEdit,
  children,
}: {
  number: number;
  title: string;
  summary?: ReactNode;
  open: boolean;
  done: boolean;
  onEdit?: () => void;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`step-${number}-title`}
      className={cn(
        "bg-card rounded-xl border transition-shadow",
        open && "ring-primary/25 shadow-sm ring-2",
      )}
    >
      <header className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            done && !open
              ? "bg-primary text-primary-foreground"
              : open
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
          )}
          aria-hidden
        >
          {done && !open ? <Check className="size-4" /> : number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`step-${number}-title`} className="text-sm font-semibold">
            {title}
          </h2>
          {!open && summary && (
            <p className="text-muted-foreground truncate text-sm">{summary}</p>
          )}
        </div>
        {!open && done && onEdit && (
          <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
            Change
          </Button>
        )}
      </header>
      <div hidden={!open} className="border-t px-4 py-4 sm:px-5">
        {children}
      </div>
    </section>
  );
}
