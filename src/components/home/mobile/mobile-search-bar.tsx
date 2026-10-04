"use client";

import { type FormEvent, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function MobileSearchBar() {
  const router = useRouter();
  const searchId = useId();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/feed?q=${encodeURIComponent(trimmed)}` : "/feed");
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-4">
      <label htmlFor={searchId} className="sr-only">
        Search the market
      </label>
      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          id={searchId}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search model, SKU, part number, specification..."
          enterKeyHint="search"
          className="h-12 rounded-xl pl-10 text-sm"
        />
      </div>
    </form>
  );
}
