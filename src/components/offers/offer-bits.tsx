"use client";

import { useState, useTransition } from "react";
import { PackageX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { withdrawOfferAction } from "@/modules/offers/actions";
import {
  FRESHNESS_LABELS,
  freshnessOf,
  type Freshness,
} from "@/modules/offers/freshness";

const FRESHNESS_VARIANTS: Record<
  Freshness,
  "default" | "secondary" | "outline" | "destructive"
> = {
  LIVE: "default",
  RECENT: "secondary",
  STALE: "outline",
  VERY_STALE: "destructive",
};

export function FreshnessBadge({
  lastVerifiedAt,
}: {
  lastVerifiedAt: Date | null;
}) {
  if (!lastVerifiedAt) return null;
  const freshness = freshnessOf(lastVerifiedAt);
  return (
    <Badge variant={FRESHNESS_VARIANTS[freshness]} suppressHydrationWarning>
      {FRESHNESS_LABELS[freshness]}
    </Badge>
  );
}

export function WithdrawOfferButton({ offerId }: { offerId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Mark this offer as sold out and remove it?"))
            return;
          setError(null);
          startTransition(async () => {
            const result = await withdrawOfferAction(offerId);
            if (!result.ok) setError(result.message);
          });
        }}
      >
        <PackageX aria-hidden />
        {pending ? "Withdrawing..." : "Sold out"}
      </Button>
      {error && (
        <span role="alert" className="text-destructive text-xs">
          {error}
        </span>
      )}
    </span>
  );
}
