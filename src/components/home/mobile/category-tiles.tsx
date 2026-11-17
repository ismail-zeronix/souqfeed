import Link from "next/link";
import { IconLayoutGrid } from "@tabler/icons-react";
import { categoryIcon } from "@/components/home/category-showcase";
import type { Category } from "@/modules/categories/types";

const TILE_TONES = [
  "bg-[#efeaff] text-[#6c42f5]",
  "bg-[#e3f3ff] text-[#1f7fc4]",
  "bg-[#e4f7ec] text-[#1b8f50]",
  "bg-[#fff1df] text-[#c46a14]",
  "bg-[#ffe9ef] text-[#c43a64]",
  "bg-[#f1efe8] text-[#6b6255]",
];

const VISIBLE = 8;

/** Big soft tiles like an app home screen: eight categories and an "All" tile. */
export function CategoryTiles({ categories }: { categories: Category[] }) {
  const shown = categories.slice(0, VISIBLE);
  return (
    <section className="px-4 pt-6">
      <h2 className="font-display text-foreground text-lg font-extrabold tracking-tight">
        Browse by category
      </h2>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {shown.map((category, i) => {
          const Icon = categoryIcon(category);
          return (
            <Link
              key={category.id}
              href={`/feed?category=${category.id}`}
              className="flex aspect-[1/0.95] flex-col justify-between rounded-2xl border border-black/5 bg-white p-3 shadow-[0_4px_14px_rgba(71,42,170,0.05)]"
            >
              <span
                className={`flex size-10 items-center justify-center rounded-xl ${TILE_TONES[i % TILE_TONES.length]}`}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="text-foreground block truncate text-[13px] leading-4 font-semibold">
                  {category.name}
                </span>
                <span className="text-muted-foreground text-[11px] tabular-nums">
                  {category.offerCount} offers
                </span>
              </span>
            </Link>
          );
        })}
        <Link
          href="/feed"
          className="bg-primary flex aspect-[1/0.95] flex-col justify-between rounded-2xl p-3 text-white"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/20">
            <IconLayoutGrid className="size-5" aria-hidden />
          </span>
          <span className="text-[13px] leading-4 font-semibold">
            All categories
          </span>
        </Link>
      </div>
    </section>
  );
}
