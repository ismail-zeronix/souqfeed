"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
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
import { SignupDialog } from "@/components/layout/signup-dialog";
import { NAV_ITEMS } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

export function MobileHeader() {
  const pathname = usePathname();

  if (pathname.startsWith("/login")) return null;

  return (
    <header className="border-border bg-card flex h-14 items-center gap-2 border-b px-4 md:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Open menu">
              <Menu className="size-5" aria-hidden />
            </Button>
          }
        />
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4" aria-label="Site">
            {NAV_ITEMS.map((item) => {
              if (!item.href) {
                return (
                  <span
                    key={item.label}
                    className="text-muted-foreground/60 cursor-not-allowed rounded-md px-3 py-2 text-sm"
                    aria-disabled
                    title="Coming soon"
                  >
                    {item.label}
                  </span>
                );
              }
              const isActive = pathname === item.href;
              return (
                <SheetClose
                  key={item.label}
                  render={
                    <Link
                      href={item.href}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    />
                  }
                >
                  {item.label}
                </SheetClose>
              );
            })}
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
        <Image src="/logo-icon.svg" alt="" width={22} height={24} />
        <span className="text-foreground text-sm">
          Souq<span className="text-primary">Feed</span>
        </span>
      </Link>

      <Bell className="text-muted-foreground size-5" aria-hidden />
    </header>
  );
}
