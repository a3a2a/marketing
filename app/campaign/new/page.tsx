import { listContentDraftOptions } from "@/lib/campaign";
import CampaignForm from "../CampaignForm";
import { createCampaign } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function NewCampaignPage() {
  const drafts = await listContentDraftOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="새 캠페인 만들기"
        description="필수 항목을 입력하고 저장하세요."
      />
      <CampaignForm action={createCampaign} drafts={drafts} />
    </div>
  );
}
