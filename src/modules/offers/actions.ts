"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/database/client";
import { isUuid, type AdminActionResult } from "@/lib/validation/form";
import { isStaffRole } from "@/modules/auth/guards";
import { getOfferOwner } from "./queries";
import { offers } from "./schema";

/**
 * Marks an offer sold out and inactive. Its history stays; the next broadcast
 * of the same product starts a new offer. Owner or staff only.
 */
export async function withdrawOfferAction(
  offerId: string,
): Promise<AdminActionResult> {
  if (!isUuid(offerId)) return { ok: false, message: "Invalid request." };
  const session = await getCurrentSession();
  const owner = await getOfferOwner(offerId);
  if (
    !session ||
    !owner ||
    (!isStaffRole(session.user.role) &&
      owner.supplierUserId !== session.user.id)
  ) {
    return { ok: false, message: "Not authorized." };
  }

  const updated = await db
    .update(offers)
    .set({
      active: false,
      availabilityStatus: "SOLD_OUT",
      updatedAt: new Date(),
    })
    .where(and(eq(offers.id, offerId), eq(offers.active, true)))
    .returning({ id: offers.id });
  if (updated.length === 0) {
    return { ok: false, message: "This offer is already withdrawn." };
  }

  revalidatePath("/dashboard/offers");
  revalidatePath(`/dashboard/offers/${offerId}`);
  revalidatePath("/admin/offers");
  revalidatePath(`/admin/offers/${offerId}`);
  return { ok: true };
}
