"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchProductsAction } from "@/modules/broadcasts/review-actions";

type Result = Awaited<ReturnType<typeof searchProductsAction>>[number];

/** Searches the catalog and hands the chosen product back. */
export function ProductPicker({
  itemId,
  initialQuery,
  disabled,
  onChoose,
}: {
  itemId: string;
  initialQuery: string;
  disabled: boolean;
  onChoose: (productId: string) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Result[] | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      searchProductsAction(itemId, query).then((rows) => {
        if (!cancelled) setResults(rows);
      });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [itemId, query]);

  const shown = query.trim().length < 2 ? null : results;

  return (
    <div className="bg-muted/40 mt-3 rounded-lg border p-3">
      <div className="relative">
        <Search
          className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the catalog by title or part number"
          aria-label="Search the catalog"
          className="bg-background pl-8"
        />
      </div>
      {shown && (
        <ul className="mt-2 max-h-64 overflow-auto">
          {shown.length === 0 ? (
            <li className="text-muted-foreground px-2 py-3 text-sm">
              No catalog products match.
            </li>
          ) : (
            shown.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChoose(product.id)}
                  className="hover:bg-background w-full rounded-md px-2 py-2 text-left text-sm disabled:opacity-50"
                >
                  <span className="font-medium">{product.title}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {product.brandName}
                    {product.partNumber && ` · ${product.partNumber}`}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
