import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupplierSummary } from "@/modules/suppliers/types";

function MarqueeRow({
  suppliers,
  reverse = false,
}: {
  suppliers: SupplierSummary[];
  reverse?: boolean;
}) {
  // Doubled so a -50% translate loops seamlessly; pure CSS (no JS state)
  // so hover-to-pause and prefers-reduced-motion both work for free.
  const doubled = [...suppliers, ...suppliers];

  return (
    <div className="group overflow-hidden">
      <div
        className={cn(
          "flex w-max gap-3",
          reverse
            ? "animate-[marquee-right_28s_linear_infinite]"
            : "animate-[marquee-left_28s_linear_infinite]",
          "group-hover:[animation-play-state:paused] motion-reduce:animate-none",
        )}
      >
        {doubled.map((supplier, index) => (
          <Link
            key={`${supplier.id}-${index}`}
            href={`/suppliers/${supplier.slug}`}
            className="border-border bg-background hover:bg-primary/5 flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap"
          >
            <ShieldCheck className="text-primary size-3.5" aria-hidden />
            {supplier.companyName}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function TrustStrip({ suppliers }: { suppliers: SupplierSummary[] }) {
  const mid = Math.ceil(suppliers.length / 2);
  const rowA = suppliers.slice(0, mid);
  const rowB = suppliers.slice(mid).length > 0 ? suppliers.slice(mid) : rowA;

  return (
    <section className="border-border bg-card border-y">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-6 py-10">
        <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          Trusted by Verified Suppliers
        </h2>
        <div className="flex w-full flex-col gap-3">
          <MarqueeRow suppliers={rowA} />
          <MarqueeRow suppliers={rowB} reverse />
        </div>
      </div>
    </section>
  );
}
