"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { categoryIcon } from "@/components/home/category-showcase";
import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";
import {
  categoryHref,
  type MenuCategory,
} from "@/modules/categories/menu-shared";
import { cn } from "@/lib/utils";

/**
 * The "Categories" header item. It opens a panel with the top-level categories
 * on the left and the active one's subcategories in columns. It opens on hover
 * or click, and closes on Escape, a click outside, or a page change.
 */
export function CategoryMegaMenu({
  categories,
}: {
  categories: MenuCategory[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(categories[0]?.slug ?? "");
  const wrapper = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  // A click while the menu is open only because of hover keeps it open (pinned);
  // a second click closes it.
  const pinned = useRef(false);

  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) pinned.current = false;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        pinned.current = false;
        setOpen(false);
      }
    }
    function onClick(event: MouseEvent) {
      if (!wrapper.current?.contains(event.target as Node)) {
        pinned.current = false;
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (categories.length === 0) return null;
  const active =
    categories.find((category) => category.slug === activeId) ?? categories[0];

  function openNow() {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function closeSoon() {
    if (pinned.current) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 140);
  }

  return (
    <div
      ref={wrapper}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      className="flex"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="category-mega-menu"
        onClick={() => {
          if (open && !pinned.current) {
            pinned.current = true;
          } else {
            pinned.current = !open;
            setOpen(!open);
          }
        }}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 transition-colors",
          open || pathname.startsWith("/categories")
            ? "bg-primary/10 text-primary"
            : "hover:bg-primary/5 hover:text-primary text-slate-600",
        )}
      >
        Categories
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id="category-mega-menu"
          className="border-border bg-card absolute inset-x-0 top-full z-50 border-b shadow-[0_24px_40px_rgba(40,16,95,0.12)]"
        >
          <div className="mx-auto grid max-w-[1240px] grid-cols-[250px_1fr_260px] gap-6 px-6 py-6">
            <ul className="border-border space-y-0.5 border-r pr-3">
              {categories.map((category) => {
                const Icon = categoryIcon(category);
                const isActive = category.slug === active.slug;
                return (
                  <li key={category.slug}>
                    <Link
                      href={categoryHref(category)}
                      onMouseEnter={() => setActiveId(category.slug)}
                      onFocus={() => setActiveId(category.slug)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="size-4.5 shrink-0" aria-hidden />
                      <span className="flex-1 truncate">{category.name}</span>
                      <ChevronRight
                        className="size-3.5 opacity-50"
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-foreground text-lg font-extrabold">
                  {active.name}
                </h3>
                <Link
                  href={categoryHref(active)}
                  className="text-primary inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                >
                  View all {active.name}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
              {active.children.length > 0 ? (
                <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 xl:grid-cols-3">
                  {active.children.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={categoryHref(child)}
                        className="text-foreground/80 hover:bg-primary/5 hover:text-primary block rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground mt-4 text-sm">
                  Browse every {active.name.toLowerCase()} offer on the market.
                </p>
              )}
            </div>

            <div className="relative self-start overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#efeaff,#dccfff)] p-5 pb-20">
              <p className="font-display text-foreground text-base leading-snug font-extrabold">
                Can&apos;t find it?
              </p>
              <p className="text-foreground/70 mt-1 text-xs leading-5">
                Tell suppliers what you need with a want-to-buy request.
              </p>
              <Link
                href="/wtb"
                className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#1d1540] px-4 py-2 text-xs font-bold text-white"
              >
                See WTB requests
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
              <SouqFeedAgent
                state="searching"
                size="md"
                alt=""
                className="absolute -right-2 -bottom-2 size-20"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
