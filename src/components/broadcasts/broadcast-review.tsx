"use client";

import { useState, useTransition } from "react";
import { Rocket } from "lucide-react";
import { ReviewItem } from "@/components/broadcasts/review-item";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminActionResult } from "@/lib/validation/form";
import {
  publishBroadcastAction,
  rejectUnmatchedAction,
} from "@/modules/broadcasts/review-actions";
import type { BroadcastItemRow } from "@/modules/broadcasts/types";

export function BroadcastReview({
  broadcastId,
  items,
  editable,
  canCreateProducts,
  fromForm = false,
}: {
  broadcastId: string;
  items: BroadcastItemRow[];
  editable: boolean;
  canCreateProducts: boolean;
  /** A form submission publishes itself once its product is decided. */
  fromForm?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const ready = items.filter(
    (item) =>
      item.reviewStatus === "APPROVED" || item.reviewStatus === "AUTO_APPROVED",
  ).length;
  const needsReview = items.filter(
    (item) => item.reviewStatus === "NEEDS_REVIEW",
  ).length;
  const skipped = items.filter(
    (item) => item.reviewStatus === "REJECTED",
  ).length;
  const unmatched = items.filter(
    (item) => !item.matchedProductId && item.reviewStatus !== "REJECTED",
  ).length;

  function run(action: () => Promise<AdminActionResult>) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) setMessage(result.message);
      } catch {
        setMessage("We couldn't reach the server. Please try again.");
      }
    });
  }

  return (
    <Card className="min-w-0 gap-0 pb-0">
      <CardHeader className="border-b">
        <CardTitle>{fromForm ? "Product" : "Products found"}</CardTitle>
        <CardDescription>
          {fromForm
            ? editable
              ? "Goes live as soon as it's matched to a catalog product."
              : "The catalog product this offer is listed under."
            : `${items.length} ${items.length === 1 ? "product" : "products"}: ${ready} ready · ${needsReview} need review · ${skipped} skipped. Unknown details stay blank; nothing is guessed.`}
        </CardDescription>
        {editable && !fromForm && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              disabled={pending || needsReview > 0 || ready === 0}
              onClick={() => run(() => publishBroadcastAction(broadcastId))}
            >
              <Rocket aria-hidden />
              Publish {ready} {ready === 1 ? "product" : "products"}
            </Button>
            {unmatched > 0 && (
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => run(() => rejectUnmatchedAction(broadcastId))}
              >
                Skip {unmatched} unmatched
              </Button>
            )}
            {needsReview > 0 && (
              <span className="text-muted-foreground text-xs">
                Approve, change, or skip the products that need review to
                publish.
              </span>
            )}
            {message && (
              <span role="alert" className="text-destructive text-xs">
                {message}
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-0">
        <ul className="divide-y">
          {items.map((item) => (
            <ReviewItem
              key={item.id}
              item={item}
              editable={editable}
              canCreateProducts={canCreateProducts}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
