// Low-opacity geometric lattice motif (mashrabiya-inspired) for the hero
// background — evokes the "souq" identity without a stock photo (none
// available: no image-gen tool, and the brand guide rules out generic stock
// imagery anyway). Pure inline SVG, no external asset.
export function ArabesquePattern({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="arabesque-lattice"
          width="64"
          height="64"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M32 0 L64 32 L32 64 L0 32 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle
            cx="32"
            cy="32"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#arabesque-lattice)" />
    </svg>
  );
}
