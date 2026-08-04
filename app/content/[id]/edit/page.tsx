import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContentForm from "../../ContentForm";
import { StatusBadge, TypeBadge } from "../../Badges";
import { Card } from "@/components/ui/Card";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const draft = await prisma.contentDraft.findUnique({
    where: { id },
    include: { campaigns: true },
  });

  if (!draft) notFound();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">콘텐츠 수정</h1>
          <TypeBadge type={draft.type} />
          <StatusBadge status={draft.status} />
        </div>
        <p className="mt-1 text-xs text-black/50 dark:text-white/50">
          생성일 {formatDateTime(draft.createdAt)} · 수정일{" "}
          {formatDateTime(draft.updatedAt)}
        </p>
      </div>

      <ContentForm
        mode="edit"
        id={draft.id}
        initial={{
          title: draft.title,
          type: draft.type,
          product: draft.product,
          audience: draft.audience,
          tone: draft.tone,
          keywords: draft.keywords ?? "",
          body: draft.body,
          status: draft.status,
        }}
      />

      <Card className="max-w-2xl p-4">
        <h2 className="text-sm font-semibold">연결된 캠페인</h2>
        {draft.campaigns.length === 0 ? (
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            이 콘텐츠를 사용 중인 캠페인이 없습니다.
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {draft.campaigns.map((campaign) => (
              <li key={campaign.id}>
                <Link
                  href="/campaign"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {campaign.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
