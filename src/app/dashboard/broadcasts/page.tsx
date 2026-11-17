import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { BroadcastStatusBadge } from "@/components/broadcasts/broadcast-status-badge";
import {
  PaginationNav,
  parsePage,
} from "@/components/broadcasts/pagination-nav";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireSupplierPage } from "@/lib/auth/session";
import { firstLine, formatDateTime } from "@/lib/format";
import { listSupplierBroadcasts } from "@/modules/broadcasts/queries";

export const metadata: Metadata = {
  title: "Your broadcasts",
  robots: { index: false, follow: false },
};

export default async function SupplierBroadcastsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { supplier } = await requireSupplierPage();
  const result = await listSupplierBroadcasts(
    supplier.id,
    parsePage((await searchParams).page),
  );

  return (
    <DashboardPage
      back={{ href: "/dashboard", label: "Dashboard" }}
      eyebrow="Broadcasts"
      title="Your broadcasts"
      description="Every stock message you've posted, newest first. SouqFeed reads each one into products you can review before buyers see them."
      actions={
        supplier.active && (
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/broadcasts/new" />}
          >
            <Plus aria-hidden />
            Post a broadcast
          </Button>
        )
      }
    >
      {result.rows.length === 0 ? (
        <div className="bg-card text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
          You haven&apos;t posted a broadcast yet.{" "}
          {supplier.active && (
            <Link
              href="/dashboard/broadcasts/new"
              className="text-primary hover:underline"
            >
              Paste your first one.
            </Link>
          )}
        </div>
      ) : (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {result.rows.map((broadcast) => (
              <li key={broadcast.id}>
                <Link
                  href={`/dashboard/broadcasts/${broadcast.id}`}
                  className="hover:bg-muted/50 flex items-center gap-4 px-4 py-3.5 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm">
                      {firstLine(broadcast.preview) || "(blank first line)"}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatDateTime(broadcast.createdAt)}
                      {broadcast.itemCount > 0 &&
                        ` · ${broadcast.itemCount} ${broadcast.itemCount === 1 ? "item" : "items"}`}
                    </p>
                  </div>
                  <BroadcastStatusBadge status={broadcast.status} />
                  <ChevronRight
                    className="text-muted-foreground size-4 shrink-0"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <PaginationNav
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        noun={["broadcast", "broadcasts"]}
        hrefFor={(page) => `/dashboard/broadcasts?page=${page}`}
      />
    </DashboardPage>
  );
}
