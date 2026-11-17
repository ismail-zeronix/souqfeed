"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage, TextField } from "@/components/ui/form-field";
import { saveBrandAction } from "@/modules/brands/actions";
import type { BrandFormState } from "@/modules/brands/types";

const INITIAL_STATE: BrandFormState = { status: "idle" };

export function BrandForm({
  brand,
}: {
  brand?: { id: string; name: string; slug: string };
}) {
  const [state, formAction, pending] = useActionState(
    saveBrandAction,
    INITIAL_STATE,
  );
  const name =
    state.status === "error" && state.values
      ? state.values.name
      : (brand?.name ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {brand && <input type="hidden" name="id" value={brand.id} />}
      <div key={name}>
        <TextField
          label="Brand name"
          name="name"
          required
          defaultValue={name}
          error={state.fieldErrors?.name}
          hint={
            brand
              ? `Renaming keeps the link name "${brand.slug}".`
              : "The link name is set once from this."
          }
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : brand ? "Save changes" : "Add brand"}
        </Button>
        {brand && (
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/brands" />}
          >
            Cancel
          </Button>
        )}
        <FormMessage status={state.status} message={state.message} />
      </div>
    </form>
  );
}
