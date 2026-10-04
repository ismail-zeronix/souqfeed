"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Package,
  ShoppingCart,
} from "lucide-react";
import { authRoleContent, type AuthRole } from "@/components/auth/auth-content";
import { getAuthErrorMessage } from "@/components/auth/auth-error";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login",
  );
  const [role, setRole] = useState<AuthRole>(
    searchParams.get("role") === "seller" ? "seller" : "buyer",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setToast(null);
    try {
      const result =
        mode === "login"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({
              name,
              email,
              password,
              role: role === "seller" ? "SUPPLIER" : "BUYER",
            } as Parameters<typeof authClient.signUp.email>[0]);
      if (result.error) {
        const message = getAuthErrorMessage(result.error);
        setError(message);
        setToast(message);
        return;
      }
      const accountRole = (result.data?.user as { role?: string } | undefined)
        ?.role;
      router.push(accountRole === "ADMIN" ? "/admin" : "/dashboard");
    } catch {
      const message =
        "We couldn’t reach the account service. Please check your connection and try again.";
      setError(message);
      setToast(message);
    }
  }

  const roleContent = authRoleContent[role];
  return (
    <main className="bg-muted/40 flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center px-4 py-8 sm:py-12">
      {toast && (
        <div
          role="alert"
          className="bg-destructive text-destructive-foreground fixed top-5 right-5 z-50 max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow-lg"
        >
          {toast}
        </div>
      )}
      <section className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="bg-primary/10 mb-3 flex size-16 items-center justify-center rounded-2xl">
            <Image
              src="/brand/mascot-animated.svg"
              alt=""
              width={48}
              height={48}
              className="size-12"
              priority
            />
          </div>
          <p className="text-primary text-sm font-semibold">SouqFeed</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Join the market"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {mode === "login"
              ? "Sign in to continue to your account."
              : "Choose your path and start sourcing smarter."}
          </p>
        </div>
        <div className="bg-card rounded-2xl border p-5 shadow-sm sm:p-7">
          <div className="bg-muted mb-6 grid grid-cols-2 rounded-lg p-1">
            {(["login", "signup"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-md py-2 text-sm font-medium transition ${mode === item ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                {item === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          {mode === "signup" && (
            <div className="mb-6 space-y-3">
              <p className="text-sm font-medium">I’m joining as a</p>
              <div className="grid grid-cols-2 gap-2">
                {(["buyer", "seller"] as AuthRole[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRole(item)}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${role === item ? "border-primary bg-primary/5 ring-primary/20 ring-2" : "hover:bg-muted/60"}`}
                  >
                    <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg">
                      {item === "buyer" ? (
                        <ShoppingCart className="size-4" />
                      ) : (
                        <Package className="size-4" />
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">
                        {authRoleContent[item].label}
                      </span>
                      <span className="text-muted-foreground block text-[11px]">
                        {item === "buyer" ? "Source stock" : "List stock"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="bg-muted/60 rounded-xl p-3">
                <p className="text-sm font-medium">{roleContent.title}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-5">
                  {roleContent.description}
                </p>
                <ul className="mt-2 grid gap-1.5">
                  {roleContent.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-muted-foreground flex items-center gap-1.5 text-xs"
                    >
                      <Check className="text-primary size-3.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4">
            {mode === "signup" && (
              <label className="grid gap-1.5 text-sm font-medium">
                Full name
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>
            )}
            <label className="grid gap-1.5 text-sm font-medium">
              Email address
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Password
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </label>
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="mt-1 h-11 w-full">
              {mode === "login" ? "Sign in" : roleContent.cta}
              <ArrowRight className="size-4" />
            </Button>
          </form>
          <p className="text-muted-foreground mt-5 text-center text-xs">
            By continuing, you agree to our terms and privacy policy.
          </p>
        </div>
      </section>
    </main>
  );
}
