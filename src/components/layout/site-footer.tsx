"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Mail, Radio } from "lucide-react";

const PLATFORM_LINKS: { label: string; href: string | null }[] = [
  { label: "Live Market", href: "/feed" },
  { label: "Suppliers", href: null },
  { label: "Search", href: null },
  { label: "WTB", href: null },
];

const COMPANY_LINKS: string[] = ["About", "Careers", "Contact"];
const LEGAL_LINKS: string[] = ["Terms", "Privacy"];

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string | null }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold tracking-wide text-white/50 uppercase">
        {title}
      </span>
      {links.map((link) =>
        link.href ? (
          <Link
            key={link.label}
            href={link.href}
            className="hover:text-live text-sm text-white/80 transition-colors"
          >
            {link.label}
          </Link>
        ) : (
          <span
            key={link.label}
            className="text-sm text-white/40"
            aria-disabled
          >
            {link.label}
          </span>
        ),
      )}
    </div>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/login")) return null;
  return (
    <footer className="bg-[#21184e]">
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr]">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
            <Image
              src="/brand/mascot/souqfeed_mascot_happy.gif"
              alt=""
              width={42}
              height={42}
              unoptimized
              className="size-10 object-contain"
            />
            Souq<span className="text-[#b9a6ff]">Feed</span>
          </div>
          <p className="mt-3 text-sm text-white/60">
            Structured, searchable offers from Dubai&apos;s IT wholesale
            WhatsApp market.
          </p>
          <div className="text-live mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">
            <Radio className="size-3.5" aria-hidden />
            Live across the UAE
          </div>
        </div>

        <FooterLinkColumn title="Explore" links={PLATFORM_LINKS} />
        <FooterLinkColumn
          title="Company"
          links={COMPANY_LINKS.map((label) => ({ label, href: null }))}
        />
        <FooterLinkColumn
          title="Legal"
          links={LEGAL_LINKS.map((label) => ({ label, href: null }))}
        />
      </div>

      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3 px-5 pb-8 text-xs text-white/45">
        <span className="inline-flex items-center gap-1.5">
          <Mail className="size-3.5" /> Built for UAE IT trade
        </span>
        <Link
          href="/feed"
          className="inline-flex items-center gap-1 text-white/70 transition hover:text-white"
        >
          Browse the live market <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-5 text-center">
          <span className="text-xs text-white/40">
            © {new Date().getFullYear()} SouqFeed. Dubai, UAE.
          </span>
        </div>
      </div>
    </footer>
  );
}
