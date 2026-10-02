"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Package, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SignupDialog({ trigger }: { trigger: ReactElement }) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join SouqFeed</DialogTitle>
          <DialogDescription>
            Tell us how you&apos;ll use the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/login?role=buyer"
            className="border-border hover:border-primary hover:bg-primary/5 flex flex-col items-start gap-2 rounded-md border p-4 text-left transition-colors"
          >
            <ShoppingCart className="text-primary size-5" aria-hidden />
            <span className="text-foreground text-sm font-semibold">
              I&apos;m a Buyer
            </span>
            <span className="text-muted-foreground text-xs">
              Search and compare live offers from verified suppliers.
            </span>
          </Link>
          <Link
            href="/login?role=supplier"
            className="border-border hover:border-primary hover:bg-primary/5 flex flex-col items-start gap-2 rounded-md border p-4 text-left transition-colors"
          >
            <Package className="text-primary size-5" aria-hidden />
            <span className="text-foreground text-sm font-semibold">
              I&apos;m a Supplier
            </span>
            <span className="text-muted-foreground text-xs">
              Broadcast your stock and reach buyers across the UAE.
            </span>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
