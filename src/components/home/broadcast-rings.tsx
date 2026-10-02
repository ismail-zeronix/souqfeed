import { cn } from "@/lib/utils";

// Concentric "signal" rings — a broadcast rippling outward. Stands in for a
// generic decorative blob/pattern with something that actually means
// something here: WhatsApp broadcasts rippling out into structured offers.
export function BroadcastRings({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute", className)} aria-hidden>
      <div className="relative size-full">
        <span className="absolute inset-0 rounded-full border border-white/10" />
        <span className="absolute inset-[14%] rounded-full border border-white/10" />
        <span className="absolute inset-[28%] rounded-full border border-[#E8B968]/25" />
        <span className="absolute inset-[42%] animate-ping rounded-full border border-[#E8B968]/40 [animation-duration:3s]" />
        <span className="absolute inset-[42%] rounded-full bg-[#E8B968]/20" />
      </div>
    </div>
  );
}
