// Dates are shown in Dubai time whatever timezone the server runs in, so the
// same broadcast never shows two different days to two viewers.
const TIME_ZONE = "Asia/Dubai";

const dateFormat = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const dateTimeFormat = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

export function formatDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}

/** The first non-blank line, for a one-line summary of pasted text. */
export function firstLine(text: string): string {
  return (
    text
      .split(/\r\n|\r|\n/)
      .find((line) => line.trim())
      ?.trim() ?? ""
  );
}

/** "AED 1,850", "Ask for price", or null when no price was stated. */
export function formatPrice(
  price: string | number | null,
  currency: string | null,
  priceType: string | null,
): string | null {
  if (price !== null && price !== "") {
    const amount = Number(price).toLocaleString("en-AE");
    return currency ? `${currency} ${amount}` : amount;
  }
  return priceType === "ASK" ? "Ask for price" : null;
}
