import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function MobileEmptyState() {
  return (
    <div className="border-border bg-card flex flex-col items-center gap-3 rounded-2xl border p-6 text-center">
      <Image src="/logo-icon.svg" alt="" width={40} height={44} />
      <p className="text-foreground text-sm font-medium">
        No live offers right now.
      </p>
      <p className="text-muted-foreground text-xs">
        Check back shortly, or browse the full market for everything suppliers
        have posted.
      </p>
      <Button
        size="sm"
        nativeButton={false}
        render={<Link href="/feed" />}
        className="mt-1"
      >
        Browse Market
      </Button>
    </div>
  );
}
