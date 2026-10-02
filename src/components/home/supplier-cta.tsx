import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BroadcastRings } from "@/components/home/broadcast-rings";

export function SupplierCta() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-10">
      <div className="relative flex flex-col items-start gap-5 overflow-hidden rounded-xl bg-gradient-to-br from-[#06281C] via-[#0F6B45] to-[#1F9D6B] p-8 lg:flex-row lg:items-center lg:justify-between">
        <BroadcastRings className="top-1/2 right-[-100px] size-[320px] -translate-y-1/2" />
        <div className="relative max-w-xl">
          <h2 className="text-xl font-bold text-white">
            Already broadcasting stock on WhatsApp?
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Paste your broadcast here. We parse it, match it to the right
            product and category, and put it in front of verified buyers
            searching the Dubai IT wholesale market.
          </p>
        </div>
        <Button
          size="lg"
          nativeButton={false}
          className="relative bg-white text-[#0F6B45] hover:bg-white/90"
          render={<Link href="/login" />}
        >
          <MessageCircle className="mr-1 size-4" aria-hidden />
          Get Started
        </Button>
      </div>
    </section>
  );
}
