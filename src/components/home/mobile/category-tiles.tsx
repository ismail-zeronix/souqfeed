"use client";

import Link from "next/link";
import { IconLayoutGrid } from "@tabler/icons-react";
import { ChevronRight } from "lucide-react";
import { categoryIcon } from "@/components/home/category-showcase";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Category } from "@/modules/categories/types";

const TONES = [
  "bg-[#efeaff] text-[#6c42f5]",
  "bg-[#e3f3ff] text-[#1f7fc4]",
  "bg-[#e4f7ec] text-[#1b8f50]",
  "bg-[#fff1df] text-[#c46a14]",
  "bg-[#ffe9ef] text-[#c43a64]",
  "bg-[#f1efe8] text-[#6b6255]",
];

/** Seven categories in a 4-column icon grid; the eighth slot opens a bottom sheet with every category. */
const VISIBLE = 7;

export function CategoryTiles({ categories }: { categories: Category[] }) {
  const shown = categories.slice(0, VISIBLE);
  const hasMore = categories.length > VISIBLE;

  return (
    <section className="px-4 pt-6">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-foreground text-lg font-extrabold tracking-tight">
          Browse by category
        </h2>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-x-2 gap-y-4">
        {shown.map((category, i) => {
          const Icon = categoryIcon(category);
          return (
            <Link
              key={category.id}
              href={`/feed?category=${category.id}`}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <span
                className={`flex size-14 items-center justify-center rounded-[1.1rem] ${TONES[i % TONES.length]}`}
              >
                <Icon className="size-6" aria-hidden />
              </span>
              <span className="text-foreground w-full truncate text-[12px] leading-4 font-medium">
                {category.name}
              </span>
            </Link>
          );
        })}

        <Sheet>
          <SheetTrigger
            render={
              <button
                type="button"
                className="flex flex-col items-center gap-1.5 text-center"
              />
            }
          >
            <span className="bg-primary flex size-14 items-center justify-center rounded-[1.1rem] text-white">
              <IconLayoutGrid className="size-6" aria-hidden />
            </span>
            <span className="text-primary w-full truncate text-[12px] leading-4 font-semibold">
              {hasMore ? "More" : "All"}
            </span>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[85dvh] rounded-t-[1.75rem] pb-[env(safe-area-inset-bottom)]"
          >
            <SheetHeader className="px-5 pt-5 pb-0">
              <div
                className="bg-border mx-auto mb-3 h-1.5 w-10 rounded-full"
                aria-hidden
              />
              <SheetTitle className="font-display text-lg font-extrabold">
                All categories
              </SheetTitle>
              <SheetDescription>
                Pick one to see its live offers.
              </SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto px-3 pb-6">
              <Link
                href="/feed"
                className="bg-primary/10 text-primary mb-1 flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold"
              >
                See every offer
                <ChevronRight className="size-4" aria-hidden />
              </Link>
              <ul>
                {categories.map((category, i) => {
                  const Icon = categoryIcon(category);
                  return (
                    <li key={category.id}>
                      <Link
                        href={`/feed?category=${category.id}`}
                        className="active:bg-muted flex items-center gap-3 rounded-2xl px-3 py-2.5"
                      >
                        <span
                          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${TONES[i % TONES.length]}`}
                        >
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-foreground block truncate text-[15px] font-semibold">
                            {category.name}
                          </span>
                          <span className="text-muted-foreground text-xs tabular-nums">
                            {category.offerCount} offers
                          </span>
                        </span>
                        <ChevronRight
                          className="text-muted-foreground size-4"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
