import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_SEARCHES = ["ThinkPad", "MacBook Pro", "RTX 4090", "SSD 1TB"];

/** The big search box under the header. A plain GET form to /search. */
export function HomeSearch({ className }: { className?: string }) {
  return (
    <div className={className}>
      <form
        action="/search"
        role="search"
        className="border-border flex items-center gap-2 rounded-2xl border bg-white p-1.5 shadow-[0_6px_22px_rgba(71,42,170,0.08)] focus-within:border-[#b9a6ff]"
      >
        <Search className="text-muted-foreground ml-3 size-5 shrink-0" />
        <input
          type="search"
          name="q"
          placeholder="Search model or part number…"
          aria-label="Search the market"
          className="placeholder:text-muted-foreground h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary/90 h-11 shrink-0 rounded-xl px-5 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>
      <div
        className={cn(
          "mt-2.5 flex [scrollbar-width:none] items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden",
        )}
      >
        <span className="text-muted-foreground shrink-0 text-xs">Popular:</span>
        {QUICK_SEARCHES.map((term) => (
          <Link
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            className="text-foreground shrink-0 rounded-full border border-[#e6e0ff] bg-white px-3 py-1 text-xs font-medium hover:border-[#b9a6ff]"
          >
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
}
