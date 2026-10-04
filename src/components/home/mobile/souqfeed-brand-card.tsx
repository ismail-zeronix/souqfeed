import Image from "next/image";

export function SouqFeedBrandCard() {
  return (
    <section className="px-4 pt-6">
      <div className="bg-accent flex items-center gap-4 rounded-2xl p-4">
        <Image
          src="/logo-icon.svg"
          alt=""
          width={48}
          height={52}
          className="shrink-0"
        />
        <div>
          <p className="text-foreground text-base leading-snug font-bold">
            Real suppliers. <span className="text-primary">Live stock.</span>{" "}
            Better deals.
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            The UAE&apos;s IT trading floor in your pocket.
          </p>
        </div>
      </div>
    </section>
  );
}
