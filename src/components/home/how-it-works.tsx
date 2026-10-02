const STEPS: { title: string; description: string }[] = [
  {
    title: "Suppliers broadcast on WhatsApp",
    description:
      "Stock updates arrive exactly how Dubai's IT wholesale trade already works — no new habit required.",
  },
  {
    title: "SouqFeed parses and matches",
    description:
      "Each broadcast is parsed for product, price, and quantity, then matched to a canonical product record.",
  },
  {
    title: "Structured, searchable offers",
    description:
      "Matched offers go live immediately — searchable, comparable, traceable back to the original broadcast.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-[1440px] scroll-mt-20 px-6 pt-20 pb-10"
    >
      <h2 className="text-foreground text-center text-sm font-semibold tracking-wide uppercase sm:text-left">
        How it works
      </h2>
      <div className="relative mt-8 grid gap-8 sm:grid-cols-3">
        <div
          className="border-border absolute top-6 right-[16.66%] left-[16.66%] hidden border-t-2 border-dashed sm:block"
          aria-hidden
        />
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className="relative flex flex-col items-center text-center"
          >
            <div className="bg-card border-primary text-primary relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 text-base font-bold">
              {index + 1}
            </div>
            <h3 className="text-foreground mt-4 text-sm font-semibold">
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
