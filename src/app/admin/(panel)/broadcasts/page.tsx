import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminEmptyState,
  AdminPageHeader,
} from "@/components/admin/admin-page";
import { BroadcastStatusBadge } from "@/components/broadcasts/broadcast-status-badge";
import {
  PaginationNav,
  parsePage,
} from "@/components/broadcasts/pagination-nav";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdminPage } from "@/lib/auth/session";
import { firstLine, formatDateTime } from "@/lib/format";
import {
  countBroadcastsByStatus,
  listBroadcastsForAdmin,
} from "@/modules/broadcasts/queries";
import {
  BROADCAST_STATUS_LABELS,
  BROADCAST_STATUSES,
  isBroadcastStatus,
  type BroadcastStatus,
} from "@/modules/broadcasts/status";

export const metadata: Metadata = { title: "Broadcasts" };

function listUrl(status: BroadcastStatus | undefined, page = 1) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/broadcasts?${query}` : "/admin/broadcasts";
}

export default async function AdminBroadcastsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string | string[];
    page?: string | string[];
  }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const status = isBroadcastStatus(params.status) ? params.status : undefined;
  const [result, counts] = await Promise.all([
    listBroadcastsForAdmin(status, parsePage(params.page)),
    countBroadcastsByStatus(),
  ]);
  const allCount = Object.values(counts).reduce((sum, n) => sum + n, 0);

  const tabs: { label: string; value?: BroadcastStatus; count: number }[] = [
    { label: "All", count: allCount },
    ...BROADCAST_STATUSES.filter((value) => value !== "DRAFT").map((value) => ({
      label: BROADCAST_STATUS_LABELS[value],
      value,
      count: counts[value],
    })),
  ];

  return (
    <>
      <AdminPageHeader
        title="Broadcasts"
        description="Every stock message suppliers have posted. The original text is kept exactly as pasted."
      />

      <nav
        aria-label="Filter by status"
        className="mb-4 flex gap-1 overflow-x-auto"
      >
        {tabs.map((tab) => {
          const active = tab.value === status;
          return (
            <Link
              key={tab.label}
              href={listUrl(tab.value)}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-md px-1.5 text-xs tabular-nums ${active ? "bg-primary-foreground/20" : "bg-muted"}`}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </nav>

      {result.rows.length === 0 ? (
        <AdminEmptyState>
          {status
            ? "No broadcasts with this status."
            : "No supplier has posted a broadcast yet."}
        </AdminEmptyState>
      ) : (
        <Card className="py-0">
          <CardContent className="px-2 sm:px-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broadcast</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Posted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.rows.map((broadcast) => (
                  <TableRow key={broadcast.id}>
                    <TableCell className="max-w-80">
                      <Link
                        href={`/admin/broadcasts/${broadcast.id}`}
                        className="block truncate font-mono text-xs hover:underline"
                      >
                        {firstLine(broadcast.preview) || "(blank first line)"}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      {broadcast.supplierName}
                    </TableCell>
                    <TableCell>
                      <BroadcastStatusBadge status={broadcast.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">
                      {formatDateTime(broadcast.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <PaginationNav
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        noun={["broadcast", "broadcasts"]}
        hrefFor={(page) => listUrl(status, page)}
      />
    </>
  );
}
