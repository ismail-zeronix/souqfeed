import { z } from "zod";
import { slugify } from "@/lib/slug";

export const brandInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Brand name is required")
    .max(80, "Must be 80 characters or fewer")
    // The slug comes from the name, so it needs at least one usable character.
    .refine((name) => slugify(name).length > 0, "Include a letter or number"),
});

export type BrandInput = z.infer<typeof brandInputSchema>;
