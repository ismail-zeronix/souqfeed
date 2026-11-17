export const BROADCAST_STATUSES = [
  "DRAFT",
  "PROCESSING",
  "REVIEW",
  "PUBLISHED",
  "FAILED",
] as const;

export type BroadcastStatus = (typeof BROADCAST_STATUSES)[number];

/**
 * Every allowed status change. PUBLISHED is final; a FAILED broadcast can be
 * sent back for another parsing attempt.
 */
const TRANSITIONS: Record<BroadcastStatus, readonly BroadcastStatus[]> = {
  DRAFT: ["PROCESSING"],
  PROCESSING: ["REVIEW", "FAILED"],
  REVIEW: ["PUBLISHED"],
  FAILED: ["PROCESSING"],
  PUBLISHED: [],
};

export function canTransition(
  from: BroadcastStatus,
  to: BroadcastStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isBroadcastStatus(value: unknown): value is BroadcastStatus {
  return (
    typeof value === "string" &&
    (BROADCAST_STATUSES as readonly string[]).includes(value)
  );
}

/** Wording shown to suppliers and admins for each status. */
export const BROADCAST_STATUS_LABELS: Record<BroadcastStatus, string> = {
  DRAFT: "Draft",
  PROCESSING: "Waiting to be read",
  REVIEW: "Ready for review",
  PUBLISHED: "Published",
  FAILED: "Couldn't be read",
};
