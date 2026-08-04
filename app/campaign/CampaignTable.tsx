"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  CHANNEL_BADGE_CLASSES,
  CHANNEL_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from "@/lib/campaign";
import { deleteCampaign, updateCampaignStatus } from "./actions";
import type { CampaignChannel, CampaignStatus } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { compactControlClassName } from "@/components/ui/Field";

export type CampaignRow = {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  scheduledDateLabel: string;
  contentDraft: { id: string; title: string } | null;
};

export default function CampaignTable({ rows }: { rows: CampaignRow[] }) {
  const [pending, startTransition] = useTransition();
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CampaignRow | null>(null);

  function handleStatusChange(id: string, status: string) {
    setPendingStatusId(id);
    startTransition(async () => {
      await updateCampaignStatus(id, status);
      setPendingStatusId(null);
    });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startTransition(async () => {
      await deleteCampaign(id);
      setDeleteTarget(null);
    });
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-black/5 text-xs uppercase tracking-wide text-black/60 dark:bg-white/5 dark:text-white/60">
            <tr>
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">채널</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">예약 일자</th>
              <th className="px-4 py-3 font-medium">연결된 콘텐츠</th>
              <th className="px-4 py-3 font-medium">빠른 상태 변경</th>
              <th className="px-4 py-3 text-right font-medium">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-white/10">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="align-middle hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3">
                  <Badge className={CHANNEL_BADGE_CLASSES[row.channel]}>
                    {CHANNEL_LABELS[row.channel]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_BADGE_CLASSES[row.status]}>
                    {STATUS_LABELS[row.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-black/60 dark:text-white/60">
                  {row.scheduledDateLabel}
                </td>
                <td className="px-4 py-3">
                  {row.contentDraft ? (
                    <Link
                      href={`/content/${row.contentDraft.id}/edit`}
                      className="text-blue-600 underline hover:text-blue-500 dark:text-blue-400"
                    >
                      {row.contentDraft.title}
                    </Link>
                  ) : (
                    <span className="text-black/40 dark:text-white/40">
                      연결 없음
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={row.status}
                    disabled={pending && pendingStatusId === row.id}
                    onChange={(e) => handleStatusChange(row.id, e.target.value)}
                    className={compactControlClassName(false, "disabled:opacity-50")}
                    aria-label={`${row.name} 상태 변경`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <LinkButton
                      href={`/campaign/${row.id}/edit`}
                      variant="outline"
                      size="sm"
                    >
                      수정
                    </LinkButton>
                    <Button
                      variant="danger-outline"
                      size="sm"
                      onClick={() => setDeleteTarget(row)}
                    >
                      삭제
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl dark:bg-neutral-900">
            <h2 className="mb-2 text-base font-semibold">캠페인 삭제</h2>
            <p className="mb-5 text-sm text-black/70 dark:text-white/70">
              이 캠페인을 삭제하시겠습니까?
              <br />
              <span className="font-medium">“{deleteTarget.name}”</span> 캠페인이
              영구적으로 삭제됩니다.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={pending}
              >
                취소
              </Button>
              <Button
                variant="danger-solid"
                onClick={handleConfirmDelete}
                disabled={pending}
              >
                {pending ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
