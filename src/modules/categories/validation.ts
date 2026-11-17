import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(80, "Must be 80 characters or fewer"),
  parentId: z
    .union([z.literal(""), z.uuid("Choose a valid parent")])
    .optional()
    .transform((value) => value || null),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
