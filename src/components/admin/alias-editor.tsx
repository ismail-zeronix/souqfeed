"use client";

import { useActionState } from "react";
import { AdminActionButton } from "@/components/admin/admin-action-button";
import { Button } from "@/components/ui/button";
import { FormMessage, TextField } from "@/components/ui/form-field";
import { addAliasAction, removeAliasAction } from "@/modules/products/actions";
import type { AliasFormState } from "@/modules/products/types";

const INITIAL_STATE: AliasFormState = { status: "idle" };

export function AliasEditor({
  productId,
  aliases,
}: {
  productId: string;
  aliases: { id: string; alias: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    addAliasAction,
    INITIAL_STATE,
  );
  const alias =
    state.status === "error" && state.values ? state.values.alias : "";

  return (
    <div className="flex flex-col gap-4">
      {aliases.length === 0 ? (
        <p className="text-muted-foreground text-sm">No aliases yet.</p>
      ) : (
        <ul className="divide-border divide-y">
          {aliases.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span className="min-w-0 break-words">{item.alias}</span>
              <AdminActionButton
                label="Remove"
                action={() => removeAliasAction(productId, item.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="productId" value={productId} />
        <div key={alias}>
          <TextField
            label="Add alias"
            name="alias"
            required
            placeholder="E14 G7"
            defaultValue={alias}
            error={state.fieldErrors?.alias}
            hint="Other ways suppliers write this product in their broadcasts."
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? "Adding..." : "Add alias"}
          </Button>
          <FormMessage status={state.status} message={state.message} />
        </div>
      </form>
    </div>
  );
}
