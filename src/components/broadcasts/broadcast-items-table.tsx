import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BroadcastItemRow } from "@/modules/broadcasts/types";

const UNKNOWN = <span className="text-muted-foreground">—</span>;

function formatPrice(item: BroadcastItemRow) {
  if (item.price !== null) {
    return `${item.currency ?? ""} ${Number(item.price).toLocaleString("en-AE")}`.trim();
  }
  return item.priceType === "ASK" ? "Ask" : null;
}

function specs(item: BroadcastItemRow): string {
  return [item.cpu, item.ram, item.storage, item.gpu, item.display, item.os]
    .filter(Boolean)
    .join(" · ");
}

/** What the parser read from each line. Unread fields show a dash (Rule 10). */
export function BroadcastItemsTable({ items }: { items: BroadcastItemRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Specs</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} className="align-top">
            <TableCell className="max-w-64 whitespace-normal">
              <div className="font-medium">
                {[item.brand, item.model].filter(Boolean).join(" ") || UNKNOWN}
              </div>
              {item.partNumber && (
                <div className="text-muted-foreground font-mono text-xs">
                  {item.partNumber}
                </div>
              )}
              <div
                className="text-muted-foreground mt-1 truncate font-mono text-[11px]"
                title={item.rawBlock ?? item.rawLine}
              >
                {item.rawLine.trim()}
              </div>
            </TableCell>
            <TableCell className="max-w-72 text-xs whitespace-normal">
              {specs(item) || UNKNOWN}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {item.quantity ?? UNKNOWN}
            </TableCell>
            <TableCell className="text-right whitespace-nowrap tabular-nums">
              {formatPrice(item) ?? UNKNOWN}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
