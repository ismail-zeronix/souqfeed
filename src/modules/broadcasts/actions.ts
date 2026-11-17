"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { logger } from "@/lib/logging/logger";
import { formText, toFieldErrors } from "@/lib/validation/form";
import { authorizeRole } from "@/modules/auth/guards";
import { getSupplierAccount } from "@/modules/suppliers/queries";
import { SUBMISSIONS_PER_HOUR, submitBroadcast } from "./service";
import type { BroadcastFormState } from "./types";
import { broadcastInputSchema } from "./validation";

export async function submitBroadcastAction(
  _previous: BroadcastFormState,
  formData: FormData,
): Promise<BroadcastFormState> {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "SUPPLIER")) {
    return { status: "error", message: "Not authorized." };
  }
  const supplier = await getSupplierAccount(session.user.id);
  if (!supplier) {
    return {
      status: "error",
      message: "Create your supplier profile before posting a broadcast.",
    };
  }
  if (!supplier.active) {
    return {
      status: "error",
      message:
        "Your profile is hidden by SouqFeed, so you can't post broadcasts. Contact SouqFeed to restore it.",
    };
  }

  const values = { rawText: formText(formData, "rawText") };
  const parsed = broadcastInputSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: toFieldErrors(parsed.error),
      message: "Please fix the highlighted field.",
      values,
    };
  }

  let id: string;
  try {
    const result = await submitBroadcast(supplier.id, parsed.data.rawText);
    if (result.kind === "rate-limited") {
      return {
        status: "error",
        message: `You can post up to ${SUBMISSIONS_PER_HOUR} broadcasts an hour. Please try again later.`,
        values,
      };
    }
    id = result.id;
  } catch (error) {
    logger.error(
      { err: error, supplierId: supplier.id },
      "Broadcast submission failed",
    );
    return {
      status: "error",
      message: "We couldn't save your broadcast. Please try again.",
      values,
    };
  }

  revalidatePath("/dashboard/broadcasts");
  revalidatePath("/admin/broadcasts");
  redirect(`/dashboard/broadcasts/${id}`);
}
