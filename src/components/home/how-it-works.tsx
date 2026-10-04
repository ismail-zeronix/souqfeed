const STEPS = [
  {
    number: "01",
    text: "Supplier broadcasts stock on WhatsApp",
  },
  {
    number: "02",
    text: "SouqFeed parses it into structured, searchable offers",
  },
  {
    number: "03",
    text: "Buyer searches, finds it, contacts the supplier directly",
  },
];

export function HowItWorks() {
  return (
    <section className="border-border mx-auto w-full max-w-[1440px] border-t px-6 py-10">
      <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
        How it works
      </h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <div
            key={step.number}
            className={
              index > 0
                ? "border-border pt-4 sm:border-l sm:pt-0 sm:pl-6"
                : "sm:pr-6"
            }
          >
            <span className="text-muted-foreground/50 text-3xl font-bold tabular-nums">
              {step.number}
            </span>
            <p className="text-foreground mt-2 text-sm">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
