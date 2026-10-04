"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { LiveMarketCard } from "@/components/market/live-market-card";
import type { OfferListItem } from "@/modules/offers/types";

export function LiveMarketSnapshot({ offers }: { offers: OfferListItem[] }) {
  const preview = offers.slice(0, 9);

  return (
    <section className="mx-auto w-full max-w-[1180px] px-5 py-7 lg:py-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            Latest Supplier Offers
          </h2>
        </div>
        <Link
          href="/feed"
          className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
        >
          View all offers
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {preview.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.45,
              delay: (index % 3) * 0.08,
              ease: "easeOut",
            }}
          >
            <LiveMarketCard offer={offer} summary />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
