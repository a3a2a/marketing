import Link from "next/link";
import type { RecentActivityItem } from "@/lib/report";
import { Badge } from "@/components/ui/Badge";

const KIND_LABELS: Record<RecentActivityItem["kind"], string> = {
  content: "콘텐츠",
  campaign: "캠페인",
};

const KIND_BADGE_CLASSES: Record<RecentActivityItem["kind"], string> = {
  content: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  campaign:
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
};

const KIND_ICON: Record<RecentActivityItem["kind"], string> = {
  content: "📝",
  campaign: "📣",
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "방금 전";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}분 전`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}시간 전`;
  if (diffMs < 30 * day) return `${Math.floor(diffMs / day)}일 전`;
  return formatTimestamp(iso);
}

export default function RecentActivityList({
  items,
}: {
  items: RecentActivityItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-black/15 p-8 text-center text-sm text-black/60 dark:border-white/15 dark:text-white/60">
        아직 활동 내역이 없습니다.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-black/10 overflow-hidden rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}`}>
          <Link
            href={item.href}
            className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
          >
            <Badge className={`gap-1 ${KIND_BADGE_CLASSES[item.kind]}`}>
              <span aria-hidden>{KIND_ICON[item.kind]}</span>
              {KIND_LABELS[item.kind]}
            </Badge>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {item.title}
            </span>
            <Badge
              style={{
                backgroundColor: `${item.statusColor}1f`,
                color: item.statusColor,
              }}
            >
              {item.statusLabel}
            </Badge>
            <span
              className="shrink-0 text-xs tabular-nums text-black/50 dark:text-white/50"
              title={formatTimestamp(item.timestamp)}
            >
              {formatRelative(item.timestamp)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
