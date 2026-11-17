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
import { createBrand, deleteBrand, renameBrand } from "./service";
import type { BrandFormState } from "./types";
import { brandInputSchema } from "./validation";

function revalidateBrandPages() {
  revalidatePath("/admin/brands");
  revalidatePath("/admin/products");
  revalidatePath("/dashboard");
}

export async function saveBrandAction(
  _previous: BrandFormState,
  formData: FormData,
): Promise<BrandFormState> {
  if (!(await isAdminRequest())) {
    return { status: "error", message: "Not authorized." };
  }

  const id = formText(formData, "id");
  const values = { name: formText(formData, "name") };
  if (id && !isUuid(id)) {
    return { status: "error", message: "Invalid request.", values };
  }

  const parsed = brandInputSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }

  try {
    if (id) {
      if (!(await renameBrand(id, parsed.data))) {
        return {
          status: "error",
          message: "That brand no longer exists.",
          values,
        };
      }
    } else {
      await createBrand(parsed.data);
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        fieldErrors: { name: "A brand with this name already exists." },
        values,
      };
    }
    logger.error({ err: error }, "Saving brand failed");
    return {
      status: "error",
      message: "We couldn't save that brand.",
      values,
    };
  }

  revalidateBrandPages();
  if (id) redirect("/admin/brands");
  return { status: "success", message: `Added ${parsed.data.name}.` };
}

export async function deleteBrandAction(
  id: string,
): Promise<AdminActionResult> {
  if (!(await isAdminRequest())) {
    return { ok: false, message: "Not authorized." };
  }
  if (!isUuid(id)) return { ok: false, message: "Invalid request." };

  try {
    if (!(await deleteBrand(id))) {
      return { ok: false, message: "That brand no longer exists." };
    }
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return {
        ok: false,
        message: "Still used by a product or supplier, so it can't be deleted.",
      };
    }
    logger.error({ err: error, id }, "Deleting brand failed");
    return { ok: false, message: "We couldn't delete that brand." };
  }

  revalidateBrandPages();
  return { ok: true };
}
