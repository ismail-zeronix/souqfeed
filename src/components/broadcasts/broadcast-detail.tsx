import { BroadcastReview } from "@/components/broadcasts/broadcast-review";
import { BroadcastRawText } from "@/components/broadcasts/broadcast-raw-text";
import { BroadcastStatusBadge } from "@/components/broadcasts/broadcast-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { BroadcastStatus } from "@/modules/broadcasts/status";
import type {
  BroadcastDetail,
  BroadcastItemRow,
} from "@/modules/broadcasts/types";
import { countBroadcastLines } from "@/modules/broadcasts/validation";

const STATUS_EXPLANATIONS: Record<BroadcastStatus, string> = {
  DRAFT: "Not posted yet.",
  PROCESSING:
    "SouqFeed will read this broadcast and split it into products. You'll review them before anything goes live.",
  REVIEW:
    "SouqFeed has read this broadcast. Check the products it found, then publish them.",
  PUBLISHED: "The products from this broadcast are live for buyers.",
  FAILED:
    "SouqFeed couldn't read products from this broadcast. The original is kept below.",
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}

/** Status, facts, and original text of one broadcast; shared by supplier and admin. */
export function BroadcastDetailView({
  broadcast,
  items,
  canCreateProducts = false,
}: {
  broadcast: BroadcastDetail;
  items: BroadcastItemRow[];
  /** Staff can add unmatched items to the catalog. */
  canCreateProducts?: boolean;
}) {
  const lines = countBroadcastLines(broadcast.rawText);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_17rem]">
      <Card className="min-w-0 lg:order-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Status <BroadcastStatusBadge status={broadcast.status} />
          </CardTitle>
          <CardDescription>
            {broadcast.status === "FAILED" && broadcast.statusNote
              ? broadcast.statusNote
              : STATUS_EXPLANATIONS[broadcast.status]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <Fact label="Posted" value={formatDateTime(broadcast.createdAt)} />
            {broadcast.publishedAt && (
              <Fact
                label="Published"
                value={formatDateTime(broadcast.publishedAt)}
              />
            )}
            <Fact
              label="Lines"
              value={`${lines} ${lines === 1 ? "line" : "lines"}`}
            />
            <Fact
              label="Products found"
              value={
                broadcast.status === "PROCESSING" ||
                broadcast.status === "DRAFT"
                  ? "Not read yet"
                  : String(broadcast.itemCount)
              }
            />
          </dl>
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-4 lg:order-1">
        {items.length > 0 && (
          <BroadcastReview
            broadcastId={broadcast.id}
            items={items}
            editable={broadcast.status === "REVIEW"}
            canCreateProducts={canCreateProducts}
          />
        )}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Original broadcast</CardTitle>
            <CardDescription>
              Exactly as it was pasted. It can never be edited.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BroadcastRawText rawText={broadcast.rawText} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
