import Link from "next/link";
import { Package, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignupDialog } from "@/components/layout/signup-dialog";

export function MobilePrimaryActions() {
  return (
    <div className="flex gap-2 px-4 pt-3">
      <Button
        nativeButton={false}
        render={<Link href="/feed" />}
        className="h-12 min-w-0 flex-1 rounded-xl"
      >
        <SearchIcon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">View Live Market</span>
      </Button>
      <SignupDialog
        trigger={
          <Button
            variant="outline"
            className="h-12 min-w-0 flex-1 rounded-xl"
          >
            <Package className="size-4 shrink-0" aria-hidden />
            <span className="truncate">List your stock</span>
          </Button>
        }
      />
    </div>
  );
}
