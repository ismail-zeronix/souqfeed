import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  Boxes,
  Clock3,
  PackagePlus,
  Search,
  TrendingUp,
} from "lucide-react";
import { getDashboardCopy } from "@/components/dashboard/dashboard-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/lib/auth/session";
import { canAccessUserDashboard } from "@/modules/auth/guards";
import { getMockOffers } from "@/modules/offers/mock-data";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const activity = [
  {
    label: "Live market refreshed",
    detail: "New supplier offers are available",
    icon: TrendingUp,
  },
  {
    label: "Your workspace is ready",
    detail: "Save offers and keep shortlists in one place",
    icon: Bookmark,
  },
  {
    label: "Verified suppliers",
    detail: "Browse active sellers across the UAE",
    icon: Boxes,
  },
];

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!canAccessUserDashboard(session.user.role))
    redirect(session.user.role === "ADMIN" ? "/admin" : "/login");

  const role = String(session.user.role);
  const copy = getDashboardCopy(role);
  const offers = getMockOffers();
  const displayName = session.user.name?.split(" ")[0] || "there";
  const stats =
    role === "SUPPLIER"
      ? [
          { label: "Active listings", value: "0", icon: PackagePlus },
          { label: "Buyer views", value: "0", icon: TrendingUp },
          { label: "Messages", value: "0", icon: Clock3 },
        ]
      : [
          {
            label: "Live offers",
            value: offers.length.toLocaleString(),
            icon: TrendingUp,
          },
          { label: "Saved offers", value: "0", icon: Bookmark },
          { label: "Suppliers", value: "120+", icon: Boxes },
        ];

  return (
    <main className="bg-muted/30 flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Hi {displayName},<br className="sm:hidden" /> {copy.title}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-6">
              {copy.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Button nativeButton={false} render={<Link href="/feed" />}>
              <Search className="size-4" />
              {copy.primaryAction}
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/feed" />}
              className="hidden sm:inline-flex"
            >
              {copy.secondaryAction}
            </Button>
          </div>
        </div>
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl border p-5">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  {stat.label}
                </span>
                <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                  <stat.icon className="size-4" />
                </span>
              </div>
              <p className="text-3xl font-semibold tracking-tight">
                {stat.value}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Updated just now
              </p>
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="bg-card rounded-2xl border p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Recent activity</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  A quick pulse on your SouqFeed workspace.
                </p>
              </div>
              <Badge variant="secondary">Today</Badge>
            </div>
            <div className="divide-border divide-y">
              {activity.map(({ label, detail, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {detail}
                    </p>
                  </div>
                  <ArrowRight className="text-muted-foreground size-4" />
                </div>
              ))}
            </div>
          </section>
          <aside className="bg-primary text-primary-foreground relative overflow-hidden rounded-2xl p-6">
            <div className="absolute -right-10 -bottom-16 size-40 rounded-full bg-white/10" />
            <p className="relative text-xs font-semibold tracking-[0.16em] uppercase">
              Next step
            </p>
            <h2 className="relative mt-3 text-2xl font-semibold">
              {role === "SUPPLIER"
                ? "Put your stock in front of buyers."
                : "Find your next great deal."}
            </h2>
            <p className="relative mt-3 text-sm leading-6 text-white/75">
              {role === "SUPPLIER"
                ? "Create your first listing and start building a trusted supplier profile."
                : "Search live offers by brand, model, SKU, or specification."}
            </p>
            <Button
              variant="secondary"
              nativeButton={false}
              render={<Link href="/feed" />}
              className="relative mt-6"
            >
              Get started <ArrowRight className="size-4" />
            </Button>
          </aside>
        </div>
      </div>
    </main>
  );
}
