"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CONTENT_STATUS_BADGE_CLASSES,
  CONTENT_STATUS_LABELS,
  CONTENT_TYPE_BADGE_CLASSES,
  CONTENT_TYPE_LABELS,
  type ContentDraftOption,
} from "@/lib/campaign";
import { Badge } from "@/components/ui/Badge";
import { fieldControlClassName } from "@/components/ui/Field";

const NONE_LABEL = "연결 안함";

export default function ContentDraftSelect({
  drafts,
  defaultValue,
  id,
}: {
  drafts: ContentDraftOption[];
  defaultValue?: string | null;
  id?: string;
}) {
  const [selectedId, setSelectedId] = useState<string>(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectedDraft = useMemo(
    () => drafts.find((d) => d.id === selectedId),
    [drafts, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return drafts;
    return drafts.filter((d) => d.title.toLowerCase().includes(q));
  }, [drafts, query]);

  return (
    <div ref={rootRef} id={id} className="relative">
      {/* Actual value submitted with the form */}
      <input type="hidden" name="contentDraftId" value={selectedId} />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={fieldControlClassName(
          false,
          "flex items-center justify-between text-left",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selectedDraft ? (
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate">{selectedDraft.title}</span>
            <Badge className={CONTENT_TYPE_BADGE_CLASSES[selectedDraft.type]}>
              {CONTENT_TYPE_LABELS[selectedDraft.type]}
            </Badge>
            <Badge className={CONTENT_STATUS_BADGE_CLASSES[selectedDraft.status]}>
              {CONTENT_STATUS_LABELS[selectedDraft.status]}
            </Badge>
          </span>
        ) : (
          <span className="text-black/50 dark:text-white/50">
            {NONE_LABEL}
          </span>
        )}
        <span className="ml-2 shrink-0 text-black/40 dark:text-white/40">
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-black/15 bg-white shadow-lg dark:border-white/20 dark:bg-black">
          <div className="border-b border-black/10 p-2 dark:border-white/10">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목으로 검색"
              className={fieldControlClassName(false, "", "sm")}
            />
          </div>
          <ul role="listbox" className="max-h-64 overflow-y-auto py-1 text-sm">
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedId("");
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center px-3 py-2 text-left text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
              >
                {NONE_LABEL}
              </button>
            </li>
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-black/40 dark:text-white/40">
                일치하는 콘텐츠 초안이 없습니다.
              </li>
            )}
            {filtered.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(d.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="min-w-0 flex-1 truncate">{d.title}</span>
                  <Badge className={CONTENT_TYPE_BADGE_CLASSES[d.type]}>
                    {CONTENT_TYPE_LABELS[d.type]}
                  </Badge>
                  <Badge className={CONTENT_STATUS_BADGE_CLASSES[d.status]}>
                    {CONTENT_STATUS_LABELS[d.status]}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
