"use client";

import { useState } from "react";
import { cn } from "cn";
import { FieldError, NativeSelect } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_NOTES_LENGTH,
  MAX_WARRANTY_LENGTH,
  OFFER_CURRENCIES,
} from "@/modules/broadcasts/manual/validation";
import { CONDITION_LABELS, OFFER_CONDITIONS } from "@/modules/offers/condition";

const WARRANTY_SUGGESTIONS = [
  "No warranty",
  "1 month",
  "3 months",
  "6 months",
  "1 year",
  "2 years",
  "3 years",
  "Manufacturer warranty",
];

export interface OfferDetailsDefaults {
  condition: string;
  priceMode: "fixed" | "ask";
  price: string;
  currency: string;
  quantity: string;
  warranty: string;
  notes: string;
}

export const EMPTY_DETAILS: OfferDetailsDefaults = {
  condition: "",
  priceMode: "fixed",
  price: "",
  currency: "AED",
  quantity: "",
  warranty: "",
  notes: "",
};

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "hover:bg-muted text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/** Condition, price, quantity, warranty, and description. */
export function OfferDetailsFields({
  defaults,
  errors,
  conditionHint,
}: {
  defaults: OfferDetailsDefaults;
  errors: Record<string, string>;
  conditionHint?: string;
}) {
  const [condition, setCondition] = useState(defaults.condition);
  const [priceMode, setPriceMode] = useState(defaults.priceMode);
  const [notes, setNotes] = useState(defaults.notes);

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <span className="text-sm font-medium" id="condition-label">
          Condition
        </span>
        <input type="hidden" name="condition" value={condition} />
        <div
          role="radiogroup"
          aria-labelledby="condition-label"
          className="flex flex-wrap gap-2"
        >
          {OFFER_CONDITIONS.map((value) => (
            <Chip
              key={value}
              selected={condition === value}
              onClick={() => setCondition(condition === value ? "" : value)}
            >
              {CONDITION_LABELS[value]}
            </Chip>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          {conditionHint ??
            "Optional. Leave it unselected if you'd rather not say."}
        </p>
        <FieldError id="condition-error" message={errors.condition} />
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-medium" id="price-label">
          Price
        </span>
        <input type="hidden" name="priceMode" value={priceMode} />
        <div
          role="radiogroup"
          aria-labelledby="price-label"
          className="flex flex-wrap gap-2"
        >
          <Chip
            selected={priceMode === "fixed"}
            onClick={() => setPriceMode("fixed")}
          >
            Fixed price
          </Chip>
          <Chip
            selected={priceMode === "ask"}
            onClick={() => setPriceMode("ask")}
          >
            Ask for price
          </Chip>
        </div>
        <div
          hidden={priceMode !== "fixed"}
          className="grid grid-cols-[6rem_1fr] gap-2 sm:max-w-sm"
        >
          <NativeSelect
            name="currency"
            aria-label="Currency"
            defaultValue={defaults.currency}
            className="h-9"
          >
            {OFFER_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </NativeSelect>
          <Input
            name="price"
            inputMode="decimal"
            autoComplete="off"
            placeholder="e.g. 1,850"
            aria-label="Price per unit"
            defaultValue={defaults.price}
            aria-invalid={Boolean(errors.price)}
            aria-describedby="price-error"
            className="h-9"
          />
        </div>
        {priceMode === "ask" && (
          <p className="text-muted-foreground text-xs">
            Buyers see &ldquo;Ask for price&rdquo; and contact you on WhatsApp.
          </p>
        )}
        <FieldError id="price-error" message={errors.price} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid content-start gap-1.5">
          <Label htmlFor="quantity">Quantity in stock</Label>
          <Input
            id="quantity"
            name="quantity"
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 20"
            defaultValue={defaults.quantity}
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby="quantity-error"
            className="h-9"
          />
          {!errors.quantity && (
            <p className="text-muted-foreground text-xs">
              Optional. Leave empty if you&apos;d rather not say.
            </p>
          )}
          <FieldError id="quantity-error" message={errors.quantity} />
        </div>
        <div className="grid content-start gap-1.5">
          <Label htmlFor="warranty">Warranty</Label>
          <Input
            id="warranty"
            name="warranty"
            list="warranty-options"
            autoComplete="off"
            maxLength={MAX_WARRANTY_LENGTH}
            placeholder="e.g. 1 year"
            defaultValue={defaults.warranty}
            aria-invalid={Boolean(errors.warranty)}
            aria-describedby="warranty-error"
            className="h-9"
          />
          <datalist id="warranty-options">
            {WARRANTY_SUGGESTIONS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
          <FieldError id="warranty-error" message={errors.warranty} />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="notes">Description</Label>
        <Textarea
          id="notes"
          name="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={MAX_NOTES_LENGTH}
          rows={4}
          placeholder="Anything a buyer should know: packaging, keyboard layout, delivery, minimum order…"
          aria-invalid={Boolean(errors.notes)}
          aria-describedby="notes-hint notes-error"
        />
        <p id="notes-hint" className="text-muted-foreground text-xs">
          {notes.length} / {MAX_NOTES_LENGTH} characters
        </p>
        <FieldError id="notes-error" message={errors.notes} />
      </div>
    </div>
  );
}
