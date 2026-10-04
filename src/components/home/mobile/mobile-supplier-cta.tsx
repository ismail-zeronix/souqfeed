import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignupDialog } from "@/components/layout/signup-dialog";
import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";

export function MobileSupplierCta() {
  return (
    <section className="px-4 pt-6 pb-8">
      <div className="bg-primary rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-bold text-white">
            Already broadcasting stock on WhatsApp?
          </h2>
          <SouqFeedAgent
            state="waving"
            size="sm"
            alt="SouqFeed mascot waving"
          />
        </div>
        <p className="mt-1.5 text-xs text-white/80">
          Turn your WhatsApp stock broadcasts into structured, searchable offers
          and reach more buyers in the UAE IT market.
        </p>
        <SignupDialog
          trigger={
            <Button
              size="sm"
              className="text-primary mt-3 bg-white hover:bg-white/90"
            >
              <MessageCircle className="mr-1 size-4" aria-hidden />
              Get Started
            </Button>
          }
        />
      </div>
    </section>
  );
}
