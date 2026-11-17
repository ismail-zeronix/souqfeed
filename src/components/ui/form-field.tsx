import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-destructive text-xs">
      {message}
    </p>
  );
}

function FieldShell({
  label,
  name,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={name}>
        {label}
        {required && <span aria-hidden> *</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-muted-foreground text-xs">{hint}</p>
      )}
      <FieldError id={`${name}-error`} message={error} />
    </div>
  );
}

export function TextField({
  label,
  name,
  defaultValue,
  error,
  required,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  error?: string;
  required?: boolean;
  type?: "text" | "tel";
  placeholder?: string;
  hint?: string;
}) {
  return (
    <FieldShell
      label={label}
      name={name}
      required={required}
      hint={hint}
      error={error}
    >
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />
    </FieldShell>
  );
}

/** Native on purpose: it submits and resets with the form with no extra state. */
export function NativeSelect({
  className = "",
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      className={`border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive h-8 w-full min-w-0 rounded-lg border bg-transparent px-2 text-base outline-none focus-visible:ring-3 md:text-sm ${className}`}
      {...props}
    />
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  name: string;
  defaultValue: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <FieldShell
      label={label}
      name={name}
      required={required}
      hint={hint}
      error={error}
    >
      <NativeSelect
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        {children}
      </NativeSelect>
    </FieldShell>
  );
}

export function FormMessage({
  status,
  message,
}: {
  status: "idle" | "error" | "success";
  message?: string;
}) {
  return (
    <div aria-live="polite" className="text-sm">
      {status === "error" && message && (
        <p role="alert" className="text-destructive">
          {message}
        </p>
      )}
      {status === "success" && message && (
        <p className="text-primary">{message}</p>
      )}
    </div>
  );
}
