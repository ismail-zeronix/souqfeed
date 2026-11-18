/**
 * Opens the SouqFeed live chat (the Zeronix widget) from a "contact the
 * supplier" button, with the buyer's first message ready and the sales team
 * told what they were looking at. The chat is SouqFeed's own sales desk, which
 * connects the buyer with the supplier; it never poses as the supplier's staff.
 */

export interface ChatRequest {
  supplierName: string;
  /** The offer or product the buyer is looking at, if any. */
  productTitle?: string;
  categoryName?: string;
  /** Where the button is, for the sales team ("Offer card", "Supplier page"). */
  source: string;
}

interface ZeronixChatApi {
  open(options: { message?: string; context?: Record<string, string> }): void;
}

declare global {
  interface Window {
    ZeronixChat?: ZeronixChatApi;
  }
}

/** The widget has loaded and its round button is on screen (the portal accepted this site). */
export function isChatReady(): boolean {
  if (typeof window === "undefined" || !window.ZeronixChat) return false;
  const launcher = document
    .getElementById("zeronix-chat")
    ?.shadowRoot?.querySelector<HTMLElement>(".launcher");
  return Boolean(launcher && getComputedStyle(launcher).display !== "none");
}

export function buildChatMessage(request: ChatRequest): string {
  const subject = request.productTitle
    ? `${request.productTitle} from ${request.supplierName}`
    : `stock from ${request.supplierName}`;
  return `Hi, I'm interested in ${subject} on SouqFeed. Is it available, and what's your best price?`;
}

/**
 * Starts the chat. Returns false when it can't (the widget is blocked, still
 * loading or hidden), so the caller lets the link's normal action (WhatsApp)
 * go ahead instead of doing nothing.
 */
export function openChat(request: ChatRequest): boolean {
  if (!isChatReady()) return false;
  window.ZeronixChat!.open({
    message: buildChatMessage(request),
    context: {
      ...(request.productTitle ? { product: request.productTitle } : {}),
      ...(request.categoryName ? { category: request.categoryName } : {}),
      page: window.location.href,
      cta: `Live chat · ${request.supplierName} · ${request.source}`,
    },
  });
  return true;
}
