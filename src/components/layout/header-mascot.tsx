"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const STATES = [
  { name: "happy", message: "Market signals look good today.", emoji: "✨" },
  {
    name: "waving",
    message: "Ready to connect buyers and sellers.",
    emoji: "👋",
  },
  { name: "searching", message: "Scanning for your next match.", emoji: "🔎" },
] as const;

export function HeaderMascot({
  showCallout = false,
}: {
  showCallout?: boolean;
}) {
  const [stateIndex, setStateIndex] = useState(0);
  const [calloutVisible, setCalloutVisible] = useState(false);
  const state = STATES[stateIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStateIndex((current) => (current + 1) % STATES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!showCallout) return;

    let timer: number;
    const scheduleCallout = (delay: number) => {
      timer = window.setTimeout(() => {
        setStateIndex(Math.floor(Math.random() * STATES.length));
        setCalloutVisible(true);
        scheduleCallout(5200 + Math.floor(Math.random() * 3200));
      }, delay);
    };

    scheduleCallout(1200 + Math.floor(Math.random() * 1800));
    return () => window.clearTimeout(timer);
  }, [showCallout]);

  return (
    <span className="relative inline-flex size-11 shrink-0 items-center justify-center">
      <Image
        key={state.name}
        src={`/brand/mascot/souqfeed_mascot_${state.name}.gif`}
        alt=""
        width={44}
        height={44}
        className="size-11 object-contain"
        unoptimized
      />
      {showCallout && calloutVisible && (
        <span className="callout-pop bg-foreground text-background absolute top-10 left-0 z-50 flex w-max max-w-56 items-start gap-2 rounded-lg px-2.5 py-1.5 pr-1.5 text-[11px] font-medium shadow-lg">
          <span>
            {state.emoji} {state.message}
          </span>
          <button
            type="button"
            onClick={() => setCalloutVisible(false)}
            className="text-background/60 hover:text-background -mt-0.5 rounded p-0.5"
            aria-label="Close mascot message"
          >
            <X className="size-3" aria-hidden />
          </button>
          <span className="bg-foreground absolute -top-1 left-3 size-2 rotate-45" />
        </span>
      )}
    </span>
  );
}
