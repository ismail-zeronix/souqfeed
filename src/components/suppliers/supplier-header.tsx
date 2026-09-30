import Link from "next/link";
import { BadgeCheck, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupplierLogoTile } from "@/components/ui/supplier-logo-tile";
import type { SupplierProfile } from "@/modules/suppliers/types";

export function SupplierHeader({ supplier }: { supplier: SupplierProfile }) {
  const whatsappHref = `https://wa.me/${supplier.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <div className="border-border bg-card border-b">
      <div className="mx-auto max-w-[1440px] px-6 py-6">
        <nav className="text-muted-foreground mb-4 text-sm">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{supplier.companyName}</span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
            <SupplierLogoTile initial={supplier.logoInitial} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-foreground text-2xl font-bold break-words">
                  {supplier.companyName}
                </h1>
                {supplier.verified && (
                  <BadgeCheck
                    className="text-primary size-5 shrink-0"
                    aria-label="Verified Supplier"
                  />
                )}
              </div>
              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden />
                  {supplier.locationName}
                </span>
                <span>·</span>
                <span>{supplier.positiveScorePercent}% Positive</span>
                <span>·</span>
                <span>Active since {supplier.memberSinceYear}</span>
                <span>·</span>
                <span className="text-primary">Verified Supplier</span>
              </div>
              {supplier.description && (
                <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
                  {supplier.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {supplier.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border-border text-muted-foreground rounded border px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              nativeButton={false}
              render={
                <a href={whatsappHref} target="_blank" rel="noreferrer" />
              }
            >
              WhatsApp
            </Button>
            {supplier.phone && (
              <Button
                variant="outline"
                nativeButton={false}
                render={<a href={`tel:${supplier.phone}`} />}
              >
                <Phone className="mr-1 size-4" aria-hidden />
                Call
              </Button>
            )}
            {supplier.email && (
              <Button
                variant="outline"
                nativeButton={false}
                render={<a href={`mailto:${supplier.email}`} />}
              >
                <Mail className="mr-1 size-4" aria-hidden />
                Email
              </Button>
            )}
            {supplier.googleMapsUrl && (
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <a
                    href={supplier.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <MapPin className="mr-1 size-4" aria-hidden />
                Visit Location
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
