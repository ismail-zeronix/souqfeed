import type { Category } from "@/modules/categories/types";

const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Al Ain",
  "Ras Al Khaimah",
  "Fujairah",
];

export function KeywordCloud({ categories }: { categories: Category[] }) {
  const terms = categories.flatMap((category, categoryIndex) =>
    EMIRATES.filter(
      (_, emirateIndex) => (categoryIndex + emirateIndex) % 3 === 0,
    ).map((emirate) => `${category.name} in ${emirate}`),
  );

  return (
    <section className="border-border bg-muted/30 border-t">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-8">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Popular Searches
        </h2>
        <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
          {terms.join("  ·  ")}
        </p>
      </div>
    </section>
  );
}
