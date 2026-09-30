import type { BroadcastActivityDay } from "@/modules/suppliers/types";

export function BroadcastActivityBars({
  days,
}: {
  days: BroadcastActivityDay[];
}) {
  const max = Math.max(...days.map((day) => day.count), 1);

  return (
    <div className="flex h-24 items-end gap-2">
      {days.map((day) => (
        <div
          key={day.label}
          className="flex flex-1 flex-col items-center gap-1"
        >
          <div
            className="bg-primary/70 w-full rounded-sm"
            style={{ height: `${Math.max(4, (day.count / max) * 72)}px` }}
            aria-hidden
          />
          <span className="text-muted-foreground text-[10px]">{day.label}</span>
        </div>
      ))}
    </div>
  );
}
