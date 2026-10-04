import Link from "next/link";
import { ArrowRight, ChevronDown, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    question: "Is SouqFeed another WhatsApp group?",
    answer:
      "No. Suppliers can keep broadcasting through the channels they already use, while SouqFeed turns those broadcasts into structured, searchable market offers for buyers.",
  },
  {
    question: "Who is SouqFeed for?",
    answer:
      "It is built for UAE IT suppliers, resellers, system integrators, procurement teams, and anyone who needs faster access to live wholesale stock.",
  },
  {
    question: "Can suppliers list stock without rebuilding their workflow?",
    answer:
      "Yes. The product is designed around existing supplier broadcasts, helping sellers publish once and reach buyers searching for the exact product, quantity, or specification.",
  },
  {
    question: "How do buyers contact suppliers?",
    answer:
      "Buyers can review the supplier, offer details, availability, and location, then contact the supplier directly through the available contact action.",
  },
  {
    question: "Where is the market data focused?",
    answer:
      "The initial market focus is Dubai’s IT wholesale ecosystem, including Bur Dubai, Deira, Al Fahidi, and nearby trading areas.",
  },
];

export function HomeFaq() {
  return (
    <section className="mx-auto w-full max-w-[1180px] border-t border-[#ebe6ff] px-5 py-10 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Badge
            variant="outline"
            className="text-primary gap-1.5 border-[#d7ccff] bg-white"
          >
            <HelpCircle className="size-3.5" /> Quick answers
          </Badge>
          <h2 className="text-foreground mt-3 text-2xl font-bold tracking-tight">
            Questions buyers and suppliers ask
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            A simpler way to understand how SouqFeed fits between your existing
            conversations and your next B2B deal.
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/feed" />}
            className="mt-5"
          >
            Explore the live market{" "}
            <ArrowRight className="ml-1 size-4" aria-hidden />
          </Button>
        </div>
        <div className="divide-y divide-[#ebe6ff] rounded-2xl border border-[#ebe6ff] bg-white px-5 shadow-[0_5px_18px_rgba(71,42,170,0.04)]">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group py-4">
              <summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown
                  className="text-primary size-4 shrink-0 transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="text-muted-foreground mt-3 max-w-2xl pr-7 text-sm leading-6">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
