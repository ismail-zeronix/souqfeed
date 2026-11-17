import { z } from "zod";

export interface FormState<Values> {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Raw text, so a rejected submission can be shown back to the user. */
  values?: Values;
}

export type AdminActionResult = { ok: true } | { ok: false; message: string };

export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

export function formText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function isUuid(value: unknown): value is string {
  return z.uuid().safeParse(value).success;
}

/** Trimmed text where blank means unknown, stored as null (Rule 10). */
export function optionalText(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength, `Must be ${maxLength} characters or fewer`)
    .optional()
    .transform((value) => (value ? value : null));
}
