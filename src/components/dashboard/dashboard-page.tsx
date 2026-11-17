import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Page frame for the supplier and buyer pages under /dashboard. */
export function DashboardPage({
  back,
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  back?: { href: string; label: string };
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-muted/30 flex-1">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-12">
        {back && (
          <Link
            href={back.href}
            className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {back.label}
          </Link>
        )}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-2 text-3xl font-semibold tracking-tight break-words">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
