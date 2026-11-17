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
import { SPEC_FIELDS } from "./normalize";
import {
  addAlias,
  createProduct,
  removeAlias,
  setProductActive,
  updateProduct,
} from "./service";
import type {
  AliasFormState,
  ProductFormState,
  ProductFormValues,
} from "./types";
import { aliasInputSchema, productInputSchema } from "./validation";

function readFormValues(formData: FormData): ProductFormValues {
  const values: ProductFormValues = {
    brandId: formText(formData, "brandId"),
    categoryId: formText(formData, "categoryId"),
    title: formText(formData, "title"),
    family: formText(formData, "family"),
    model: formText(formData, "model"),
    partNumber: formText(formData, "partNumber"),
    cpu: "",
    ram: "",
    storage: "",
    gpu: "",
    display: "",
    os: "",
  };
  for (const { key } of SPEC_FIELDS) {
    values[key] = formText(formData, key);
  }
  return values;
}

function revalidateProductPages(id?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/admin/brands");
  revalidatePath("/admin/categories");
  if (id) revalidatePath(`/admin/products/${id}`);
}

export async function saveProductAction(
  _previous: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  if (!(await isAdminRequest())) {
    return { status: "error", message: "Not authorized." };
  }

  const id = formText(formData, "id");
  const values = readFormValues(formData);
  if (id && !isUuid(id)) {
    return { status: "error", message: "Invalid request.", values };
  }

  const parsed = productInputSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: toFieldErrors(parsed.error),
      message: "Please fix the highlighted fields.",
      values,
    };
  }

  let savedId = id;
  try {
    if (id) {
      if (!(await updateProduct(id, parsed.data))) {
        return {
          status: "error",
          message: "That product no longer exists.",
          values,
        };
      }
    } else {
      savedId = await createProduct(parsed.data);
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        fieldErrors: {
          partNumber: "Another product of this brand has this part number.",
        },
        message: "Please fix the highlighted fields.",
        values,
      };
    }
    if (isForeignKeyViolation(error)) {
      return {
        status: "error",
        message:
          "That brand or category no longer exists. Refresh the page and try again.",
        values,
      };
    }
    logger.error({ err: error }, "Saving product failed");
    return {
      status: "error",
      message: "We couldn't save that product.",
      values,
    };
  }

  revalidateProductPages(savedId);
  // A new product goes to its own page, where aliases can be added.
  if (!id) redirect(`/admin/products/${savedId}`);
  return { status: "success", message: "Product saved." };
}

export async function setProductActiveAction(
  id: string,
  active: boolean,
): Promise<AdminActionResult> {
  if (!(await isAdminRequest())) {
    return { ok: false, message: "Not authorized." };
  }
  if (!isUuid(id) || typeof active !== "boolean") {
    return { ok: false, message: "Invalid request." };
  }

  try {
    if (!(await setProductActive(id, active))) {
      return { ok: false, message: "That product no longer exists." };
    }
  } catch (error) {
    logger.error({ err: error, id }, "Updating product status failed");
    return { ok: false, message: "We couldn't save that change." };
  }

  revalidateProductPages(id);
  return { ok: true };
}

export async function addAliasAction(
  _previous: AliasFormState,
  formData: FormData,
): Promise<AliasFormState> {
  if (!(await isAdminRequest())) {
    return { status: "error", message: "Not authorized." };
  }

  const productId = formText(formData, "productId");
  const values = { alias: formText(formData, "alias") };
  if (!isUuid(productId)) {
    return { status: "error", message: "Invalid request.", values };
  }

  const parsed = aliasInputSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }

  try {
    await addAlias(productId, parsed.data.alias);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        fieldErrors: { alias: "This product already has that alias." },
        values,
      };
    }
    if (isForeignKeyViolation(error)) {
      return {
        status: "error",
        message: "That product no longer exists.",
        values,
      };
    }
    logger.error({ err: error, productId }, "Adding alias failed");
    return { status: "error", message: "We couldn't add that alias.", values };
  }

  revalidateProductPages(productId);
  return { status: "success" };
}

export async function removeAliasAction(
  productId: string,
  aliasId: string,
): Promise<AdminActionResult> {
  if (!(await isAdminRequest())) {
    return { ok: false, message: "Not authorized." };
  }
  if (!isUuid(productId) || !isUuid(aliasId)) {
    return { ok: false, message: "Invalid request." };
  }

  try {
    if (!(await removeAlias(productId, aliasId))) {
      return { ok: false, message: "That alias no longer exists." };
    }
  } catch (error) {
    logger.error({ err: error, aliasId }, "Removing alias failed");
    return { ok: false, message: "We couldn't remove that alias." };
  }

  revalidateProductPages(productId);
  return { ok: true };
}
