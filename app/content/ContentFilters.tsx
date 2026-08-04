"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fieldControlClassName } from "@/components/ui/Field";

const TYPE_TABS: { value: string; label: string }[] = [
  { value: "", label: "전체" },
  { value: "BLOG", label: "블로그" },
  { value: "SNS", label: "SNS" },
  { value: "EMAIL", label: "이메일" },
];

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "", label: "전체" },
  { value: "DRAFT", label: "초안" },
  { value: "PUBLISHED", label: "발행됨" },
];

export default function ContentFilters({
  type,
  status,
  q,
}: {
  type: string;
  status: string;
  q: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [text, setText] = useState(q);

  // Keep the local input in sync when navigation changes the URL externally
  // (e.g. browser back/forward).
  useEffect(() => {
    setText(q);
  }, [q]);

  function navigate(nextType: string, nextStatus: string, nextQ: string) {
    const params = new URLSearchParams();
    if (nextType) params.set("type", nextType);
    if (nextStatus) params.set("status", nextStatus);
    if (nextQ) params.set("q", nextQ);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  // Debounce the free-text search so we don't push a new URL on every
  // keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (text !== q) navigate(type, status, text);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-4">
        <TabGroup
          label="유형"
          tabs={TYPE_TABS}
          value={type}
          onChange={(v) => navigate(v, status, text)}
        />
        <TabGroup
          label="상태"
          tabs={STATUS_TABS}
          value={status}
          onChange={(v) => navigate(type, v, text)}
        />
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="제목으로 검색"
        aria-label="제목으로 검색"
        className={fieldControlClassName(false, "sm:w-56")}
      />
    </div>
  );
}

function TabGroup({
  label,
  tabs,
  value,
  onChange,
}: {
  label: string;
  tabs: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-black/50 dark:text-white/50">
        {label}
      </span>
      <div className="flex overflow-hidden rounded-md border border-black/10 dark:border-white/15">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              value === tab.value
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-transparent text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
