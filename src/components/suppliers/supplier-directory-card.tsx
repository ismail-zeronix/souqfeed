import Link from "next/link";
import { ChatLink } from "@/components/chat/chat-link";
import { BadgeCheck, MapPin, MessageCircle } from "lucide-react";
import type { DirectorySupplier } from "@/modules/suppliers/directory-filter";

const TONES = [
  "bg-[#efeaff] text-[#6c42f5]",
  "bg-[#e3f3ff] text-[#1f7fc4]",
  "bg-[#e4f7ec] text-[#1b8f50]",
  "bg-[#fff1df] text-[#c46a14]",
  "bg-[#ffe9ef] text-[#c43a64]",
];

function toneFor(name: string) {
  let sum = 0;
  for (const char of name) sum += char.charCodeAt(0);
  return TONES[sum % TONES.length];
}

export function SupplierDirectoryCard({
  supplier,
}: {
  supplier: DirectorySupplier;
}) {
  const shown = supplier.categoryNames.slice(0, 3);
  const extra = supplier.categoryNames.length - shown.length;
  const whatsapp = supplier.whatsappNumber.replace(/\D/g, "");

  return (
    <article className="group relative flex min-w-0 flex-col rounded-3xl border border-[#e6e0ff] bg-white p-5 shadow-[0_6px_20px_rgba(71,42,170,0.05)] transition hover:-translate-y-0.5 hover:border-[#cfc4ff] hover:shadow-[0_12px_30px_rgba(71,42,170,0.12)]">
      <div className="flex items-start gap-3.5">
        <span
          className={`font-display flex size-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold ${toneFor(supplier.companyName)}`}
          aria-hidden
        >
          {supplier.companyName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-foreground flex min-w-0 items-center gap-1.5 text-base leading-tight font-extrabold">
            <Link
              href={`/suppliers/${supplier.slug}`}
              className="truncate before:absolute before:inset-0 before:rounded-3xl"
            >
              {supplier.companyName}
            </Link>
            {supplier.verified && (
              <BadgeCheck
                className="text-live size-4.5 shrink-0"
                aria-label="Verified supplier"
              />
            )}
          </h2>
          {supplier.locationName && (
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              <MapPin className="size-3.5" aria-hidden />
              {supplier.locationName}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-display text-primary text-xl leading-none font-extrabold tabular-nums">
            {supplier.activeOfferCount}
          </p>
          <p className="text-muted-foreground mt-1 text-[11px]">
            live {supplier.activeOfferCount === 1 ? "offer" : "offers"}
          </p>
        </div>
      </div>

      {supplier.description && (
        <p className="text-muted-foreground mt-3 line-clamp-2 text-[13px] leading-5">
          {supplier.description}
        </p>
      )}

      {shown.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {shown.map((name) => (
            <li
              key={name}
              className="text-foreground/75 rounded-full bg-[#f5f2ff] px-2.5 py-1 text-[11px] font-semibold"
            >
              {name}
            </li>
          ))}
          {extra > 0 && (
            <li className="text-muted-foreground rounded-full bg-[#f5f2ff] px-2.5 py-1 text-[11px] font-semibold">
              +{extra}
            </li>
          )}
        </ul>
      )}

      <div className="relative z-10 mt-auto flex items-center gap-2 pt-4">
        <Link
          href={`/suppliers/${supplier.slug}`}
          className="bg-primary/10 text-primary hover:bg-primary/15 flex-1 rounded-full px-4 py-2 text-center text-[13px] font-bold"
        >
          View profile
        </Link>
        {whatsapp && (
          <ChatLink
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Live chat about ${supplier.companyName}`}
            title="Live chat"
            className="bg-primary flex size-9 items-center justify-center rounded-full text-white"
            request={{
              supplierName: supplier.companyName,
              source: "Supplier directory",
            }}
          >
            <MessageCircle className="size-4.5" aria-hidden />
          </ChatLink>
        )}
      </div>
    </article>
  );
}
