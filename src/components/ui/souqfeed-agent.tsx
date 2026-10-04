import Image from "next/image";
import { cn } from "@/lib/utils";

export const SOUQFEED_AGENT_STATES = [
  "idle",
  "loading",
  "searching",
  "thinking",
  "success",
  "happy",
  "error",
  "waving",
] as const;

export type SouqFeedAgentState = (typeof SOUQFEED_AGENT_STATES)[number];
export type SouqFeedAgentSize = "sm" | "md" | "lg";

const AGENT_ASSETS: Record<SouqFeedAgentState, string> = {
  idle: "/brand/mascot/souqfeed_mascot_idle.webp",
  loading: "/brand/mascot/souqfeed_mascot_loading.webp",
  searching: "/brand/mascot/souqfeed_mascot_searching.webp",
  thinking: "/brand/mascot/souqfeed_mascot_thinking.webp",
  success: "/brand/mascot/souqfeed_mascot_success.webp",
  happy: "/brand/mascot/souqfeed_mascot_happy.webp",
  error: "/brand/mascot/souqfeed_mascot_error.webp",
  waving: "/brand/mascot/souqfeed_mascot_waving.webp",
};

const SIZE_PX: Record<SouqFeedAgentSize, number> = {
  sm: 32,
  md: 64,
  lg: 128,
};

const SIZE_CLASSES: Record<SouqFeedAgentSize, string> = {
  sm: "size-8",
  md: "size-16",
  lg: "size-24 sm:size-32",
};

export function getSouqFeedAgentAsset(state: SouqFeedAgentState): string {
  return AGENT_ASSETS[state];
}

export function SouqFeedAgent({
  state = "idle",
  size = "md",
  alt,
  className,
  priority = false,
}: {
  state?: SouqFeedAgentState;
  size?: SouqFeedAgentSize;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  const dimension = SIZE_PX[size];
  const accessibleAlt = alt ?? `SouqFeed assistant ${state}`;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-end justify-center overflow-hidden",
        SIZE_CLASSES[size],
        className,
      )}
      data-agent-state={state}
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
    >
      <Image
        src={getSouqFeedAgentAsset(state)}
        alt={accessibleAlt}
        width={dimension}
        height={dimension}
        sizes={`${dimension}px`}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
