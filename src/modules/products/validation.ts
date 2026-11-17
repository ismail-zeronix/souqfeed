import { z } from "zod";
import { optionalText } from "@/lib/validation/form";
import { normalizeAlias, normalizePartNumber } from "./normalize";

const SPEC_MAX_LENGTH = 120;

export const productInputSchema = z.object({
  brandId: z.uuid("Choose a brand"),
  categoryId: z
    .union([z.literal(""), z.uuid("Choose a valid category")])
    .optional()
    .transform((value) => value || null),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(300, "Must be 300 characters or fewer"),
  family: optionalText(120),
  model: optionalText(120),
  partNumber: optionalText(80).transform((value) =>
    value ? normalizePartNumber(value) : null,
  ),
  cpu: optionalText(SPEC_MAX_LENGTH),
  ram: optionalText(SPEC_MAX_LENGTH),
  storage: optionalText(SPEC_MAX_LENGTH),
  gpu: optionalText(SPEC_MAX_LENGTH),
  display: optionalText(SPEC_MAX_LENGTH),
  os: optionalText(SPEC_MAX_LENGTH),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export const aliasInputSchema = z.object({
  alias: z
    .string()
    .transform(normalizeAlias)
    .pipe(
      z
        .string()
        .min(1, "Enter an alias")
        .max(120, "Must be 120 characters or fewer"),
    ),
});
