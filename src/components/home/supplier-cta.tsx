import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SupplierCta() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-10">
      <div className="border-border bg-primary/5 flex flex-col items-start gap-4 rounded-md border p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 className="text-foreground text-xl font-bold">
            Already broadcasting stock on WhatsApp?
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Paste your broadcast here. We parse it, match it to the right
            product and category, and put it in front of verified buyers
            searching the Dubai IT wholesale market.
          </p>
        </div>
        <Button size="lg" nativeButton={false} render={<Link href="/login" />}>
          <MessageCircle className="mr-1 size-4" aria-hidden />
          Get Started
        </Button>
      </div>
    </section>
  );
}
