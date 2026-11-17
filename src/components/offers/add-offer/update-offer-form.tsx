"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-field";
import {
  submitManualOfferAction,
  type ManualOfferFormState,
} from "@/modules/broadcasts/manual/actions";
import type { OfferPrefill } from "@/modules/broadcasts/manual/queries";
import {
  OfferDetailsFields,
  type OfferDetailsDefaults,
} from "./offer-details-fields";

const INITIAL_STATE: ManualOfferFormState = { status: "idle" };

function defaultsFrom(
  prefill: OfferPrefill,
  values: Record<string, string> | undefined,
): OfferDetailsDefaults {
  if (values) {
    return {
      condition: values.condition ?? "",
      priceMode: values.priceMode === "ask" ? "ask" : "fixed",
      price: values.price ?? "",
      currency: values.currency ?? "AED",
      quantity: values.quantity ?? "",
      warranty: values.warranty ?? "",
      notes: values.notes ?? "",
    };
  }
  return {
    condition: prefill.condition ?? "",
    priceMode: prefill.price === null ? "ask" : "fixed",
    price: prefill.price ?? "",
    currency: prefill.currency ?? "AED",
    quantity: prefill.quantity === null ? "" : String(prefill.quantity),
    warranty: prefill.warranty ?? "",
    notes: prefill.notes ?? "",
  };
}

/**
 * New price and stock for an existing offer. Submits like any form offer, so
 * the change is recorded as a new observation in the offer's history.
 */
export function UpdateOfferForm({
  offerId,
  prefill,
}: {
  offerId: string;
  prefill: OfferPrefill;
}) {
  const [state, formAction, pending] = useActionState(
    submitManualOfferAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="grid gap-5">
      <input type="hidden" name="updating" value={offerId} />
      <input type="hidden" name="productId" value={prefill.product.id} />
      <input type="hidden" name="brandId" value={prefill.brandId} />
      <input type="hidden" name="categoryId" value={prefill.categoryId ?? ""} />
      <OfferDetailsFields
        defaults={defaultsFrom(prefill, state.values)}
        errors={state.fieldErrors ?? {}}
        conditionHint="Changing the condition lists this as a separate offer, e.g. the same model new and refurbished."
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          <Send aria-hidden />
          {pending ? "Saving…" : "Publish update"}
        </Button>
        <FormMessage status={state.status} message={state.message} />
      </div>
    </form>
  );
}
