"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { MobileOfferCard } from "@/components/home/mobile/mobile-offer-card";
import { SupplierLogoTile } from "@/components/ui/supplier-logo-tile";
import { Button } from "@/components/ui/button";
import type { OfferListItem } from "@/modules/offers/types";
import type { SupplierProfile } from "@/modules/suppliers/types";

export function MobileSupplierProfile({
  supplier,
  offers,
}: {
  supplier: SupplierProfile;
  offers: OfferListItem[];
}) {
  const whatsappHref = `https://wa.me/${supplier.whatsappNumber.replace(/\D/g, "")}`;
  const tabs = ["Live Offers", "About", "Reviews", "Activity"] as const;
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>("Live Offers");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "Live Offers") return;
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="bg-background md:hidden">
      <div className="border-border bg-card flex h-14 items-center justify-between border-b px-4">
        <Link href="/feed" aria-label="Back to live market">
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <span className="text-sm font-semibold">Supplier Profile</span>
        <div className="flex items-center gap-3">
          <Share2 className="size-4" aria-hidden />
          <MoreHorizontal className="size-5" aria-hidden />
        </div>
      </div>
      <div className="border-border bg-card border-b px-4 py-5">
        <div className="flex items-center gap-3">
          <SupplierLogoTile
            initial={getSupplierInitials(
              supplier.companyName,
              supplier.logoInitial,
            )}
            size="lg"
            className="bg-primary/10 text-primary rounded-2xl text-xl"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-lg font-bold">
                {supplier.companyName}
              </h1>
              {supplier.verified && (
                <BadgeCheck
                  className="text-primary size-5 shrink-0"
                  aria-label="Verified Supplier"
                />
              )}
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              <MapPin className="size-3.5" aria-hidden />{" "}
              {supplier.locationName} · Since {supplier.memberSinceYear}
            </p>
          </div>
        </div>
        <p className="text-muted-foreground mt-4 max-w-sm text-xs leading-relaxed">
          {supplier.description}
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            className="flex-1"
            size="sm"
            nativeButton={false}
            render={<a href={whatsappHref} target="_blank" rel="noreferrer" />}
          >
            <MessageCircle className="mr-1 size-4" aria-hidden /> WhatsApp
          </Button>
          {supplier.phone && (
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<a href={`tel:${supplier.phone}`} />}
            >
              Call Supplier
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 border-b bg-white px-2 py-4 text-center">
        <Metric value={`${supplier.positiveScorePercent}%`} label="Positive" />
        <Metric
          value={String(supplier.activeOfferCount)}
          label="Total Offers"
        />
        <Metric value={supplier.avgResponseTimeLabel} label="Response" />
        <Metric value="Active" label="Status" />
      </div>
      <div className="border-border bg-card flex [scrollbar-width:none] gap-6 overflow-x-auto border-b px-4 pt-3 [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setIsLoading(tab !== "Live Offers");
              setActiveTab(tab);
            }}
            className={`shrink-0 border-b-2 pb-3 text-xs font-medium ${activeTab === tab ? "border-primary text-primary" : "text-muted-foreground border-transparent"}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="relative min-h-80 px-4 py-4">
        {isLoading && (
          <div className="bg-background/95 absolute inset-0 z-10 flex min-h-72 flex-col items-center justify-center gap-3">
            <Image
              src="/brand/mascot-animated.svg"
              alt=""
              width={56}
              height={60}
              className="size-14"
            />
            <span className="text-muted-foreground text-xs">
              Loading {activeTab.toLowerCase()}...
            </span>
          </div>
        )}
        {!isLoading && activeTab !== "Live Offers" && (
          <div className="bg-card rounded-2xl border p-4 text-sm">
            <h2 className="font-semibold">{activeTab}</h2>
            <p className="text-muted-foreground mt-2">
              {activeTab === "About"
                ? supplier.description
                : activeTab === "Reviews"
                  ? `${supplier.positiveScorePercent}% positive buyer feedback.`
                  : "Recent supplier activity will appear here."}
            </p>
          </div>
        )}
        <div
          className={activeTab === "Live Offers" && !isLoading ? "" : "hidden"}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Live Offers</h2>
            <span className="text-primary text-xs">{offers.length} offers</span>
          </div>
          <div className="mb-4 flex [scrollbar-width:none] gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-3 py-1.5 text-xs">
              All ({offers.length})
            </span>
            {supplier.tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                className="border-border bg-card text-muted-foreground shrink-0 rounded-full border px-3 py-1.5 text-xs"
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            {offers.slice(0, 8).map((offer) => (
              <MobileOfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getSupplierInitials(companyName: string, fallback: string): string {
  const words = companyName.trim().split(/\s+/).filter(Boolean);
  return (
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`
      : fallback || companyName.slice(0, 2)
  )
    .toUpperCase()
    .slice(0, 2);
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-border border-r px-1 last:border-r-0">
      <div className="text-primary text-sm font-bold tabular-nums">{value}</div>
      <div className="text-muted-foreground mt-1 text-[10px]">{label}</div>
    </div>
  );
}
