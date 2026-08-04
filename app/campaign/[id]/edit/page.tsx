import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CHANNEL_LABELS,
  CONTENT_STATUS_BADGE_CLASSES,
  CONTENT_STATUS_LABELS,
  CONTENT_TYPE_BADGE_CLASSES,
  CONTENT_TYPE_LABELS,
  getCampaignById,
  listContentDraftOptions,
} from "@/lib/campaign";
import CampaignForm from "../../CampaignForm";
import { updateCampaign } from "../../actions";
import PublishButton from "../../PublishButton";
import PublishHistory from "../../PublishHistory";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function excerpt(body: string, max = 160): string {
  const trimmed = body.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [campaign, drafts] = await Promise.all([
    getCampaignById(id),
    listContentDraftOptions(),
  ]);

  if (!campaign) {
    notFound();
  }

  const boundUpdate = updateCampaign.bind(null, campaign.id);

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <PageHeader
          title="캠페인 수정"
          description="캠페인 정보를 수정하고 저장하세요."
        />
        <CampaignForm
          action={boundUpdate}
          drafts={drafts}
          initialValues={{
            name: campaign.name,
            channel: campaign.channel,
            status: campaign.status,
            scheduledDate: toDateInputValue(campaign.scheduledDate),
            contentDraftId: campaign.contentDraftId,
            notes: campaign.notes,
          }}
        />
      </div>

      <div className="mx-auto max-w-2xl">
        <h2 className="mb-3 text-lg font-semibold">연결된 콘텐츠</h2>
        {campaign.contentDraft ? (
          <Card className="bg-black/[0.02] p-4 dark:bg-white/[0.03]">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="font-medium">{campaign.contentDraft.title}</h3>
              <Badge className={CONTENT_TYPE_BADGE_CLASSES[campaign.contentDraft.type]}>
                {CONTENT_TYPE_LABELS[campaign.contentDraft.type]}
              </Badge>
              <Badge className={CONTENT_STATUS_BADGE_CLASSES[campaign.contentDraft.status]}>
                {CONTENT_STATUS_LABELS[campaign.contentDraft.status]}
              </Badge>
            </div>
            <p className="mb-3 text-sm text-black/70 dark:text-white/70">
              {excerpt(campaign.contentDraft.body)}
            </p>
            <Link
              href={`/content/${campaign.contentDraft.id}/edit`}
              className="text-sm font-medium text-blue-600 underline hover:text-blue-500 dark:text-blue-400"
            >
              콘텐츠 초안 열기 →
            </Link>
          </Card>
        ) : (
          <div className="rounded-lg border border-dashed border-black/15 p-4 text-sm text-black/60 dark:border-white/20 dark:text-white/60">
            <p className="mb-2">아직 연결된 콘텐츠 초안이 없습니다.</p>
            <a
              href="#content-draft-select"
              className="font-medium text-blue-600 underline hover:text-blue-500 dark:text-blue-400"
            >
              콘텐츠 연결하기
            </a>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">발행</h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            선택한 채널({CHANNEL_LABELS[campaign.channel]})로 연결된 콘텐츠를
            바로 발행합니다.
          </p>
          <PublishButton campaignId={campaign.id} />
        </div>
        <PublishHistory campaignId={campaign.id} />
      </div>
    </div>
  );
}
