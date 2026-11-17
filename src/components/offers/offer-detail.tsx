import type { ReactNode } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import {
  FreshnessBadge,
  WithdrawOfferButton,
} from "@/components/offers/offer-bits";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatPrice } from "@/lib/format";
import { specLabel } from "@/modules/categories/spec-templates";
import { conditionLabel } from "@/modules/offers/condition";
import type { OfferDetail } from "@/modules/offers/queries";

const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  LIMITED: "Limited",
  ASK: "Ask supplier",
  UNKNOWN: "Not stated",
  SOLD_OUT: "Sold out",
};

/** Always listed for computers, so a gap reads as "not stated". */
const CORE_SPEC_KEYS = ["cpu", "ram", "storage", "gpu", "display", "os"];

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}

/** One offer and its full price/quantity history; shared by supplier and admin. */
export function OfferDetailView({
  offer,
  broadcastHref,
  updateHref,
}: {
  offer: OfferDetail;
  broadcastHref: (broadcastId: string) => string;
  /** Where the supplier updates price and stock; staff don't get it. */
  updateHref?: string;
}) {
  const specs =
    typeof offer.specificationSnapshot === "object" &&
    offer.specificationSnapshot
      ? (offer.specificationSnapshot as Record<string, unknown>)
      : {};
  const stated = Object.keys(specs).filter(
    (key) => typeof specs[key] === "string",
  );
  // Computer specs always show (gaps as "—"); other categories only what's stated.
  const specKeys = stated.some((key) => CORE_SPEC_KEYS.includes(key))
    ? [
        ...CORE_SPEC_KEYS,
        ...stated.filter((key) => !CORE_SPEC_KEYS.includes(key)),
      ]
    : stated;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_17rem]">
      <Card className="min-w-0 lg:order-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current offer{" "}
            {offer.active && (
              <FreshnessBadge lastVerifiedAt={offer.lastVerifiedAt} />
            )}
          </CardTitle>
          <CardDescription>
            {offer.active
              ? "The latest price and stock from this supplier's broadcasts."
              : "Withdrawn. A new broadcast of this product starts a new offer."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <Fact
              label="Price"
              value={
                formatPrice(offer.price, offer.currency, offer.priceType) ??
                "Not stated"
              }
            />
            <Fact label="Quantity" value={offer.quantity ?? "Not stated"} />
            <Fact
              label="Condition"
              value={conditionLabel(offer.condition) ?? "Not stated"}
            />
            <Fact label="Warranty" value={offer.warranty ?? "Not stated"} />
            <Fact
              label="Availability"
              value={
                AVAILABILITY_LABELS[offer.availabilityStatus ?? ""] ??
                "Not stated"
              }
            />
            <Fact
              label="Last confirmed"
              value={
                offer.lastVerifiedAt
                  ? formatDateTime(offer.lastVerifiedAt)
                  : "—"
              }
            />
          </dl>
          {offer.active && updateHref && (
            <Button nativeButton={false} render={<Link href={updateHref} />}>
              <RefreshCw aria-hidden />
              Update price &amp; stock
            </Button>
          )}
          {offer.active && <WithdrawOfferButton offerId={offer.id} />}
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-4 lg:order-1">
        {offer.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>
                In the supplier&apos;s own words.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 whitespace-pre-line">
                {offer.notes}
              </p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
            <CardDescription>
              As the supplier stated them, with gaps filled from the catalog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {specKeys.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No specifications stated.
              </p>
            )}
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {specKeys.map((key) => (
                <Fact
                  key={key}
                  label={specLabel(key)}
                  value={
                    typeof specs[key] === "string"
                      ? (specs[key] as string)
                      : "—"
                  }
                />
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>
              Every broadcast that listed this product. Nothing here is ever
              overwritten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offer.observations.map((observation) => (
                  <TableRow key={observation.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(observation.observedAt)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(
                        observation.price,
                        observation.currency,
                        null,
                      ) ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {observation.quantity ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={broadcastHref(observation.broadcastId)}
                        className="text-primary text-xs hover:underline"
                      >
                        Broadcast
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
