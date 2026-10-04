import type { ComponentType } from "react";
import Link from "next/link";
import {
  IconApps,
  IconCpu,
  IconDatabase,
  IconDeviceDesktop,
  IconDeviceLaptop,
  IconDeviceTv,
  IconMouse,
  IconRouter,
} from "@tabler/icons-react";
import type { Category } from "@/modules/categories/types";

export const CATEGORY_ICONS: Record<
  string,
  ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  "cat-laptops": IconDeviceLaptop,
  "cat-desktops": IconDeviceDesktop,
  "cat-storage": IconDatabase,
  "cat-networking": IconRouter,
  "cat-components": IconCpu,
  "cat-monitors": IconDeviceTv,
  "cat-accessories": IconMouse,
  "cat-software": IconApps,
};

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-10">
      <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
        Categories
      </h2>
      <div className="relative mt-4">
        <div
          className="flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="list"
        >
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.id] ?? IconDeviceLaptop;
            return (
              <Link
                key={category.id}
                href={`/feed?category=${category.id}`}
                role="listitem"
                className="group flex w-20 flex-none snap-start flex-col items-center gap-1.5 px-1 py-2 text-center sm:w-[6.5rem]"
              >
                <span className="bg-primary/10 text-primary group-hover:bg-primary flex size-11 items-center justify-center rounded-full transition-colors group-hover:text-white">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-foreground text-sm font-medium">
                  {category.name}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {category.offerCount} offers
                </span>
              </Link>
            );
          })}
        </div>
        <div
          className="from-background pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l to-transparent"
          aria-hidden
        />
      </div>
    </section>
  );
}
