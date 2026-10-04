import type { ComponentType } from "react";
import Link from "next/link";
import {
  IconApps,
  IconCpu,
  IconDatabase,
  IconDeviceDesktop,
  IconDeviceLaptop,
  IconDeviceTv,
  IconMouse,
  IconRouter,
  IconServer,
  IconPrinter,
  IconDeviceMobile,
  IconShieldLock,
  IconBolt,
} from "@tabler/icons-react";
import type { Category } from "@/modules/categories/types";

export const CATEGORY_ICONS: Record<
  string,
  ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  "cat-laptops": IconDeviceLaptop,
  "cat-desktops": IconDeviceDesktop,
  "cat-storage": IconDatabase,
  "cat-networking": IconRouter,
  "cat-components": IconCpu,
  "cat-monitors": IconDeviceTv,
  "cat-accessories": IconMouse,
  "cat-software": IconApps,
  "cat-servers": IconServer,
  "cat-phones": IconDeviceMobile,
  "cat-printers": IconPrinter,
  "cat-security": IconShieldLock,
  "cat-power": IconBolt,
};

const CATEGORY_ICONS_BY_SLUG = {
  laptops: IconDeviceLaptop,
  desktops: IconDeviceDesktop,
  storage: IconDatabase,
  networking: IconRouter,
  components: IconCpu,
  monitors: IconDeviceTv,
  accessories: IconMouse,
  software: IconApps,
  servers: IconServer,
  phones: IconDeviceMobile,
  printers: IconPrinter,
  security: IconShieldLock,
  "power-ups": IconBolt,
} satisfies Record<
  string,
  ComponentType<{ className?: string; "aria-hidden"?: boolean }>
>;

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto w-full max-w-[1180px] px-5 py-9">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          Browse by IT Category
        </h2>
        <Link href="/feed" className="text-primary text-xs font-semibold">
          View all categories →
        </Link>
      </div>
      <div className="relative mt-4">
        <div
          className="flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto scroll-smooth px-1 py-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="list"
        >
          {categories.map((category) => {
            const Icon =
              CATEGORY_ICONS_BY_SLUG[
                category.slug as keyof typeof CATEGORY_ICONS_BY_SLUG
              ] ??
              CATEGORY_ICONS[category.id] ??
              IconDeviceLaptop;
            return (
              <Link
                key={category.id}
                href={`/feed?category=${category.id}`}
                role="listitem"
                className="group flex min-w-[8.5rem] snap-start flex-col items-center gap-2 rounded-2xl border border-[#ebe6ff] bg-white px-3 py-4 text-center shadow-[0_5px_18px_rgba(71,42,170,0.04)] transition hover:-translate-y-0.5 hover:border-[#cfc4ff] hover:shadow-[0_8px_24px_rgba(71,42,170,0.12)]"
              >
                <span className="bg-primary/10 text-primary group-hover:bg-primary flex size-11 items-center justify-center rounded-xl transition-colors group-hover:text-white">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-foreground text-sm font-medium">
                  {category.name}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {category.offerCount} offers
                </span>
              </Link>
            );
          })}
        </div>
        <div
          className="from-background pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l to-transparent"
          aria-hidden
        />
      </div>
    </section>
  );
}
