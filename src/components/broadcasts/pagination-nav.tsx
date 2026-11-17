import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PaginationNav({
  page,
  totalPages,
  total,
  noun,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  total: number;
  noun: [singular: string, plural: string];
  hrefFor: (page: number) => string;
}) {
  return (
    <nav
      aria-label="Pagination"
      className="text-muted-foreground mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <span>
        {total} {total === 1 ? noun[0] : noun[1]}
        {totalPages > 1 && `, page ${page} of ${totalPages}`}
      </span>
      {totalPages > 1 && (
        <div className="flex gap-2">
          {page > 1 && (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={hrefFor(page - 1)} />}
            >
              Previous
            </Button>
          )}
          {page < totalPages && (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={hrefFor(page + 1)} />}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}

/** A positive page number from a query string value, defaulting to 1. */
export function parsePage(value: string | string[] | undefined): number {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
