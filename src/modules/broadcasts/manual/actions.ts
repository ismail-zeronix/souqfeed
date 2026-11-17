"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { logger } from "@/lib/logging/logger";
import { isUuid, type FormState } from "@/lib/validation/form";
import { authorizeRole } from "@/modules/auth/guards";
import { specTemplateFor } from "@/modules/categories/spec-templates";
import { getSupplierAccount } from "@/modules/suppliers/queries";
import {
  offerForBroadcast,
  searchCatalogForOffer,
  topLevelSlugOf,
  type CatalogProduct,
} from "./queries";
import { FORM_SUBMISSIONS_PER_HOUR, submitManualOffer } from "./service";
import { parseManualOffer } from "./validation";

export type ManualOfferFormState = FormState<Record<string, string>>;

async function activeSupplier() {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "SUPPLIER")) return null;
  const supplier = await getSupplierAccount(session.user.id);
  return supplier?.active ? supplier : null;
}

function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$")) values[key] = value;
  }
  return values;
}

export async function submitManualOfferAction(
  _previous: ManualOfferFormState,
  formData: FormData,
): Promise<ManualOfferFormState> {
  const supplier = await activeSupplier();
  if (!supplier) {
    return {
      status: "error",
      message:
        "Only suppliers with an active profile can add offers. Check your profile first.",
    };
  }

  const values = formValues(formData);
  const topSlug = isUuid(values.categoryId)
    ? await topLevelSlugOf(values.categoryId)
    : null;
  const template = specTemplateFor(topSlug);
  const parsed = parseManualOffer(values, template);
  if (!parsed.ok) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.fieldErrors,
      values,
    };
  }

  let destination: string;
  try {
    const result = await submitManualOffer(supplier.id, parsed.data, template);
    if (result.kind === "rate-limited") {
      return {
        status: "error",
        message: `You can add up to ${FORM_SUBMISSIONS_PER_HOUR} offers an hour through the form. Please try again later.`,
        values,
      };
    }
    if (result.kind === "invalid") {
      return {
        status: "error",
        message: result.message,
        fieldErrors: { [result.field]: result.message },
        values,
      };
    }
    if (result.kind === "review") {
      destination = `/dashboard/broadcasts/${result.broadcastId}`;
    } else {
      const offerId = await offerForBroadcast(result.broadcastId);
      const params = new URLSearchParams({ added: offerId ?? "" });
      // Keep the category and brand, so the next offer starts where this one did.
      if (values.categoryId) params.set("category", values.categoryId);
      if (values.brandId) params.set("brand", values.brandId);
      destination =
        values.updating && offerId
          ? `/dashboard/offers/${offerId}?saved=1`
          : `/dashboard/offers/new?${params}`;
    }
  } catch (error) {
    logger.error(
      { err: error, supplierId: supplier.id },
      "Manual offer submission failed",
    );
    return {
      status: "error",
      message: "We couldn't save your offer. Please try again.",
      values,
    };
  }

  revalidatePath("/dashboard/offers");
  revalidatePath("/dashboard/broadcasts");
  revalidatePath("/admin/broadcasts");
  revalidatePath("/admin/offers");
  revalidatePath("/");
  revalidatePath("/feed");
  redirect(destination);
}

/** Catalog search for the product step; suppliers only. */
export async function searchCatalogAction(
  brandId: string,
  categoryId: string | null,
  query: string,
): Promise<CatalogProduct[]> {
  if (!isUuid(brandId) || typeof query !== "string") return [];
  if (categoryId !== null && !isUuid(categoryId)) return [];
  if (!(await activeSupplier())) return [];
  return searchCatalogForOffer(brandId, categoryId, query);
}
