import type { Metadata } from "next";
import { BroadcastForm } from "@/components/broadcasts/broadcast-form";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { Card, CardContent } from "@/components/ui/card";
import { requireSupplierPage } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Post a broadcast",
  robots: { index: false, follow: false },
};

export default async function NewBroadcastPage() {
  const { supplier } = await requireSupplierPage();

  return (
    <DashboardPage
      back={{ href: "/dashboard/broadcasts", label: "Your broadcasts" }}
      eyebrow="Broadcasts"
      title="Post a broadcast"
      description="Paste the stock message you already send on WhatsApp. Keep it as it is: SouqFeed saves the original and reads the products from it."
    >
      <Card>
        <CardContent>
          {supplier.active ? (
            <BroadcastForm />
          ) : (
            <p className="text-muted-foreground text-sm">
              Your profile is hidden by SouqFeed, so you can&apos;t post
              broadcasts. Contact SouqFeed to restore it.
            </p>
          )}
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
