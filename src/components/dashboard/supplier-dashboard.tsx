import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getDashboardCopy } from "@/components/dashboard/dashboard-view";
import { SupplierProfileForm } from "@/components/suppliers/supplier-profile-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toSupplierFormValues } from "@/modules/suppliers/profile";
import type { SupplierRecordWithAssociations } from "@/modules/suppliers/types";

function ProfileStatus({
  supplier,
}: {
  supplier: SupplierRecordWithAssociations;
}) {
  return (
    <section className="bg-card flex flex-col justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:p-6">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <Badge variant={supplier.verified ? "default" : "secondary"}>
            {supplier.verified ? "Verified" : "Not verified yet"}
          </Badge>
          <Badge variant={supplier.active ? "default" : "destructive"}>
            {supplier.active ? "Public" : "Hidden by SouqFeed"}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          {supplier.active
            ? "Buyers can see your profile. Verification is reviewed by the SouqFeed team."
            : "Your profile is hidden from buyers. Contact SouqFeed to restore it."}
        </p>
      </div>
      {supplier.active && (
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/suppliers/${supplier.slug}`} />}
          className="shrink-0"
        >
          View public profile
          <ExternalLink className="size-4" aria-hidden />
        </Button>
      )}
    </section>
  );
}

export function SupplierDashboard({
  displayName,
  supplier,
  brands,
  categories,
}: {
  displayName: string;
  supplier: SupplierRecordWithAssociations | undefined;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const copy = getDashboardCopy("SUPPLIER");

  return (
    <main className="bg-muted/30 flex-1">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-12">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Hi {displayName},
            <br className="sm:hidden" />{" "}
            {supplier ? "manage your profile." : "create your profile."}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-6">
            {supplier
              ? "Keep your details current so buyers can find and reach you."
              : "Add your company details so buyers can find you and contact you on WhatsApp."}
          </p>
        </div>

        {supplier && <ProfileStatus supplier={supplier} />}

        <section className="bg-card rounded-2xl border p-5 sm:p-6">
          <h2 className="mb-5 font-semibold">Company profile</h2>
          <SupplierProfileForm
            mode={supplier ? "edit" : "create"}
            initialValues={toSupplierFormValues(supplier)}
            brands={brands}
            categories={categories}
          />
        </section>
      </div>
    </main>
  );
}
