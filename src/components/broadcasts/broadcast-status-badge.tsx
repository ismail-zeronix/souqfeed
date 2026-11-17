import { Badge } from "@/components/ui/badge";
import {
  BROADCAST_STATUS_LABELS,
  type BroadcastStatus,
} from "@/modules/broadcasts/status";

const VARIANTS: Record<
  BroadcastStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  PROCESSING: "secondary",
  REVIEW: "outline",
  PUBLISHED: "default",
  FAILED: "destructive",
};

export function BroadcastStatusBadge({ status }: { status: BroadcastStatus }) {
  return (
    <Badge variant={VARIANTS[status]}>{BROADCAST_STATUS_LABELS[status]}</Badge>
  );
}
