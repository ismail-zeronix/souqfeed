"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { categoryIcon } from "@/components/home/category-showcase";
import { SignupDialog } from "@/components/layout/signup-dialog";
import { NAV_LINKS } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";
import { HeaderMascot } from "@/components/layout/header-mascot";
import { hidesSiteChrome } from "@/components/layout/site-chrome";
import {
  categoryHref,
  type MenuCategory,
} from "@/modules/categories/menu-shared";

function MenuLink({
  href,
  active,
  children,
  className,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SheetClose
      render={
        <Link
          href={href}
          className={cn(
            "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            active
              ? "bg-primary/10 text-primary"
              : "text-foreground hover:bg-muted",
            className,
          )}
        />
      }
    >
      {children}
    </SheetClose>
  );
}

export function MobileHeader({ categories }: { categories: MenuCategory[] }) {
  const pathname = usePathname();
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  if (hidesSiteChrome(pathname)) return null;

  return (
    <header className="border-border bg-card flex h-16 items-center gap-2 border-b px-4 md:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Open menu">
              <Menu className="size-5" aria-hidden />
            </Button>
          }
        />
        <SheetContent side="left" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-0.5 px-3" aria-label="Site">
            <MenuLink href="/feed" active={pathname.startsWith("/feed")}>
              Market
            </MenuLink>

            <div>
              <MenuLink
                href="/categories"
                active={pathname.startsWith("/categories")}
                className="block"
              >
                Categories
              </MenuLink>
              <ul className="mt-0.5 ml-2 border-l border-[#e6e0ff] pl-2">
                {categories.map((category) => {
                  const Icon = categoryIcon(category);
                  const open = openSlug === category.slug;
                  return (
                    <li key={category.slug}>
                      <div className="flex items-center">
                        <SheetClose
                          render={
                            <Link
                              href={categoryHref(category)}
                              className="text-foreground hover:bg-muted flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] font-medium"
                            />
                          }
                        >
                          <Icon
                            className="text-primary size-4 shrink-0"
                            aria-hidden
                          />
                          <span className="truncate">{category.name}</span>
                        </SheetClose>
                        {category.children.length > 0 && (
                          <button
                            type="button"
                            aria-expanded={open}
                            aria-label={`${category.name} subcategories`}
                            onClick={() =>
                              setOpenSlug(open ? null : category.slug)
                            }
                            className="text-muted-foreground hover:bg-muted rounded-lg p-2"
                          >
                            <ChevronDown
                              className={cn(
                                "size-4 transition-transform",
                                open && "rotate-180",
                              )}
                              aria-hidden
                            />
                          </button>
                        )}
                      </div>
                      {open && (
                        <ul className="mb-1 ml-6 border-l border-[#e6e0ff] pl-2">
                          {category.children.map((child) => (
                            <li key={child.slug}>
                              <SheetClose
                                render={
                                  <Link
                                    href={categoryHref(child)}
                                    className="text-muted-foreground hover:text-primary block rounded-lg px-2 py-1.5 text-[13px]"
                                  />
                                }
                              >
                                {child.name}
                              </SheetClose>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {NAV_LINKS.slice(1).map((item) => (
              <MenuLink
                key={item.label}
                href={item.href}
                active={
                  !item.href.startsWith("/#") && pathname.startsWith(item.href)
                }
              >
                {item.label}
              </MenuLink>
            ))}
          </nav>
          <SheetFooter>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Sign In
            </Button>
            <SignupDialog trigger={<Button>Sign Up</Button>} />
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Link
        href="/"
        className="flex flex-1 items-center justify-center gap-2 font-semibold"
      >
        <HeaderMascot />
        <span className="text-foreground text-base font-semibold tracking-tight">
          Souq<span className="text-primary">Feed</span>
        </span>
      </Link>

      <Bell className="text-muted-foreground size-5" aria-hidden />
    </header>
  );
}
