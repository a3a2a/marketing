import type { ReactNode } from "react";

// Shared page-level header (title + optional description + optional action
// button) used by every module's top-level pages so the "top of page" feel
// is identical across 홈/콘텐츠/캠페인/리포트.
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
