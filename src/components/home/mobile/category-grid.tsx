import Link from "next/link";
import { IconDeviceLaptop } from "@tabler/icons-react";
import { CATEGORY_ICONS } from "@/components/home/category-showcase";
import type { Category } from "@/modules/categories/types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="px-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          Browse by Category
        </h2>
        <Link href="/feed" className="text-primary text-xs font-medium">
          See All
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category.id] ?? IconDeviceLaptop;
          return (
            <Link
              key={category.id}
              href={`/feed?category=${category.id}`}
              className="border-border bg-card flex flex-col items-center gap-1 rounded-xl border px-1 py-3 text-center"
            >
              <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full">
                <Icon className="size-4.5" aria-hidden />
              </span>
              <span className="text-foreground truncate text-[11px] font-medium">
                {category.name}
              </span>
              <span className="text-muted-foreground text-[10px] tabular-nums">
                {category.offerCount}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
