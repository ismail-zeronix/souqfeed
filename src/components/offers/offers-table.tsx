import Link from "next/link";
import { FreshnessBadge } from "@/components/offers/offer-bits";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { OfferRow } from "@/modules/offers/queries";

const DASH = <span className="text-muted-foreground">—</span>;

export function OffersTable({
  rows,
  hrefFor,
  showSupplier,
}: {
  rows: OfferRow[];
  hrefFor: (id: string) => string;
  showSupplier: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          {showSupplier && <TableHead>Supplier</TableHead>}
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead>Freshness</TableHead>
          <TableHead className="text-right">Last confirmed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((offer) => (
          <TableRow key={offer.id}>
            <TableCell className="max-w-72 whitespace-normal">
              <Link
                href={hrefFor(offer.id)}
                className="font-medium hover:underline"
              >
                {offer.title ?? "Untitled product"}
              </Link>
              <div className="text-muted-foreground text-xs">
                {offer.observationCount}{" "}
                {offer.observationCount === 1 ? "update" : "updates"}
              </div>
            </TableCell>
            {showSupplier && <TableCell>{offer.supplierName}</TableCell>}
            <TableCell className="text-right whitespace-nowrap tabular-nums">
              {formatPrice(offer.price, offer.currency, offer.priceType) ??
                DASH}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {offer.quantity ?? DASH}
            </TableCell>
            <TableCell>
              {offer.active ? (
                <FreshnessBadge lastVerifiedAt={offer.lastVerifiedAt} />
              ) : (
                <span className="text-muted-foreground text-xs">Sold out</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground text-right text-xs whitespace-nowrap">
              {offer.lastVerifiedAt
                ? formatDateTime(offer.lastVerifiedAt)
                : DASH}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
