import type { ContentStatus, ContentType } from "@prisma/client";
import { CONTENT_STATUS_LABELS, CONTENT_TYPE_LABELS } from "@/lib/content";
import { Badge } from "@/components/ui/Badge";

// Colors mirror CONTENT_TYPE_BADGE_CLASSES / CONTENT_STATUS_BADGE_CLASSES in
// lib/campaign.ts so the same content type/status reads as the same color in
// both the 콘텐츠 and 캠페인 modules.
const TYPE_COLORS: Record<ContentType, string> = {
  BLOG: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  SNS: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  EMAIL: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

export function TypeBadge({ type }: { type: ContentType }) {
  return <Badge className={TYPE_COLORS[type]}>{CONTENT_TYPE_LABELS[type]}</Badge>;
}

const STATUS_COLORS: Record<ContentStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/70",
  PUBLISHED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <Badge className={STATUS_COLORS[status]}>
      {CONTENT_STATUS_LABELS[status]}
    </Badge>
  );
}
