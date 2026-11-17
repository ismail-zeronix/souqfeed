import { z } from "zod";

export const MAX_BROADCAST_LENGTH = 50_000;

/**
 * Raw broadcast text is stored exactly as pasted (Rule 8): this checks it but
 * never trims or rewrites it.
 */
export const broadcastInputSchema = z.object({
  rawText: z
    .string()
    .refine((text) => text.trim().length > 0, "Paste your broadcast first")
    .refine(
      (text) => text.length <= MAX_BROADCAST_LENGTH,
      `Broadcasts can be up to ${MAX_BROADCAST_LENGTH.toLocaleString("en-AE")} characters`,
    ),
});

export type BroadcastInput = z.infer<typeof broadcastInputSchema>;

/** Non-blank lines, for display only; the parser does its own splitting. */
export function countBroadcastLines(rawText: string): number {
  return rawText.split(/\r\n|\r|\n/).filter((line) => line.trim()).length;
}
