import { Mail, MapPin, Phone } from "lucide-react";
import type { SupplierProfile } from "@/modules/suppliers/types";

export function SupplierContactPanel({
  supplier,
}: {
  supplier: SupplierProfile;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="border-border bg-card rounded-md border p-4">
        <h3 className="text-foreground mb-3 text-sm font-semibold">
          Contact Information
        </h3>
        <div className="text-muted-foreground flex flex-col gap-2 text-sm">
          {supplier.phone && (
            <span className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden />
              {supplier.phone}
            </span>
          )}
          {supplier.email && (
            <span className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden />
              {supplier.email}
            </span>
          )}
          {supplier.address && (
            <span className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {supplier.address}
            </span>
          )}
          {supplier.googleMapsUrl && (
            <a
              href={supplier.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              View on Google Maps
            </a>
          )}
        </div>
      </div>

      <div className="border-border bg-card rounded-md border p-4">
        <h3 className="text-foreground mb-3 text-sm font-semibold">
          Business Hours
        </h3>
        <div className="flex flex-col gap-2 text-sm">
          {supplier.businessHours.map((entry) => (
            <div
              key={entry.day}
              className="text-muted-foreground flex items-center justify-between"
            >
              <span>{entry.day}</span>
              <span className="text-foreground">{entry.hours}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
