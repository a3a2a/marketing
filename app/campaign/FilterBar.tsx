"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  CHANNEL_LABELS,
  CHANNEL_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from "@/lib/campaign";
import { compactControlClassName } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const ALL = "ALL";

export default function FilterBar({
  channel,
  status,
  sort,
}: {
  channel: string;
  status: string;
  sort: "asc" | "desc";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function pushWith(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === ALL) params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `/campaign?${qs}` : "/campaign");
  }

  return (
    <div className="mb-4 flex flex-wrap items-end gap-4">
      <div>
        <label htmlFor="filter-channel" className="mb-1 block text-xs font-medium text-black/60 dark:text-white/60">
          채널
        </label>
        <select
          id="filter-channel"
          value={channel}
          onChange={(e) => pushWith({ channel: e.target.value })}
          className={compactControlClassName()}
        >
          <option value={ALL}>전체</option>
          {CHANNEL_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {CHANNEL_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-status" className="mb-1 block text-xs font-medium text-black/60 dark:text-white/60">
          상태
        </label>
        <select
          id="filter-status"
          value={status}
          onChange={(e) => pushWith({ status: e.target.value })}
          className={compactControlClassName()}
        >
          <option value={ALL}>전체</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <Button
        variant="outline"
        onClick={() => pushWith({ sort: sort === "asc" ? "desc" : "asc" })}
        title="예약 일자 정렬 순서 변경"
      >
        예약 일자 {sort === "asc" ? "오름차순" : "내림차순"}
        <span aria-hidden>{sort === "asc" ? "▲" : "▼"}</span>
      </Button>
    </div>
  );
}
