import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignupDialog } from "@/components/layout/signup-dialog";
import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";

export function SupplierCta() {
  return (
    <section className="mx-auto my-8 w-full max-w-[1180px] rounded-3xl bg-gradient-to-r from-[#e9e1ff] via-[#dcd0ff] to-[#f0eaff]">
      <div className="mx-auto flex w-full flex-col items-start gap-5 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
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
        <div className="flex w-full items-center justify-between gap-5 lg:w-auto">
          <SouqFeedAgent
            state="waving"
            size="md"
            alt="SouqFeed mascot waving"
            className="drop-shadow-[0_10px_12px_rgba(72,34,182,0.2)]"
          />
          <SignupDialog
            trigger={
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <MessageCircle className="mr-1 size-4" aria-hidden />
                Get Started
              </Button>
            }
          />
        </div>
      </div>
    </section>
  );
}
