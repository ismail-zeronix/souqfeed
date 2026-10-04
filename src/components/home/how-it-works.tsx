import { ArrowRight, Braces, MessageCircle, Search } from "lucide-react";
import {
  SouqFeedAgent,
  type SouqFeedAgentState,
} from "@/components/ui/souqfeed-agent";

const STEPS: Array<{
  number: string;
  title: string;
  text: string;
  state: SouqFeedAgentState;
  icon: typeof MessageCircle;
}> = [
  {
    number: "01",
    title: "Broadcast once",
    text: "Suppliers keep using WhatsApp to share stock, prices, and availability.",
    state: "waving",
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "SouqFeed makes sense of it",
    text: "The noise becomes clean product, category, and supplier data buyers can actually search.",
    state: "thinking",
    icon: Braces,
  },
  {
    number: "03",
    title: "Connect with intent",
    text: "Buyers find the right offer and contact the supplier directly—without digging through old chats.",
    state: "happy",
    icon: Search,
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-[1180px] border-t border-[#ebe6ff] px-5 py-10 lg:py-12">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-primary text-[11px] font-bold tracking-[0.16em] uppercase">
          From noise to signal
        </p>
        <h2 className="text-foreground mt-2 text-2xl font-bold tracking-tight">
          How SouqFeed Works
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Keep the channels your market already uses. Let SouqFeed turn them
          into better B2B connections.
        </p>
      </div>
      <div className="relative mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
        <div className="bg-primary/15 pointer-events-none absolute top-14 right-[16%] left-[16%] hidden h-px md:block" />
        {STEPS.map(({ number, title, text, state, icon: Icon }) => (
          <article
            key={number}
            className="relative z-10 rounded-2xl border border-[#ebe6ff] bg-white p-5 shadow-[0_5px_18px_rgba(71,42,170,0.04)]"
          >
            <div className="flex items-start justify-between">
              <span className="text-primary flex size-9 items-center justify-center rounded-xl bg-[#f0ebff]">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="text-muted-foreground/50 text-2xl font-bold tabular-nums">
                {number}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <SouqFeedAgent
                state={state}
                size="md"
                alt={`SouqFeed mascot ${state}`}
              />
              <h3 className="text-foreground text-sm font-bold">{title}</h3>
            </div>
            <p className="text-muted-foreground mt-3 text-sm leading-5">
              {text}
            </p>
            {number !== "03" && (
              <ArrowRight
                className="text-primary/40 absolute top-12 -right-3 hidden size-5 md:block"
                aria-hidden
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
