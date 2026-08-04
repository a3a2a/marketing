import {
  countAllCampaigns,
  isCampaignChannel,
  isCampaignStatus,
  listCampaigns,
} from "@/lib/campaign";
import CampaignTable, { type CampaignRow } from "./CampaignTable";
import FilterBar from "./FilterBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";

function formatDateLabel(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export default async function CampaignPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const channelParam = typeof sp.channel === "string" ? sp.channel : "";
  const statusParam = typeof sp.status === "string" ? sp.status : "";
  const sortParam = sp.sort === "desc" ? "desc" : "asc";

  const channel = isCampaignChannel(channelParam) ? channelParam : undefined;
  const status = isCampaignStatus(statusParam) ? statusParam : undefined;

  const [campaigns, totalCount] = await Promise.all([
    listCampaigns({ channel, status, sort: sortParam }),
    countAllCampaigns(),
  ]);

  const rows: CampaignRow[] = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    channel: c.channel,
    status: c.status,
    scheduledDateLabel: formatDateLabel(c.scheduledDate),
    contentDraft: c.contentDraft
      ? { id: c.contentDraft.id, title: c.contentDraft.title }
      : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="캠페인 관리"
        description="채널별 캠페인 일정과 진행 상태를 관리하세요."
        action={
          <LinkButton href="/campaign/new">+ 새 캠페인 만들기</LinkButton>
        }
      />

      <FilterBar
        channel={channel ?? "ALL"}
        status={status ?? "ALL"}
        sort={sortParam}
      />

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-black/15 py-16 text-center dark:border-white/20">
          <p className="text-black/60 dark:text-white/60">
            {totalCount === 0
              ? "아직 등록된 캠페인이 없습니다."
              : "조건에 맞는 캠페인이 없습니다."}
          </p>
          <LinkButton href="/campaign/new">+ 새 캠페인 만들기</LinkButton>
        </div>
      ) : (
        <CampaignTable rows={rows} />
      )}
    </div>
  );
}
