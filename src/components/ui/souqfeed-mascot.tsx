import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";

export function SouqFeedMascot({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <SouqFeedAgent
      state="idle"
      size={size <= 32 ? "sm" : size <= 64 ? "md" : "lg"}
      className={className}
    />
  );
}
