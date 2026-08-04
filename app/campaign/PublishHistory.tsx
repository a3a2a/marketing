import type { PublishMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

// Color recipe follows the same convention as lib/campaign.ts's badge maps
// (bg-{color}-100/text-{color}-700 light, bg-{color}-500/15 text-{color}-300
// dark).
const MODE_LABELS: Record<PublishMode, string> = {
  SENT: "발송 완료",
  SIMULATED: "시뮬레이션",
  FAILED: "실패",
};

const MODE_BADGE_CLASSES: Record<PublishMode, string> = {
  SENT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  SIMULATED:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  FAILED: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

// Renders a campaign's PublishLog rows, newest first. A server component so
// it always reflects the latest logs after publishCampaign's revalidatePath.
export default async function PublishHistory({
  campaignId,
}: {
  campaignId: string;
}) {
  const logs = await prisma.publishLog.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">발행 이력</h2>
      {logs.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          아직 발행 이력이 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {logs.map((log) => (
            <li key={log.id}>
              <Card className="p-4">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge className={MODE_BADGE_CLASSES[log.mode]}>
                    {MODE_LABELS[log.mode]}
                  </Badge>
                  <span className="text-xs text-black/50 dark:text-white/50">
                    {log.channel}
                  </span>
                  <span className="text-xs text-black/40 dark:text-white/40">
                    {formatTimestamp(log.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-black/70 dark:text-white/70">
                  {log.message}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
