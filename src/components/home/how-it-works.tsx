import { MessageCircle, Package, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: MessageCircle,
    title: "Suppliers broadcast on WhatsApp",
    description:
      "Stock updates arrive exactly how Dubai's IT wholesale trade already works — no new habit required.",
  },
  {
    icon: Sparkles,
    title: "SouqFeed parses and matches",
    description:
      "Each broadcast is parsed for product, price, and quantity, then matched to a canonical product record.",
  },
  {
    icon: Package,
    title: "Structured, searchable offers",
    description:
      "Matched offers go live immediately — searchable, comparable, traceable back to the original broadcast.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-10">
      <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
        How it works
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.title}
            className="border-border bg-card rounded-md border p-4"
          >
            <step.icon className="text-primary size-5" aria-hidden />
            <h3 className="text-foreground mt-3 text-sm font-semibold">
              {step.title}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
