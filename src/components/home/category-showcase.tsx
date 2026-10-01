import Link from "next/link";
import {
  AppWindow,
  Cpu,
  HardDrive,
  Laptop,
  Monitor,
  Mouse,
  Network,
  Server,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category } from "@/modules/categories/types";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "cat-laptops": Laptop,
  "cat-desktops": Server,
  "cat-storage": HardDrive,
  "cat-networking": Network,
  "cat-components": Cpu,
  "cat-monitors": Monitor,
  "cat-accessories": Mouse,
  "cat-software": AppWindow,
};

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-10">
      <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
        Shop by Category
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category.id] ?? Laptop;
          return (
            <Link
              key={category.id}
              href="/feed"
              className="border-border bg-card hover:bg-primary/5 flex flex-col items-center gap-2 rounded-md border p-4 text-center transition-colors"
            >
              <Icon className="text-primary size-6" aria-hidden />
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
    </section>
  );
}
