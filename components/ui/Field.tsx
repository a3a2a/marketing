import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Shared form field styling: one visual language for every text input,
// select and textarea across 콘텐츠 and 캠페인 forms (border, background,
// focus ring, error state) plus a label+hint+error wrapper.
// ---------------------------------------------------------------------------

export type ControlSize = "sm" | "md";

// Padding/text-size live in one place (keyed by size) rather than as free
// text appended by callers — mixing e.g. "px-3 py-2" and "px-2 py-1.5" in the
// same class string is fragile because Tailwind's cascade order isn't the
// order classes appear in the attribute.
const SIZE_CLASSES: Record<ControlSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-3 py-2 text-sm",
};

const CONTROL_BASE =
  "rounded-md border bg-white shadow-sm outline-none transition-colors focus:ring-2 dark:bg-black";

function controlStateClassName(hasError: boolean): string {
  return hasError
    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
    : "border-black/15 focus:border-black/30 focus:ring-black/10 dark:border-white/20 dark:focus:border-white/40 dark:focus:ring-white/10";
}

// Full-width control (the default for form fields — inputs/selects/textareas
// stacked in a form should span the field's width).
export function fieldControlClassName(
  hasError = false,
  className = "",
  size: ControlSize = "md",
): string {
  return `w-full ${CONTROL_BASE} ${SIZE_CLASSES[size]} ${controlStateClassName(hasError)} ${className}`.trim();
}

// Same visual language, but sized to its content (compact selects/toolbars —
// e.g. a filter bar or an inline per-row status select — where forcing
// w-full would stretch the control to fill its container).
export function compactControlClassName(
  hasError = false,
  className = "",
  size: ControlSize = "sm",
): string {
  return `${CONTROL_BASE} ${SIZE_CLASSES[size]} ${controlStateClassName(hasError)} ${className}`.trim();
}

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          className="mt-1 text-xs text-red-500"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p className="mt-1 text-xs text-black/50 dark:text-white/50">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
