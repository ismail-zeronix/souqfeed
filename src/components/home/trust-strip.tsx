import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { SupplierSummary } from "@/modules/suppliers/types";

export function TrustStrip({ suppliers }: { suppliers: SupplierSummary[] }) {
  const verifiedCount = suppliers.filter(
    (supplier) => supplier.verified,
  ).length;
  const avgPositive = Math.round(
    suppliers.reduce(
      (sum, supplier) => sum + supplier.positiveScorePercent,
      0,
    ) / suppliers.length,
  );

  return (
    <section className="border-border bg-card border-y">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-6 py-10 text-center">
        <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          Trusted by Verified Suppliers
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-10">
          <div>
            <div className="text-foreground text-2xl font-bold tabular-nums">
              {verifiedCount}/{suppliers.length}
            </div>
            <div className="text-muted-foreground text-xs">
              Verified suppliers
            </div>
          </div>
          <div>
            <div className="text-foreground text-2xl font-bold tabular-nums">
              {avgPositive}%
            </div>
            <div className="text-muted-foreground text-xs">
              Average positive score
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {suppliers.map((supplier) => (
            <Link
              key={supplier.id}
              href={`/suppliers/${supplier.slug}`}
              className="border-border bg-background hover:bg-primary/5 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium"
            >
              <ShieldCheck className="text-primary size-3.5" aria-hidden />
              {supplier.companyName}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
