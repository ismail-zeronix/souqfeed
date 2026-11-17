import { IT_BRANDS } from "@/modules/brands/it-brands";

const SHOWN = [
  "Apple",
  "Dell",
  "HP",
  "Lenovo",
  "ASUS",
  "Acer",
  "Microsoft",
  "Samsung",
  "Cisco",
  "Ubiquiti",
  "TP-Link",
  "Seagate",
  "Western Digital",
  "Kingston",
  "NVIDIA",
  "Intel",
  "AMD",
  "Logitech",
  "Fortinet",
  "Synology",
  "Canon",
  "APC",
];

/** A slow scrolling strip of the brands we list, as plain names. */
export function BrandMarquee() {
  const known = new Set(IT_BRANDS.map((brand) => brand.name));
  const names = SHOWN.filter((name) => known.has(name));
  return (
    <section className="pt-10 md:pt-14">
      <p className="text-muted-foreground text-center text-xs font-semibold tracking-[0.16em] uppercase">
        Brands on the market
      </p>
      <div className="marquee relative mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
        <div className="marquee-track flex w-max gap-3">
          {[...names, ...names].map((name, i) => (
            <span
              key={`${name}-${i}`}
              aria-hidden={i >= names.length}
              className="font-display text-foreground/70 shrink-0 rounded-full border border-[#e6e0ff] bg-white px-5 py-2.5 text-sm font-bold"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
