import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, ClipboardPaste } from "lucide-react";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { AddOfferForm } from "@/components/offers/add-offer/add-offer-form";
import { UpdateOfferForm } from "@/components/offers/add-offer/update-offer-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireSupplierPage } from "@/lib/auth/session";
import { isUuid } from "@/lib/validation/form";
import {
  getAddOfferOptions,
  getOfferPrefill,
} from "@/modules/broadcasts/manual/queries";
import { getOffer } from "@/modules/offers/queries";

export const metadata: Metadata = {
  title: "Add an offer",
  robots: { index: false, follow: false },
};

type Params = Record<string, string | string[] | undefined>;

const uuidParam = (value: string | string[] | undefined) =>
  typeof value === "string" && isUuid(value) ? value : null;

export default async function NewOfferPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const { supplier } = await requireSupplierPage();
  const params = await searchParams;

  if (!supplier.active) {
    return (
      <DashboardPage
        back={{ href: "/dashboard/offers", label: "Your offers" }}
        eyebrow="Offers"
        title="Add an offer"
      >
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Your profile is hidden by SouqFeed, so you can&apos;t add offers.
              Contact SouqFeed to restore it.
            </p>
          </CardContent>
        </Card>
      </DashboardPage>
    );
  }

  const updatingId = uuidParam(params.offer);
  if (updatingId) {
    const prefill = await getOfferPrefill(updatingId, supplier.id);
    if (!prefill) notFound();
    return (
      <DashboardPage
        back={{ href: `/dashboard/offers/${updatingId}`, label: "Offer" }}
        eyebrow="Update price & stock"
        title={prefill.product.title}
        description={`${prefill.brandName}${prefill.product.partNumber ? ` · ${prefill.product.partNumber}` : ""}. Publishing records the new values in the offer's history and marks it as just confirmed.`}
      >
        <Card>
          <CardContent>
            <UpdateOfferForm offerId={updatingId} prefill={prefill} />
          </CardContent>
        </Card>
      </DashboardPage>
    );
  }

  const addedId = uuidParam(params.added);
  const [options, added] = await Promise.all([
    getAddOfferOptions(),
    addedId ? getOffer(addedId, supplier.id) : undefined,
  ]);

  return (
    <DashboardPage
      back={{ href: "/dashboard/offers", label: "Your offers" }}
      eyebrow="Offers"
      title="Add an offer"
      description="Pick the product from the SouqFeed catalog and set your price. Have a whole stock list? Paste it as a broadcast instead."
      actions={
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/dashboard/broadcasts/new" />}
        >
          <ClipboardPaste aria-hidden />
          Paste a list
        </Button>
      }
    >
      {added && (
        <div
          role="status"
          className="border-primary/30 bg-primary/5 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm"
        >
          <CircleCheck className="text-primary size-5 shrink-0" aria-hidden />
          <p className="min-w-0 flex-1">
            <span className="font-medium">{added.title}</span> is live. Add the
            next one below.
          </p>
          <Link
            href={`/dashboard/offers/${added.id}`}
            className="text-primary font-medium hover:underline"
          >
            View offer
          </Link>
        </div>
      )}
      <AddOfferForm
        // A fresh form after each published offer.
        key={addedId ?? "new"}
        options={options}
        initialCategoryId={uuidParam(params.category)}
        initialBrandId={uuidParam(params.brand)}
      />
    </DashboardPage>
  );
}
