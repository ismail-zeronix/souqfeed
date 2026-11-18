import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categoryIcon } from "@/components/home/category-showcase";
import { PageBanner } from "@/components/layout/page-banner";
import { getCategoryMenu } from "@/modules/categories/menu";
import { categoryHref } from "@/modules/categories/menu-shared";
import { countLiveOffersByCategory } from "@/modules/offers/live";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IT categories — Browse the market",
  description:
    "Every IT category on SouqFeed, from laptops and servers to networking and storage, with their subcategories.",
};

const TONES = [
  "bg-[#efeaff] text-[#6c42f5]",
  "bg-[#e3f3ff] text-[#1f7fc4]",
  "bg-[#e4f7ec] text-[#1b8f50]",
  "bg-[#fff1df] text-[#c46a14]",
  "bg-[#ffe9ef] text-[#c43a64]",
  "bg-[#f1efe8] text-[#6b6255]",
];

async function liveCounts(): Promise<Map<string, number>> {
  try {
    return await countLiveOffersByCategory();
  } catch {
    return new Map();
  }
}

export default async function CategoriesPage() {
  const [menu, counts] = await Promise.all([getCategoryMenu(), liveCounts()]);
  const showCounts = [...counts.values()].some((n) => n > 0);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-5 md:px-5 md:py-8">
      <PageBanner
        eyebrow="Browse the market"
        title="Every IT category"
        description="Pick a category to see live offers, or go straight to a subcategory."
        mascot="searching"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {menu.map((category, i) => {
          const Icon = categoryIcon(category);
          const count = counts.get(category.id) ?? 0;
          return (
            <section
              key={category.slug}
              className="flex flex-col rounded-3xl border border-[#e6e0ff] bg-white p-5 shadow-[0_6px_20px_rgba(71,42,170,0.05)]"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${TONES[i % TONES.length]}`}
                >
                  <Icon className="size-6" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-foreground truncate text-lg leading-tight font-extrabold">
                    <Link href={categoryHref(category)}>{category.name}</Link>
                  </h2>
                  {showCounts && (
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {count} live {count === 1 ? "offer" : "offers"}
                    </p>
                  )}
                </div>
              </div>

              {category.children.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {category.children.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={categoryHref(child)}
                        className="text-foreground/80 hover:bg-primary/10 hover:text-primary block rounded-full bg-[#f5f2ff] px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href={categoryHref(category)}
                className="text-primary mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold"
              >
                View all {category.name}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </section>
          );
        })}
      </div>
    </div>
  );
}
