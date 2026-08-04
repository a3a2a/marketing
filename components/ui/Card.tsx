import type { ReactNode } from "react";

// Shared surface used for stat cards, chart cards, dashboard tiles and other
// bordered containers so every module uses the same radius/border/background.
export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-black ${className}`}
    >
      {children}
    </div>
  );
}
