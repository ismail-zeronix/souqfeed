"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "@/lib/database/errors";
import { logger } from "@/lib/logging/logger";
import {
  formText,
  toFieldErrors,
  type AdminActionResult,
} from "@/lib/validation/form";
import { authorizeRole } from "@/modules/auth/guards";
import {
  createOwnProfile,
  setActive,
  setVerified,
  updateOwnProfile,
} from "./service";
import type { SupplierFormState, SupplierFormValues } from "./types";
import { supplierProfileInputSchema } from "./validation";

// Deliberately reads no `verified`, `active`, `slug`, or `userId` key, so a
// supplier's own submission has no way to set them, even with a crafted POST.
function readFormValues(formData: FormData): SupplierFormValues {
  return {
    companyName: formText(formData, "companyName"),
    whatsappNumber: formText(formData, "whatsappNumber"),
    description: formText(formData, "description"),
    phone: formText(formData, "phone"),
    email: formText(formData, "email"),
    website: formText(formData, "website"),
    locationName: formText(formData, "locationName"),
    address: formText(formData, "address"),
    googleMapsUrl: formText(formData, "googleMapsUrl"),
    brandIds: formData.getAll("brandIds").map(String),
    categoryIds: formData.getAll("categoryIds").map(String),
  };
}

function describeSaveFailure(error: unknown): string {
  if (isUniqueViolation(error)) {
    return "That profile was just saved elsewhere. Refresh the page and try again.";
  }
  if (isForeignKeyViolation(error)) {
    return "One of the selected brands or categories no longer exists. Refresh the page and try again.";
  }
  logger.error({ err: error }, "Saving supplier profile failed");
  return "We couldn't save your profile. Please try again.";
}

export async function createOwnSupplierProfile(
  _previous: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "SUPPLIER")) {
    return { status: "error", message: "Not authorized." };
  }

  const values = readFormValues(formData);
  const parsed = supplierProfileInputSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: toFieldErrors(parsed.error),
      message: "Please fix the highlighted fields.",
      values,
    };
  }

  try {
    await createOwnProfile(session.user.id, parsed.data);
  } catch (error) {
    return { status: "error", message: describeSaveFailure(error), values };
  }

  revalidatePath("/dashboard");
  return { status: "success", message: "Profile created." };
}

export async function updateOwnSupplierProfile(
  _previous: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "SUPPLIER")) {
    return { status: "error", message: "Not authorized." };
  }

  const values = readFormValues(formData);
  const parsed = supplierProfileInputSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: toFieldErrors(parsed.error),
      message: "Please fix the highlighted fields.",
      values,
    };
  }

  try {
    const row = await updateOwnProfile(session.user.id, parsed.data);
    if (!row) {
      return {
        status: "error",
        message: "No supplier profile exists for this account.",
      };
    }
    revalidatePath("/dashboard");
    revalidatePath(`/suppliers/${row.slug}`);
  } catch (error) {
    return { status: "error", message: describeSaveFailure(error), values };
  }

  return { status: "success", message: "Profile updated." };
}

const adminToggleSchema = z.object({
  supplierId: z.uuid(),
  value: z.boolean(),
});

async function runAdminToggle(
  supplierId: string,
  value: boolean,
  apply: (id: string, next: boolean) => Promise<string | undefined>,
): Promise<AdminActionResult> {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "ADMIN")) {
    return { ok: false, message: "Not authorized." };
  }

  const parsed = adminToggleSchema.safeParse({ supplierId, value });
  if (!parsed.success) {
    return { ok: false, message: "Invalid request." };
  }

  try {
    const slug = await apply(parsed.data.supplierId, parsed.data.value);
    if (!slug) {
      return { ok: false, message: "That supplier no longer exists." };
    }
    revalidatePath("/admin");
    revalidatePath(`/suppliers/${slug}`);
    return { ok: true };
  } catch (error) {
    logger.error({ err: error, supplierId }, "Admin supplier update failed");
    return { ok: false, message: "We couldn't save that change." };
  }
}

export async function adminSetVerified(
  supplierId: string,
  verified: boolean,
): Promise<AdminActionResult> {
  return runAdminToggle(supplierId, verified, setVerified);
}

export async function adminSetActive(
  supplierId: string,
  active: boolean,
): Promise<AdminActionResult> {
  return runAdminToggle(supplierId, active, setActive);
}
