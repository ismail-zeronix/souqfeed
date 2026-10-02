import type { CategoryPriceMovement } from "@/modules/offers/types";

export function PriceMovementChart({
  movements,
}: {
  movements: CategoryPriceMovement[];
}) {
  const sorted = [...movements].sort(
    (a, b) => b.changePercent - a.changePercent,
  );
  const max = Math.max(...sorted.map((m) => m.changePercent), 1);

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((movement) => {
        const widthPercent = (movement.changePercent / max) * 100;
        return (
          <div
            key={movement.categoryId}
            className="group flex items-center gap-3"
          >
            <span className="w-20 shrink-0 text-xs text-white/70">
              {movement.categoryName}
            </span>
            <div className="h-2.5 flex-1 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#E8B968] transition-[width,filter] duration-700 ease-out group-hover:brightness-110"
                style={{ width: `${widthPercent}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs font-semibold text-white tabular-nums">
              +{movement.changePercent}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
