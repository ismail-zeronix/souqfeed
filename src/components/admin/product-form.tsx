"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  FormMessage,
  SelectField,
  TextField,
} from "@/components/ui/form-field";
import { saveProductAction } from "@/modules/products/actions";
import { SPEC_FIELDS } from "@/modules/products/normalize";
import type {
  ProductFormState,
  ProductFormValues,
} from "@/modules/products/types";

const INITIAL_STATE: ProductFormState = { status: "idle" };

export function ProductForm({
  productId,
  initialValues,
  brands,
  categories,
}: {
  productId?: string;
  initialValues: ProductFormValues;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string; depth: number }[];
}) {
  const [state, formAction, pending] = useActionState(
    saveProductAction,
    INITIAL_STATE,
  );
  const values =
    state.status === "error" && state.values ? state.values : initialValues;
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {productId && <input type="hidden" name="id" value={productId} />}
      {/* Remounting gives the inputs new defaults without changing a mounted
          input's default, which Base UI's field control warns about. */}
      <div key={JSON.stringify(values)} className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Brand"
            name="brandId"
            required
            defaultValue={values.brandId}
            error={errors.brandId}
          >
            <option value="">Choose a brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Category"
            name="categoryId"
            defaultValue={values.categoryId}
            error={errors.categoryId}
          >
            <option value="">Not set</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {`${"— ".repeat(category.depth)}${category.name}`}
              </option>
            ))}
          </SelectField>
          <div className="sm:col-span-2">
            <TextField
              label="Title"
              name="title"
              required
              placeholder="Lenovo ThinkPad E14 Gen 7"
              defaultValue={values.title}
              error={errors.title}
            />
          </div>
          <TextField
            label="Family"
            name="family"
            placeholder="ThinkPad E14"
            defaultValue={values.family}
            error={errors.family}
          />
          <TextField
            label="Model"
            name="model"
            placeholder="E14 Gen 7"
            defaultValue={values.model}
            error={errors.model}
          />
          <TextField
            label="Part number"
            name="partNumber"
            placeholder="21U20063GR"
            defaultValue={values.partNumber}
            error={errors.partNumber}
            hint="Only enter a real part number. Matching trusts it completely."
          />
        </div>

        <fieldset>
          <legend className="mb-1 text-sm font-medium">Specifications</legend>
          <p className="text-muted-foreground mb-3 text-xs">
            Leave anything you don&apos;t know blank.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SPEC_FIELDS.map(({ key, label }) => (
              <TextField
                key={key}
                label={label}
                name={key}
                defaultValue={values[key]}
                error={errors[key]}
              />
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : productId ? "Save changes" : "Add product"}
        </Button>
        <FormMessage status={state.status} message={state.message} />
      </div>
    </form>
  );
}
