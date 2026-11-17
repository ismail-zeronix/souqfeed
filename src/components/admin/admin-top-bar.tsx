"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

export function AdminTopBar({
  email,
  isSuperAdmin,
}: {
  email: string;
  isSuperAdmin: boolean;
}) {
  const router = useRouter();

  return (
    <header className="bg-background border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <ShieldCheck className="text-primary size-5" aria-hidden />
          SouqFeed Admin
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          <div className="hidden min-w-0 text-right leading-tight sm:block">
            <div className="truncate text-xs font-medium">{email}</div>
            <div className="text-muted-foreground text-[10px]">
              {isSuperAdmin ? "Super admin" : "Admin"}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/admin/login");
                    router.refresh();
                  },
                },
              })
            }
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
