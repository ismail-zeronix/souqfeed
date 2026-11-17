"use client";

import { useActionState, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, FormMessage } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitBroadcastAction } from "@/modules/broadcasts/actions";
import type { BroadcastFormState } from "@/modules/broadcasts/types";
import {
  countBroadcastLines,
  MAX_BROADCAST_LENGTH,
} from "@/modules/broadcasts/validation";

const INITIAL_STATE: BroadcastFormState = { status: "idle" };

const PLACEHOLDER = `Paste your WhatsApp stock message here, for example:

HP EliteBook 840 G8 i5-1145G7 16/512 x20 @1850
Dell Latitude 5440 i7 16GB 512GB 10PCS AED 2,450
Lenovo ThinkPad E14 Gen 5 – ASK`;

export function BroadcastForm() {
  const [state, formAction, pending] = useActionState(
    submitBroadcastAction,
    INITIAL_STATE,
  );
  const [text, setText] = useState(state.values?.rawText ?? "");
  const lines = countBroadcastLines(text);
  const tooLong = text.length > MAX_BROADCAST_LENGTH;
  const error = state.fieldErrors?.rawText;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rawText">Broadcast</Label>
        <Textarea
          id="rawText"
          name="rawText"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={PLACEHOLDER}
          required
          spellCheck={false}
          aria-invalid={Boolean(error) || tooLong}
          aria-describedby="rawText-hint rawText-error"
          className="max-h-[60vh] min-h-72 font-mono text-sm leading-6"
        />
        <p
          id="rawText-hint"
          className={`text-xs ${tooLong ? "text-destructive" : "text-muted-foreground"}`}
        >
          {lines} {lines === 1 ? "line" : "lines"} ·{" "}
          {text.length.toLocaleString("en-AE")} /{" "}
          {MAX_BROADCAST_LENGTH.toLocaleString("en-AE")} characters. Saved
          exactly as pasted.
        </p>
        <FieldError id="rawText-error" message={error} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending || tooLong}>
          <Send aria-hidden />
          {pending ? "Posting..." : "Post broadcast"}
        </Button>
        <FormMessage status={state.status} message={state.message} />
      </div>
    </form>
  );
}
