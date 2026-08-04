import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link, { type LinkProps } from "next/link";

// ---------------------------------------------------------------------------
// Shared button styling used across every module (home, 콘텐츠, 캠페인, 리포트)
// so primary/secondary/danger actions look and behave the same everywhere.
// `buttonClassName` is exported separately so non-<button> elements (e.g. a
// styled <label> or custom trigger) can still opt into the same look.
// ---------------------------------------------------------------------------

export type ButtonVariant =
  | "primary"
  | "outline"
  | "ghost"
  | "danger-outline"
  | "danger-solid";

export type ButtonSize = "sm" | "md";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80",
  outline:
    "border border-black/15 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10",
  ghost:
    "text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10",
  "danger-outline":
    "border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10",
  "danger-solid": "bg-rose-600 text-white hover:bg-rose-500",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
): string {
  return `${BASE} ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`.trim();
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button type="button" {...props} className={buttonClassName(variant, size, className)} />
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: LinkProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link {...props} className={buttonClassName(variant, size, className)}>
      {children}
    </Link>
  );
}
