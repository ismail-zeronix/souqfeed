"use client";

import { useState, useTransition } from "react";
import { Check, PackagePlus, Replace, X } from "lucide-react";
import { ProductPicker } from "@/components/broadcasts/product-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminActionResult } from "@/lib/validation/form";
import {
  approveItemAction,
  chooseItemProductAction,
  createProductFromItemAction,
  rejectItemAction,
} from "@/modules/broadcasts/review-actions";
import type { BroadcastItemRow } from "@/modules/broadcasts/types";

const REVIEW_LABELS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  AUTO_APPROVED: { label: "Matched", variant: "default" },
  APPROVED: { label: "Approved", variant: "default" },
  NEEDS_REVIEW: { label: "Needs review", variant: "outline" },
  REJECTED: { label: "Skipped", variant: "secondary" },
};

const METHOD_LABELS: Record<string, string> = {
  PART_NUMBER: "part number",
  BRAND_MODEL: "brand + model",
  ALIAS: "known alias",
  BRAND_FAMILY_SPEC: "family + specs",
  FUZZY: "similar title",
  MANUAL: "chosen in review",
};

function priceText(item: BroadcastItemRow): string | null {
  if (item.price !== null) {
    return `${item.currency ?? ""} ${Number(item.price).toLocaleString("en-AE")}`.trim();
  }
  return item.priceType === "ASK" ? "Ask for price" : null;
}

export function ReviewItem({
  item,
  editable,
  canCreateProducts,
}: {
  item: BroadcastItemRow;
  editable: boolean;
  canCreateProducts: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  function run(action: () => Promise<AdminActionResult>) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) setError(result.message);
        else setPicking(false);
      } catch {
        setError("We couldn't reach the server. Please try again.");
      }
    });
  }

  const status = REVIEW_LABELS[item.reviewStatus ?? "NEEDS_REVIEW"];
  const reasons = Array.isArray(item.matchReasons)
    ? (item.matchReasons as unknown[]).filter(
        (r): r is string => typeof r === "string",
      )
    : [];
  const confidence = item.matchConfidence
    ? Math.round(Number(item.matchConfidence) * 100)
    : null;
  const specs = [
    item.cpu,
    item.ram,
    item.storage,
    item.gpu,
    item.display,
    item.os,
  ]
    .filter(Boolean)
    .join(" · ");
  const commercial = [
    item.quantity !== null ? `Qty ${item.quantity}` : null,
    priceText(item),
  ]
    .filter(Boolean)
    .join(" · ");
  const detected = [item.brand, item.model].filter(Boolean).join(" ");

  return (
    <li
      className={`px-4 py-4 ${item.reviewStatus === "REJECTED" ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{detected || "Unnamed product"}</p>
          <p
            className="text-muted-foreground mt-0.5 truncate font-mono text-[11px]"
            title={item.rawBlock ?? item.rawLine}
          >
            {item.rawLine.trim()}
          </p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {(specs || commercial || item.partNumber) && (
        <p className="text-muted-foreground mt-2 text-xs">
          {[item.partNumber && `P/N ${item.partNumber}`, specs, commercial]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      <div className="mt-3 rounded-lg border px-3 py-2 text-sm">
        {item.matchedProductId ? (
          <>
            <p>
              <span className="text-muted-foreground">Catalog product: </span>
              <span className="font-medium">{item.matchedProductTitle}</span>
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Matched by {METHOD_LABELS[item.matchMethod ?? ""] ?? "unknown"}
              {confidence !== null && ` · ${confidence}% confident`}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">No catalog product matched.</p>
        )}
        {item.matchedProductId && reasons.length > 0 && (
          <ul className="text-muted-foreground mt-1.5 list-disc pl-4 text-xs">
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
      </div>

      {editable && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.matchedProductId &&
            item.reviewStatus !== "APPROVED" &&
            item.reviewStatus !== "AUTO_APPROVED" && (
              <Button
                size="sm"
                disabled={pending}
                onClick={() => run(() => approveItemAction(item.id))}
              >
                <Check aria-hidden />
                Approve
              </Button>
            )}
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => setPicking((open) => !open)}
            aria-expanded={picking}
          >
            <Replace aria-hidden />
            {item.matchedProductId ? "Change product" : "Choose product"}
          </Button>
          {canCreateProducts && !item.matchedProductId && (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => run(() => createProductFromItemAction(item.id))}
            >
              <PackagePlus aria-hidden />
              Add to catalog
            </Button>
          )}
          {item.reviewStatus !== "REJECTED" && (
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => run(() => rejectItemAction(item.id))}
            >
              <X aria-hidden />
              Skip
            </Button>
          )}
        </div>
      )}
      {editable && picking && (
        <ProductPicker
          itemId={item.id}
          initialQuery={detected}
          disabled={pending}
          onChoose={(productId) =>
            run(() => chooseItemProductAction(item.id, productId))
          }
        />
      )}
      {error && (
        <p role="alert" className="text-destructive mt-2 text-xs">
          {error}
        </p>
      )}
    </li>
  );
}
