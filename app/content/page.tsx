import Link from "next/link";
import type { ContentStatus, ContentType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ContentFilters from "./ContentFilters";
import ContentRowActions from "./ContentRowActions";
import { StatusBadge, TypeBadge } from "./Badges";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";

type SearchParams = { type?: string; status?: string; q?: string };

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const type = sp.type ?? "";
  const status = sp.status ?? "";
  const q = sp.q ?? "";

  const totalCount = await prisma.contentDraft.count();

  const where: Prisma.ContentDraftWhereInput = {};
  if (type) where.type = type as ContentType;
  if (status) where.status = status as ContentStatus;
  if (q) where.title = { contains: q };

  const drafts = await prisma.contentDraft.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="콘텐츠 생성"
        description="템플릿 기반으로 블로그·SNS·이메일 마케팅 카피 초안을 만들고 관리하세요."
        action={
          <LinkButton href="/content/new">+ 새 콘텐츠 만들기</LinkButton>
        }
      />

      {totalCount === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ContentFilters type={type} status={status} q={q} />

          {drafts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-black/15 p-8 text-center text-sm text-black/60 dark:border-white/15 dark:text-white/60">
              검색/필터 조건에 맞는 콘텐츠가 없습니다.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-black/5 text-xs uppercase tracking-wide text-black/60 dark:bg-white/5 dark:text-white/60">
                  <tr>
                    <th className="px-4 py-3 font-medium">제목</th>
                    <th className="px-4 py-3 font-medium">유형</th>
                    <th className="px-4 py-3 font-medium">상태</th>
                    <th className="px-4 py-3 font-medium">생성일</th>
                    <th className="px-4 py-3 text-right font-medium">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 dark:divide-white/10">
                  {drafts.map((draft) => (
                    <tr
                      key={draft.id}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/content/${draft.id}/edit`}
                          className="hover:underline"
                        >
                          {draft.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <TypeBadge type={draft.type} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={draft.status} />
                      </td>
                      <td className="px-4 py-3 text-black/60 dark:text-white/60">
                        {formatDate(draft.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <ContentRowActions id={draft.id} status={draft.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-black/15 p-16 text-center dark:border-white/15">
      <p className="text-base font-medium">아직 생성된 콘텐츠가 없습니다.</p>
      <p className="text-sm text-black/60 dark:text-white/60">
        새 콘텐츠를 만들어 블로그, SNS, 이메일용 마케팅 카피 초안을
        시작해보세요.
      </p>
      <LinkButton href="/content/new">+ 새 콘텐츠 만들기</LinkButton>
    </div>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
