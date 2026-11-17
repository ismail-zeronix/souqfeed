import { Info } from "lucide-react";

/**
 * Shown while no supplier has published yet: the listings on the page are
 * illustrative, and must never pass for real offers.
 */
export function SampleDataNotice() {
  return (
    <div
      role="note"
      className="border-primary/20 bg-primary/5 text-foreground mx-auto flex w-full max-w-[1440px] items-start gap-2 border-b px-4 py-2.5 text-xs sm:items-center sm:px-6"
    >
      <Info
        className="text-primary mt-0.5 size-4 shrink-0 sm:mt-0"
        aria-hidden
      />
      <p>
        <span className="font-semibold">Sample listings.</span> These show how
        SouqFeed works. Real supplier offers replace them as soon as suppliers
        publish their stock.
      </p>
    </div>
  );
}
