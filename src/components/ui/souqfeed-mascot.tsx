import Image from "next/image";
import { cn } from "@/lib/utils";

export function SouqFeedMascot({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/brand/mascot-animated.svg"
      alt=""
      width={size}
      height={Math.round(size * 1.08)}
      className={cn("shrink-0", className)}
      aria-hidden
    />
  );
}
