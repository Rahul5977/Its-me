import { useId } from "react";
import { cn } from "@/lib/utils";

/** The "R_" mark: gradient R in a terminal tile with a blinking lime cursor. Matches public/logo.svg. */
export function Logo({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" className={cn("h-8 w-8", className)} aria-hidden>
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="2.5" width="59" height="59" rx="16" fill="#070a0f" stroke={`url(#lg-${id})`} strokeWidth="3" />
      <path
        d="M19 46V18h12a8.5 8.5 0 0 1 0 17H19M30 35l9 11"
        fill="none"
        stroke={`url(#lg-${id})`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="43" y="42" width="9" height="4.5" rx="1.5" fill="#a3e635" className="animate-[blink_1s_steps(1)_infinite]" />
    </svg>
  );
}
