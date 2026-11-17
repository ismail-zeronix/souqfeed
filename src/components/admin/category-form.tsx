"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  FormMessage,
  SelectField,
  TextField,
} from "@/components/ui/form-field";
import { saveCategoryAction } from "@/modules/categories/actions";
import { subtreeIds } from "@/modules/categories/hierarchy";
import type {
  AdminCategoryRow,
  CategoryFormState,
} from "@/modules/categories/types";

const INITIAL_STATE: CategoryFormState = { status: "idle" };

export function CategoryForm({
  category,
  allCategories,
}: {
  category?: AdminCategoryRow;
  allCategories: AdminCategoryRow[];
}) {
  const [state, formAction, pending] = useActionState(
    saveCategoryAction,
    INITIAL_STATE,
  );
  const values =
    state.status === "error" && state.values
      ? state.values
      : { name: category?.name ?? "", parentId: category?.parentId ?? "" };
  const excluded = category
    ? subtreeIds(allCategories, category.id)
    : new Set<string>();
  const parentOptions = allCategories.filter((row) => !excluded.has(row.id));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div key={JSON.stringify(values)} className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Category name"
          name="name"
          required
          defaultValue={values.name}
          error={state.fieldErrors?.name}
          hint={
            category
              ? `Renaming keeps the link name "${category.slug}".`
              : "The link name is set once from this."
          }
        />
        <SelectField
          label="Parent category"
          name="parentId"
          defaultValue={values.parentId}
          error={state.fieldErrors?.parentId}
        >
          <option value="">None (top level)</option>
          {parentOptions.map((row) => (
            <option key={row.id} value={row.id}>
              {`${"— ".repeat(row.depth)}${row.name}`}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : category ? "Save changes" : "Add category"}
        </Button>
        {category && (
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/categories" />}
          >
            Cancel
          </Button>
        )}
        <FormMessage status={state.status} message={state.message} />
      </div>
    </form>
  );
}
