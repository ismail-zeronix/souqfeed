import { notFound } from "next/navigation";
import { SupplierHeader } from "@/components/suppliers/supplier-header";
import { SupplierStatRow } from "@/components/suppliers/supplier-stat-row";
import { SupplierTabs } from "@/components/suppliers/supplier-tabs";
import { SupplierInsightsSidebar } from "@/components/suppliers/supplier-insights-sidebar";
import { SupplierContactPanel } from "@/components/suppliers/supplier-contact-panel";
import { SupplierOffersSection } from "@/components/suppliers/supplier-offers-section";
import { getMockSupplierBySlug } from "@/modules/suppliers/mock-data";
import { getMockOffers } from "@/modules/offers/mock-data";

export default async function SupplierProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supplier = getMockSupplierBySlug(slug);

  if (!supplier) {
    notFound();
  }

  const offers = getMockOffers().filter((offer) => offer.supplierSlug === slug);

  return (
    <>
      <SupplierHeader supplier={supplier} />
      <SupplierStatRow supplier={supplier} />
      <div className="mx-auto w-full max-w-[1440px] px-6 pb-10">
        <SupplierTabs
          liveOffersContent={
            <div className="flex flex-col gap-6 pt-4 lg:flex-row">
              <SupplierOffersSection
                supplierName={supplier.companyName}
                offers={offers}
              />
              <div className="w-full shrink-0 lg:w-80">
                <SupplierInsightsSidebar supplier={supplier} />
                <div className="mt-4">
                  <SupplierContactPanel supplier={supplier} />
                </div>
              </div>
            </div>
          }
        />
      </div>
    </>
  );
}
