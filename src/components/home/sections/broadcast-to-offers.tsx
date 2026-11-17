import { ArrowDown, ArrowRight } from "lucide-react";
import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";

// A made-up example, labelled as one on the page. It shows the idea, not real stock.
const MESSY = [
  "Dell latitude 5440 i5 16gb 512ssd 2450 x10",
  "hp prodesk 400 g9 i7 32/1tb 3100 qty 5",
  "wd red plus 4tb sata - ask",
];

const CLEAN = [
  {
    title: "Dell Latitude 5440",
    spec: "Core i5 · 16GB · 512GB SSD",
    price: "AED 2,450",
    qty: "10 pcs",
  },
  {
    title: "HP ProDesk 400 G9",
    spec: "Core i7 · 32GB · 1TB",
    price: "AED 3,100",
    qty: "5 pcs",
  },
  { title: "WD Red Plus 4TB", spec: "SATA", price: "Ask", qty: "" },
];

/** The product's core idea: a messy WhatsApp list on one side, clean searchable offers on the other. */
export function BroadcastToOffers() {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 pt-10 md:px-5 md:pt-14">
      <div className="rounded-[2rem] border border-[#e6e0ff] bg-white p-5 shadow-[0_10px_40px_rgba(71,42,170,0.07)] md:p-9">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-primary text-xs font-bold tracking-[0.16em] uppercase">
            For suppliers
          </p>
          <h2 className="font-display text-foreground mt-2 text-2xl font-extrabold tracking-tight md:text-4xl">
            Paste your broadcast. Get clean offers.
          </h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Keep sending stock the way you do today. SouqFeed reads the message
            and lists each item so buyers can find it.
          </p>
        </div>

        <div className="mt-8 grid items-center gap-4 md:grid-cols-[1fr_auto_1.1fr] md:gap-6">
          <div className="rounded-3xl bg-[#efeae2] p-4">
            <p className="text-[11px] font-semibold tracking-wide text-[#6b6255] uppercase">
              Example broadcast
            </p>
            <div className="mt-3 space-y-1.5 rounded-2xl rounded-tl-md bg-[#e7f7d4] p-3.5 font-mono text-[12.5px] leading-5 text-[#22331a] shadow-sm">
              {MESSY.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <SouqFeedAgent
              state="thinking"
              size="lg"
              alt="SouqFeed mascot reading the broadcast"
              className="drop-shadow-[0_12px_12px_rgba(72,34,182,0.22)]"
            />
            <span className="text-primary flex items-center gap-1 text-xs font-bold">
              Reads it
              <ArrowRight className="hidden size-4 md:block" aria-hidden />
              <ArrowDown className="size-4 md:hidden" aria-hidden />
            </span>
          </div>

          <div className="space-y-2.5">
            {CLEAN.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#e6e0ff] bg-[#fbfaff] p-3.5"
              >
                <div className="min-w-0">
                  <p className="font-display text-foreground truncate text-sm font-bold">
                    {item.title}
                  </p>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {item.spec}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-primary text-sm font-bold">{item.price}</p>
                  {item.qty && (
                    <p className="text-muted-foreground text-[11px]">
                      {item.qty}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
