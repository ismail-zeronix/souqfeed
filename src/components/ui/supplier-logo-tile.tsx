import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "size-9 text-sm",
  md: "size-12 text-base",
  lg: "size-20 text-2xl",
} as const;

export function SupplierLogoTile({
  initial,
  size = "md",
  className,
}: {
  initial: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border border-border bg-muted font-semibold text-primary",
        SIZE_CLASSES[size],
        className,
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}
