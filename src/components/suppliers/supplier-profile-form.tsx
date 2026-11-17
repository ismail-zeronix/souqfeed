"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FormMessage, TextField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createOwnSupplierProfile,
  updateOwnSupplierProfile,
} from "@/modules/suppliers/actions";
import type {
  SupplierFormState,
  SupplierFormValues,
} from "@/modules/suppliers/types";

const INITIAL_STATE: SupplierFormState = { status: "idle" };

function OptionGroup({
  legend,
  name,
  options,
  selectedIds,
  error,
}: {
  legend: string;
  name: "brandIds" | "categoryIds";
  options: { id: string; name: string }[];
  selectedIds: string[];
  error?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-sm font-medium">{legend}</legend>
      {options.length === 0 && (
        <p className="text-muted-foreground text-sm">None available yet.</p>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex min-w-0 items-center gap-2 text-sm"
          >
            {/* Native on purpose: it submits and resets with the form with no extra state. */}
            <input
              type="checkbox"
              name={name}
              value={option.id}
              defaultChecked={selectedIds.includes(option.id)}
              className="accent-primary size-4 shrink-0"
            />
            <span className="truncate">{option.name}</span>
          </label>
        ))}
      </div>
      <FieldError id={`${name}-error`} message={error} />
    </fieldset>
  );
}

export function SupplierProfileForm({
  mode,
  initialValues,
  brands,
  categories,
}: {
  mode: "create" | "edit";
  initialValues: SupplierFormValues;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const action =
    mode === "create" ? createOwnSupplierProfile : updateOwnSupplierProfile;
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  // React resets a form after its action runs, so a rejected submission must
  // become the new defaults or the supplier would lose everything they typed.
  const values =
    state.status === "error" && state.values ? state.values : initialValues;
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Remounting gives the inputs new defaults without changing a mounted
          input's default, which Base UI's field control warns about. */}
      <div key={JSON.stringify(values)} className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Company name"
            name="companyName"
            required
            defaultValue={values.companyName}
            error={errors.companyName}
            hint={
              mode === "edit"
                ? "Renaming keeps your existing public link."
                : undefined
            }
          />
          <TextField
            label="WhatsApp number"
            name="whatsappNumber"
            type="tel"
            required
            placeholder="+971 50 123 4567"
            defaultValue={values.whatsappNumber}
            error={errors.whatsappNumber}
            hint="Buyers contact you here. Include the country code."
          />
          <TextField
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={values.phone}
            error={errors.phone}
          />
          <TextField
            label="Email"
            name="email"
            defaultValue={values.email}
            error={errors.email}
          />
          <TextField
            label="Website"
            name="website"
            placeholder="https://"
            defaultValue={values.website}
            error={errors.website}
          />
          <TextField
            label="Location"
            name="locationName"
            placeholder="Bur Dubai"
            defaultValue={values.locationName}
            error={errors.locationName}
          />
          <TextField
            label="Address"
            name="address"
            defaultValue={values.address}
            error={errors.address}
          />
          <TextField
            label="Google Maps link"
            name="googleMapsUrl"
            placeholder="https://"
            defaultValue={values.googleMapsUrl}
            error={errors.googleMapsUrl}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={values.description}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "description-error" : undefined
            }
          />
          <FieldError id="description-error" message={errors.description} />
        </div>

        <OptionGroup
          legend="Brands you carry"
          name="brandIds"
          options={brands}
          selectedIds={values.brandIds}
          error={errors.brandIds}
        />
        <OptionGroup
          legend="Categories you carry"
          name="categoryIds"
          options={categories}
          selectedIds={values.categoryIds}
          error={errors.categoryIds}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving..."
            : mode === "create"
              ? "Create profile"
              : "Save changes"}
        </Button>
        <FormMessage status={state.status} message={state.message} />
      </div>
    </form>
  );
}
