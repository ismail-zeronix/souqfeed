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
    <section className="mx-auto w-full max-w-[1440px] border-t border-[#ebe6ff] px-6 py-14">
      <h2 className="text-foreground text-center text-2xl font-bold tracking-tight">How SouqFeed Works</h2>
      <p className="text-muted-foreground mt-2 text-center text-sm">From WhatsApp broadcasts to a structured, searchable IT market.</p>
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <div
            key={step.number}
            className={
              index > 0
                ? "rounded-2xl border border-[#ebe6ff] bg-white p-5"
                : "rounded-2xl border border-[#ebe6ff] bg-white p-5"
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
