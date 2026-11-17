import { z } from "zod";
import { optionalText } from "@/lib/validation/form";

const DIGITS_MIN = 7;
const DIGITS_MAX = 15;

function digitCount(value: string): number {
  return value.replace(/\D/g, "").length;
}

function hasValidDigitCount(value: string): boolean {
  const digits = digitCount(value);
  return digits >= DIGITS_MIN && digits <= DIGITS_MAX;
}

/**
 * These values are rendered as `href`s on the public profile, so only http(s)
 * is allowed — a `javascript:` URL here would run in a visitor's browser.
 * A bare domain such as `example.com` is treated as https.
 */
function optionalHttpUrl() {
  return z
    .string()
    .trim()
    .max(2048, "Must be 2048 characters or fewer")
    .optional()
    .transform((value, context) => {
      if (!value) return null;
      const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value)
        ? value
        : `https://${value}`;
      try {
        const url = new URL(candidate);
        if (url.protocol === "http:" || url.protocol === "https:") {
          return candidate;
        }
      } catch {
        // Falls through to the shared issue below.
      }
      context.addIssue({
        code: "custom",
        message: "Enter a valid web address starting with http:// or https://",
      });
      return z.NEVER;
    });
}

function optionalEmail() {
  return z
    .string()
    .trim()
    .optional()
    .transform((value, context) => {
      if (!value) return null;
      if (z.email().safeParse(value).success) return value;
      context.addIssue({
        code: "custom",
        message: "Enter a valid email address",
      });
      return z.NEVER;
    });
}

function optionalPhone() {
  return z
    .string()
    .trim()
    .optional()
    .transform((value, context) => {
      if (!value) return null;
      if (/^\+?[\d\s()-]+$/.test(value) && hasValidDigitCount(value)) {
        return value;
      }
      context.addIssue({
        code: "custom",
        message: "Enter a valid phone number",
      });
      return z.NEVER;
    });
}

function uniqueIds() {
  return z
    .array(z.uuid("Invalid selection"))
    .default([])
    .transform((ids) => [...new Set(ids)]);
}

export const supplierProfileInputSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(120, "Must be 120 characters or fewer"),
  // wa.me links only work with a full international number.
  whatsappNumber: z
    .string()
    .trim()
    .min(1, "WhatsApp number is required")
    .refine(
      (value) => /^\+[\d\s()-]+$/.test(value) && hasValidDigitCount(value),
      "Include the country code, for example +971 50 123 4567",
    ),
  description: optionalText(2000),
  phone: optionalPhone(),
  email: optionalEmail(),
  website: optionalHttpUrl(),
  locationName: optionalText(120),
  address: optionalText(300),
  googleMapsUrl: optionalHttpUrl(),
  brandIds: uniqueIds(),
  categoryIds: uniqueIds(),
});

export type SupplierProfileInput = z.infer<typeof supplierProfileInputSchema>;
