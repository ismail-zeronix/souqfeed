import type { CategoryMixSlice } from "@/modules/suppliers/types";

const COLORS = ["#0F6B45", "#2A5C8A", "#16A34A", "#6B7280", "#9CA3AF", "#DC2626"];
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CategoryMixDonut({ slices, totalLabel }: { slices: CategoryMixSlice[]; totalLabel: string }) {
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg viewBox="0 0 100 100" className="size-28 shrink-0 -rotate-90">
        {slices.map((slice, index) => {
          const length = (slice.sharePercent / 100) * CIRCUMFERENCE;
          const dashArray = `${length} ${CIRCUMFERENCE - length}`;
          const dashOffset = -offset;
          offset += length;
          return (
            <circle
              key={slice.categoryId}
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={COLORS[index % COLORS.length]}
              strokeWidth="14"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
            />
          );
        })}
      </svg>
      <div className="flex min-w-0 flex-col gap-1 text-xs">
        <span className="text-sm font-semibold text-foreground">{totalLabel}</span>
        {slices.map((slice, index) => (
          <div key={slice.categoryId} className="flex items-center gap-1.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
              aria-hidden
            />
            <span className="truncate text-muted-foreground">{slice.categoryName}</span>
            <span className="tabular-nums text-foreground">{slice.sharePercent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
