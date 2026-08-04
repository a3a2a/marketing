import type { CSSProperties, ReactNode } from "react";

// Shared pill shape for every status/type/channel badge in the app. Color is
// passed in as a Tailwind class string (kept alongside each module's label
// map) or, for dynamic per-item colors (e.g. recent activity), a style prop.
export function Badge({
  className = "",
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <span
      style={style}
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}
