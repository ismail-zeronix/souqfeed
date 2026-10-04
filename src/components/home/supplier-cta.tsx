import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignupDialog } from "@/components/layout/signup-dialog";

export function SupplierCta() {
  return (
    <section className="mx-auto my-8 w-full max-w-[1392px] rounded-3xl bg-gradient-to-r from-[#e9e1ff] via-[#dcd0ff] to-[#f0eaff]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-5 px-6 py-10 lg:flex-row lg:items-center lg:justify-between">
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
        <SignupDialog
          trigger={
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
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
