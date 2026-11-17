"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/lib/auth/session";
import { isUniqueViolation } from "@/lib/database/errors";
import { logger } from "@/lib/logging/logger";
import { isUuid, type AdminActionResult } from "@/lib/validation/form";
import { isStaffRole } from "@/modules/auth/guards";
import { createProduct } from "@/modules/products/service";
import { productInputSchema } from "@/modules/products/validation";
import {
  approveItem,
  chooseItemProduct,
  findBrandIdByName,
  getBroadcastReviewTarget,
  getItemForProduct,
  getItemReviewTarget,
  publishBroadcast,
  rejectItem,
  rejectUnmatchedItems,
  searchProductsForReview,
  type ReviewTarget,
} from "./review";

const NOT_AUTHORIZED: AdminActionResult = {
  ok: false,
  message: "Not authorized.",
};
const NOT_IN_REVIEW: AdminActionResult = {
  ok: false,
  message: "This broadcast is no longer in review. Refresh the page.",
};

type Reviewer = { isStaff: boolean };

/** The broadcast's supplier or staff may review; nobody else. */
async function authorize(
  target: ReviewTarget | undefined,
): Promise<Reviewer | null> {
  if (!target) return null;
  const session = await getCurrentSession();
  if (!session) return null;
  const isStaff = isStaffRole(session.user.role);
  if (!isStaff && session.user.id !== target.supplierUserId) return null;
  return { isStaff };
}

function refresh(broadcastId: string) {
  revalidatePath(`/dashboard/broadcasts/${broadcastId}`);
  revalidatePath(`/admin/broadcasts/${broadcastId}`);
  revalidatePath("/dashboard/broadcasts");
  revalidatePath("/admin/broadcasts");
}

async function itemAction(
  itemId: string,
  apply: (reviewer: Reviewer) => Promise<boolean>,
): Promise<AdminActionResult> {
  if (!isUuid(itemId)) return { ok: false, message: "Invalid request." };
  const target = await getItemReviewTarget(itemId);
  const reviewer = await authorize(target);
  if (!target || !reviewer) return NOT_AUTHORIZED;
  if (target.status !== "REVIEW") return NOT_IN_REVIEW;
  try {
    if (!(await apply(reviewer))) return NOT_IN_REVIEW;
  } catch (error) {
    logger.error({ err: error, itemId }, "Review action failed");
    return { ok: false, message: "We couldn't save that. Please try again." };
  }
  refresh(target.broadcastId);
  return { ok: true };
}

export async function approveItemAction(itemId: string) {
  return itemAction(itemId, () => approveItem(itemId));
}

export async function rejectItemAction(itemId: string) {
  return itemAction(itemId, () => rejectItem(itemId));
}

export async function chooseItemProductAction(
  itemId: string,
  productId: string,
): Promise<AdminActionResult> {
  if (!isUuid(productId)) return { ok: false, message: "Invalid request." };
  return itemAction(itemId, (reviewer) =>
    chooseItemProduct(
      itemId,
      productId,
      reviewer.isStaff ? "SouqFeed staff" : "supplier",
    ),
  );
}

export async function rejectUnmatchedAction(
  broadcastId: string,
): Promise<AdminActionResult> {
  if (!isUuid(broadcastId)) return { ok: false, message: "Invalid request." };
  const target = await getBroadcastReviewTarget(broadcastId);
  if (!(await authorize(target))) return NOT_AUTHORIZED;
  if (target?.status !== "REVIEW") return NOT_IN_REVIEW;
  await rejectUnmatchedItems(broadcastId);
  refresh(broadcastId);
  return { ok: true };
}

const PUBLISH_MESSAGES = {
  "not-in-review": "This broadcast is no longer in review. Refresh the page.",
  "needs-review":
    "Some products still need review. Approve, change, or skip each one first.",
  "nothing-approved":
    "Approve at least one product before publishing, or post a new broadcast.",
} as const;

export async function publishBroadcastAction(
  broadcastId: string,
): Promise<AdminActionResult> {
  if (!isUuid(broadcastId)) return { ok: false, message: "Invalid request." };
  const target = await getBroadcastReviewTarget(broadcastId);
  if (!(await authorize(target))) return NOT_AUTHORIZED;

  try {
    const result = await publishBroadcast(broadcastId);
    if (!result.ok)
      return { ok: false, message: PUBLISH_MESSAGES[result.reason] };
  } catch (error) {
    logger.error({ err: error, broadcastId }, "Publishing broadcast failed");
    return { ok: false, message: "We couldn't publish. Please try again." };
  }
  refresh(broadcastId);
  return { ok: true };
}

/** Catalog search for the "choose a product" picker. */
export async function searchProductsAction(
  itemId: string,
  query: string,
): Promise<
  { id: string; title: string; brandName: string; partNumber: string | null }[]
> {
  if (!isUuid(itemId) || typeof query !== "string") return [];
  const target = await getItemReviewTarget(itemId);
  if (!(await authorize(target))) return [];
  const item = await getItemForProduct(itemId);
  return searchProductsForReview(query.slice(0, 100), item?.brand ?? null);
}

/**
 * Staff only: adds an unmatched item to the catalog as a new product, built
 * from what was detected (unknown specs stay empty), and approves the item
 * against it.
 */
export async function createProductFromItemAction(
  itemId: string,
): Promise<AdminActionResult> {
  if (!isUuid(itemId)) return { ok: false, message: "Invalid request." };
  const target = await getItemReviewTarget(itemId);
  const reviewer = await authorize(target);
  if (!target || !reviewer?.isStaff) return NOT_AUTHORIZED;
  if (target.status !== "REVIEW") return NOT_IN_REVIEW;

  const item = await getItemForProduct(itemId);
  if (!item?.brand) {
    return {
      ok: false,
      message: "No brand was detected, so it can't be added.",
    };
  }
  const brandId = await findBrandIdByName(item.brand);
  if (!brandId) {
    return {
      ok: false,
      message: `Add the brand "${item.brand}" to the catalog first.`,
    };
  }
  const parsed = productInputSchema.safeParse({
    brandId,
    categoryId: "",
    title: [item.brand, item.model].filter(Boolean).join(" "),
    family: "",
    model: item.model ?? "",
    partNumber: item.partNumber ?? "",
    cpu: item.cpu ?? "",
    ram: item.ram ?? "",
    storage: item.storage ?? "",
    gpu: item.gpu ?? "",
    display: item.display ?? "",
    os: item.os ?? "",
  });
  if (!parsed.success || !item.model) {
    return {
      ok: false,
      message:
        "Not enough was detected to make a product. Add it from Products.",
    };
  }

  try {
    const productId = await createProduct(parsed.data);
    await chooseItemProduct(itemId, productId, "SouqFeed staff");
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        message:
          "A product with this part number already exists. Choose it instead.",
      };
    }
    logger.error({ err: error, itemId }, "Creating product from item failed");
    return {
      ok: false,
      message: "We couldn't add the product. Please try again.",
    };
  }
  refresh(target.broadcastId);
  revalidatePath("/admin/products");
  return { ok: true };
}
