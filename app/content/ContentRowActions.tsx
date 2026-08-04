"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ContentStatus } from "@prisma/client";
import { deleteContentDraft, toggleContentStatus } from "./actions";
import { Button, LinkButton } from "@/components/ui/Button";

export default function ContentRowActions({
  id,
  status,
}: {
  id: string;
  status: ContentStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("이 콘텐츠를 삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deleteContentDraft(id);
      router.refresh();
    });
  }

  function handleToggle() {
    startTransition(async () => {
      await toggleContentStatus(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <LinkButton href={`/content/${id}/edit`} variant="outline" size="sm">
        수정
      </LinkButton>
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
      >
        {status === "DRAFT" ? "발행하기" : "초안으로 전환"}
      </Button>
      <Button
        variant="danger-outline"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
      >
        삭제
      </Button>
    </div>
  );
}
