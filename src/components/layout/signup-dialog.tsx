"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Package, ShoppingCart } from "lucide-react";
import { authRoleContent } from "@/components/auth/auth-content";
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
            Choose the experience that fits your business.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/login?mode=signup&role=buyer"
            className="border-border hover:border-primary hover:bg-primary/5 flex flex-col items-start gap-2 rounded-md border p-4 text-left transition-colors"
          >
            <ShoppingCart className="text-primary size-5" aria-hidden />
            <span className="text-foreground text-sm font-semibold">
              I&apos;m a Buyer
            </span>
            <span className="text-muted-foreground text-xs">
              {authRoleContent.buyer.description}
            </span>
          </Link>
          <Link
            href="/login?mode=signup&role=seller"
            className="border-border hover:border-primary hover:bg-primary/5 flex flex-col items-start gap-2 rounded-md border p-4 text-left transition-colors"
          >
            <Package className="text-primary size-5" aria-hidden />
            <span className="text-foreground text-sm font-semibold">
              I&apos;m a Seller
            </span>
            <span className="text-muted-foreground text-xs">
              {authRoleContent.seller.description}
            </span>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
