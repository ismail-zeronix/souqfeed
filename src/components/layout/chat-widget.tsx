"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// The widget's round button sits 20px from the bottom-right corner, which on
// phones is on top of our bottom tab bar. This lifts the button and its teaser
// above it. The shadow root is open, so a style can be added after it mounts;
// if the widget ever changes these class names the rule just stops applying.
const PHONE_OFFSET_CSS = `@media (max-width: 767px) {
  .launcher { bottom: calc(76px + env(safe-area-inset-bottom)) !important; }
  .teaser { bottom: calc(148px + env(safe-area-inset-bottom)) !important; }
}`;

function liftAboveTabBar() {
  const root = document.getElementById("zeronix-chat")?.shadowRoot;
  if (!root || root.getElementById("souqfeed-chat-offset")) return;
  const style = document.createElement("style");
  style.id = "souqfeed-chat-offset";
  style.textContent = PHONE_OFFSET_CSS;
  root.appendChild(style);
}

/**
 * The SouqFeed team's live chat (the Zeronix chat widget, served from
 * zeronixos.online). The SouqFeed team answers chats from the Zeronix portal;
 * paid supplier teams joining a chat once a buyer picks their stock is planned
 * later. The widget draws itself in a Shadow DOM, so the site's CSS can't
 * change it, and it ignores bots and scripted browsers.
 *
 * It is left out of the staff admin area. It loads once per full page load and
 * stays across in-app navigation.
 */
export function ChatWidget() {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;

  return (
    <Script
      id="souqfeed-chat-widget"
      src="https://zeronixos.online/widget/zeronix-chat.js"
      strategy="afterInteractive"
      onLoad={liftAboveTabBar}
      data-color="#6c42f5"
      data-dark="#1d1540"
      data-title="SouqFeed Support"
      data-greeting="Hi there 👋 Welcome to SouqFeed. Looking for IT stock or a supplier in Dubai? Ask us anything and our team will reply in minutes."
      data-quick="Find a product|I want to become a supplier|Talk to the SouqFeed team"
      data-position="right"
    />
  );
}
