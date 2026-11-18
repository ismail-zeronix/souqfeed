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

/**
 * A slow scrolling strip of the brands we list, as plain names. It sits in the
 * same width as the other sections: a label on the left, the strip on the right
 * (stacked on phones).
 */
export function BrandMarquee() {
  const known = new Set(IT_BRANDS.map((brand) => brand.name));
  const names = SHOWN.filter((name) => known.has(name));
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 pt-10 md:px-5 md:pt-14">
      <div className="flex flex-col gap-3 overflow-hidden rounded-3xl border border-[#e6e0ff] bg-white p-4 md:flex-row md:items-center md:gap-6 md:py-5 md:pr-0 md:pl-7">
        <p className="font-display text-foreground shrink-0 text-sm font-extrabold md:w-36">
          Brands on the market
        </p>
        <div className="marquee relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
          <div className="marquee-track flex w-max gap-2.5">
            {[...names, ...names].map((name, i) => (
              <span
                key={`${name}-${i}`}
                aria-hidden={i >= names.length}
                className="font-display text-foreground/70 shrink-0 rounded-full bg-[#f5f2ff] px-4 py-2 text-[13px] font-bold"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
