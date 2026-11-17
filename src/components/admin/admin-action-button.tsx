"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { AdminActionResult } from "@/lib/validation/form";

export function AdminActionButton({
  label,
  action,
  confirmMessage,
}: {
  label: string;
  action: () => Promise<AdminActionResult>;
  confirmMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => {
          if (confirmMessage && !window.confirm(confirmMessage)) return;
          setError(null);
          startTransition(async () => {
            try {
              const result = await action();
              if (!result.ok) setError(result.message);
            } catch {
              setError("We couldn't reach the server. Please try again.");
            }
          });
        }}
      >
        {label}
      </Button>
      {error && (
        <p
          role="alert"
          className="text-destructive max-w-60 text-right text-xs"
        >
          {error}
        </p>
      )}
    </div>
  );
}
