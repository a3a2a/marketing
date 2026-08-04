import ContentForm from "../ContentForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NewContentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="새 콘텐츠 만들기"
        description="필수 항목을 입력하고 초안을 생성한 뒤 저장하세요."
      />
      <ContentForm mode="create" />
    </div>
  );
}
