import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FolderTree,
  Package,
  Plus,
  Store,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import { requireAdminPage } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { getAdminOverview } from "@/modules/admin/queries";

export const metadata: Metadata = { title: "Dashboard" };

const ROLE_LABELS: Record<string, string> = {
  BUYER: "Buyer",
  SUPPLIER: "Supplier",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super admin",
};

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  href,
}: {
  title: string;
  value: number;
  detail: string;
  icon: LucideIcon;
  href?: string;
}) {
  return (
    <Card size="sm" className="gap-2">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md">
            <Icon className="size-4" aria-hidden />
          </span>
          {title}
        </CardDescription>
        {href && (
          <CardAction>
            <Link
              href={href}
              aria-label={`Open ${title}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {value.toLocaleString("en-AE")}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">{detail}</p>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const session = await requireAdminPage();
  const overview = await getAdminOverview();
  const { accounts, supplierProfiles, products } = overview;
  const firstName = session.user.name?.split(" ")[0];

  return (
    <>
      <AdminPageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Dashboard"}
        description="What's happening across SouqFeed."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Accounts"
          value={accounts.buyers + accounts.suppliers}
          detail={`${accounts.buyers} buyers · ${accounts.suppliers} suppliers · ${accounts.lastSevenDays} new this week`}
          icon={Users}
        />
        <StatCard
          title="Supplier profiles"
          value={supplierProfiles.total}
          detail={`${supplierProfiles.active} active · ${supplierProfiles.verified} verified`}
          icon={Store}
          href="/admin/suppliers"
        />
        <StatCard
          title="Products"
          value={products.total}
          detail={`${products.active} active · ${products.total - products.active} inactive`}
          icon={Package}
          href="/admin/products"
        />
        <StatCard
          title="Brands & categories"
          value={overview.brandCount + overview.categoryCount}
          detail={`${overview.brandCount} brands · ${overview.categoryCount} categories`}
          icon={Tags}
          href="/admin/brands"
        />
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>Recent sign-ups</CardTitle>
            <CardDescription>The newest accounts on SouqFeed.</CardDescription>
          </CardHeader>
          <CardContent>
            {overview.recentSignups.length === 0 ? (
              <p className="text-muted-foreground text-sm">No accounts yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">
                      Joined
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.recentSignups.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="max-w-64">
                        <div className="truncate font-medium">
                          {account.name}
                        </div>
                        <div className="text-muted-foreground truncate text-xs">
                          {account.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {ROLE_LABELS[account.role] ?? account.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden text-right tabular-nums sm:table-cell">
                        {formatDate(account.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Needs attention</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href="/admin/suppliers"
                className="hover:bg-muted flex items-center gap-3 rounded-lg border p-3 transition-colors"
              >
                <BadgeCheck className="text-primary size-5" aria-hidden />
                <span className="flex-1 text-sm">
                  <span className="font-semibold tabular-nums">
                    {supplierProfiles.awaitingVerification}
                  </span>{" "}
                  active{" "}
                  {supplierProfiles.awaitingVerification === 1
                    ? "supplier"
                    : "suppliers"}{" "}
                  awaiting verification
                </span>
                <ArrowRight
                  className="text-muted-foreground size-4"
                  aria-hidden
                />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button
                variant="outline"
                className="justify-start"
                nativeButton={false}
                render={<Link href="/admin/products/new" />}
              >
                <Plus aria-hidden />
                Add a product
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                nativeButton={false}
                render={<Link href="/admin/brands" />}
              >
                <Tags aria-hidden />
                Manage brands
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                nativeButton={false}
                render={<Link href="/admin/categories" />}
              >
                <FolderTree aria-hidden />
                Manage categories
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
