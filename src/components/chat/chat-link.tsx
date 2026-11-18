"use client";

import type { ComponentProps } from "react";
import { openChat, type ChatRequest } from "@/lib/chat/open-chat";

/**
 * A "contact the supplier" link. A click opens the live chat with the buyer's
 * first message ready. If the chat isn't available (blocked, still loading), the
 * link behaves as normal, so it still goes to the supplier's WhatsApp.
 */
export function ChatLink({
  request,
  onClick,
  children,
  ...props
}: ComponentProps<"a"> & { request: ChatRequest }) {
  return (
    <a
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && openChat(request)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </a>
  );
}
