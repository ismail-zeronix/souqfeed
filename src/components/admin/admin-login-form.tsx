"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getAuthErrorMessage } from "@/components/auth/auth-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import { PORTAL_HEADER } from "@/modules/auth/guards";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await authClient.signIn.email(
        { email, password },
        { headers: { [PORTAL_HEADER]: "admin" } },
      );
      if (result.error) {
        setError(getAuthErrorMessage(result.error));
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError(
        "We couldn’t reach the account service. Please check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="bg-muted/40 flex min-h-screen flex-1 items-center justify-center px-4 py-10">
      <section className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="bg-primary/10 text-primary mb-3 flex size-12 items-center justify-center rounded-xl">
            <ShieldCheck className="size-6" aria-hidden />
          </div>
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            SouqFeed Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Sign in to the admin panel
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            For SouqFeed staff only.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-card grid gap-4 rounded-2xl border p-5 shadow-sm sm:p-7"
        >
          <label className="grid gap-1.5 text-sm font-medium">
            Email address
            <Input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Password
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="mt-1 h-11 w-full"
            disabled={pending}
          >
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </section>
    </main>
  );
}
