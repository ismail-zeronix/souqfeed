import Link from "next/link";
import { LOCATION_NAMES } from "@/modules/offers/constants";
import type { Category } from "@/modules/categories/types";

const LOCATION_ALIASES: Record<string, string> = {
  "Al Fahidi": "Al Fahidi — Al Raffa St.",
  "Bur Dubai": "Bur Dubai — Al Ain Centre / Computer Plaza",
};

export function LocationCategoryLinks({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <section className="border-border mx-auto w-full max-w-[1440px] border-t px-6 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
        <div className="flex-1">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Suppliers by category
          </h2>
          <nav className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm">
            {categories.map((category, index) => (
              <span key={category.id} className="flex items-center gap-3">
                {index > 0 && (
                  <span className="text-muted-foreground/40" aria-hidden>
                    ·
                  </span>
                )}
                <Link
                  href={`/feed?category=${category.id}`}
                  className="text-muted-foreground hover:text-primary hover:underline"
                >
                  {category.name}
                </Link>
              </span>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Suppliers by area
          </h2>
          <nav className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm">
            {LOCATION_NAMES.map((location, index) => (
              <span key={location} className="flex items-center gap-3">
                {index > 0 && (
                  <span className="text-muted-foreground/40" aria-hidden>
                    ·
                  </span>
                )}
                <Link
                  href={`/feed?location=${encodeURIComponent(location)}`}
                  className="text-muted-foreground hover:text-primary hover:underline"
                >
                  {LOCATION_ALIASES[location] ?? location}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
      <p className="text-muted-foreground/70 mt-4 text-xs">
        Early coverage — more areas and categories expand as suppliers join.
      </p>
    </section>
  );
}
