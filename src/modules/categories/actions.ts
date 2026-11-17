"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/auth/session";
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "@/lib/database/errors";
import { logger } from "@/lib/logging/logger";
import {
  formText,
  isUuid,
  toFieldErrors,
  type AdminActionResult,
} from "@/lib/validation/form";
import { createCategory, deleteCategory, updateCategory } from "./service";
import type { CategoryFormState } from "./types";
import { categoryInputSchema } from "./validation";

function revalidateCategoryPages() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function saveCategoryAction(
  _previous: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  if (!(await isAdminRequest())) {
    return { status: "error", message: "Not authorized." };
  }

  const id = formText(formData, "id");
  const values = {
    name: formText(formData, "name"),
    parentId: formText(formData, "parentId"),
  };
  if (id && !isUuid(id)) {
    return { status: "error", message: "Invalid request.", values };
  }

  const parsed = categoryInputSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }

  try {
    if (id) {
      const result = await updateCategory(id, parsed.data);
      if (result === "missing") {
        return {
          status: "error",
          message: "That category no longer exists.",
          values,
        };
      }
      if (result === "cycle") {
        return {
          status: "error",
          fieldErrors: {
            parentId: "A category can't sit inside itself or its own children.",
          },
          values,
        };
      }
    } else {
      await createCategory(parsed.data);
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        fieldErrors: { name: "This name already exists at this level." },
        values,
      };
    }
    if (isForeignKeyViolation(error)) {
      return {
        status: "error",
        fieldErrors: { parentId: "That parent category no longer exists." },
        values,
      };
    }
    logger.error({ err: error }, "Saving category failed");
    return {
      status: "error",
      message: "We couldn't save that category.",
      values,
    };
  }

  revalidateCategoryPages();
  if (id) redirect("/admin/categories");
  return { status: "success", message: `Added ${parsed.data.name}.` };
}

export async function deleteCategoryAction(
  id: string,
): Promise<AdminActionResult> {
  if (!(await isAdminRequest())) {
    return { ok: false, message: "Not authorized." };
  }
  if (!isUuid(id)) return { ok: false, message: "Invalid request." };

  try {
    if (!(await deleteCategory(id))) {
      return { ok: false, message: "That category no longer exists." };
    }
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return {
        ok: false,
        message:
          "Still used by a subcategory, product, or supplier, so it can't be deleted.",
      };
    }
    logger.error({ err: error, id }, "Deleting category failed");
    return { ok: false, message: "We couldn't delete that category." };
  }

  revalidateCategoryPages();
  return { ok: true };
}
