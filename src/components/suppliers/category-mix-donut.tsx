import type { CategoryMixSlice } from "@/modules/suppliers/types";

const COLORS = [
  "#0F6B45",
  "#2A5C8A",
  "#16A34A",
  "#6B7280",
  "#9CA3AF",
  "#DC2626",
];
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface DonutArc {
  categoryId: string;
  color: string;
  dashArray: string;
  dashOffset: number;
}

function toDonutArcs(slices: CategoryMixSlice[]): DonutArc[] {
  let cumulative = 0;
  return slices.map((slice, index) => {
    const length = (slice.sharePercent / 100) * CIRCUMFERENCE;
    const arc: DonutArc = {
      categoryId: slice.categoryId,
      color: COLORS[index % COLORS.length],
      dashArray: `${length} ${CIRCUMFERENCE - length}`,
      dashOffset: -cumulative,
    };
    cumulative += length;
    return arc;
  });
}

export function CategoryMixDonut({
  slices,
  totalLabel,
}: {
  slices: CategoryMixSlice[];
  totalLabel: string;
}) {
  const arcs = toDonutArcs(slices);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg viewBox="0 0 100 100" className="size-28 shrink-0 -rotate-90">
        {arcs.map((arc) => (
          <circle
            key={arc.categoryId}
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={arc.color}
            strokeWidth="14"
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
          />
        ))}
      </svg>
      <div className="flex min-w-0 flex-col gap-1 text-xs">
        <span className="text-foreground text-sm font-semibold">
          {totalLabel}
        </span>
        {slices.map((slice, index) => (
          <div key={slice.categoryId} className="flex items-center gap-1.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
              aria-hidden
            />
            <span className="text-muted-foreground truncate">
              {slice.categoryName}
            </span>
            <span className="text-foreground tabular-nums">
              {slice.sharePercent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
