"use client";

import { useTransition, useState } from "react";
import type { ContentStatus, ContentTone, ContentType } from "@prisma/client";
import {
  CONTENT_STATUS_LABELS,
  CONTENT_TONE_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  generateDraftBody,
} from "@/lib/content";
import { createContentDraft, updateContentDraft } from "./actions";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, fieldControlClassName } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";

type FieldErrors = Partial<
  Record<"title" | "type" | "product" | "audience" | "tone" | "body", string>
>;

export interface ContentFormInitial {
  title: string;
  type: ContentType;
  product: string;
  audience: string;
  tone: ContentTone;
  keywords: string;
  body: string;
  status: ContentStatus;
}

export default function ContentForm({
  mode,
  id,
  initial,
}: {
  mode: "create" | "edit";
  id?: string;
  initial?: ContentFormInitial;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<ContentType | "">(initial?.type ?? "");
  const [product, setProduct] = useState(initial?.product ?? "");
  const [audience, setAudience] = useState(initial?.audience ?? "");
  const [tone, setTone] = useState<ContentTone | "">(initial?.tone ?? "");
  const [keywords, setKeywords] = useState(initial?.keywords ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [status, setStatus] = useState<ContentStatus>(
    initial?.status ?? "DRAFT",
  );
  const [bodyEdited, setBodyEdited] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();

  function validateCore(): FieldErrors {
    const next: FieldErrors = {};
    if (!title.trim()) next.title = "제목을 입력해주세요.";
    if (!type) next.type = "콘텐츠 유형을 선택해주세요.";
    if (!product.trim()) next.product = "제품/서비스를 입력해주세요.";
    if (!audience.trim()) next.audience = "타겟 고객을 입력해주세요.";
    if (!tone) next.tone = "톤을 선택해주세요.";
    return next;
  }

  function handleGenerate() {
    const coreErrors = validateCore();
    if (Object.keys(coreErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...coreErrors }));
      return;
    }

    if (bodyEdited && body.trim() !== "") {
      const confirmed = window.confirm(
        "직접 수정한 내용이 있습니다. 새로 생성한 초안으로 덮어쓰시겠습니까?",
      );
      if (!confirmed) return;
    }

    const newBody = generateDraftBody({
      title: title.trim(),
      type: type as ContentType,
      product: product.trim(),
      audience: audience.trim(),
      tone: tone as ContentTone,
      keywords,
    });

    setBody(newBody);
    setBodyEdited(false);
    setErrors({});
  }

  function handleSave() {
    const coreErrors = validateCore();
    const nextErrors: FieldErrors = { ...coreErrors };
    if (!body.trim()) {
      nextErrors.body =
        "생성된 초안 내용이 비어있습니다. 먼저 '초안 생성'을 눌러 초안을 만들어주세요.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    startTransition(async () => {
      if (mode === "create") {
        await createContentDraft({
          title: title.trim(),
          type: type as ContentType,
          product: product.trim(),
          audience: audience.trim(),
          tone: tone as ContentTone,
          keywords: keywords.trim() || undefined,
          body,
        });
      } else if (id) {
        await updateContentDraft(id, {
          title: title.trim(),
          type: type as ContentType,
          product: product.trim(),
          audience: audience.trim(),
          tone: tone as ContentTone,
          keywords: keywords.trim() || undefined,
          body,
          status,
        });
      }
    });
  }

  return (
    <Card className="max-w-2xl space-y-6 p-6">
      <Field label="제목" htmlFor="title" required error={errors.title}>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 여름맞이 신제품 출시 안내"
          className={fieldControlClassName(!!errors.title)}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="콘텐츠 유형" htmlFor="type" required error={errors.type}>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as ContentType)}
            className={fieldControlClassName(!!errors.type)}
          >
            <option value="">선택하세요</option>
            {CONTENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="톤" htmlFor="tone" required error={errors.tone}>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value as ContentTone)}
            className={fieldControlClassName(!!errors.tone)}
          >
            <option value="">선택하세요</option>
            {CONTENT_TONE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="제품/서비스" htmlFor="product" required error={errors.product}>
        <input
          id="product"
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="예: 무선 이어폰 X100"
          className={fieldControlClassName(!!errors.product)}
        />
      </Field>

      <Field label="타겟 고객" htmlFor="audience" required error={errors.audience}>
        <input
          id="audience"
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="예: 20-30대 직장인"
          className={fieldControlClassName(!!errors.audience)}
        />
      </Field>

      <Field label="핵심 메시지/키워드" htmlFor="keywords">
        <textarea
          id="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          rows={3}
          placeholder="예: 가벼움, 긴 배터리 수명, 방수"
          className={fieldControlClassName(false)}
        />
      </Field>

      {mode === "edit" && (
        <Field label="상태">
          <div className="flex w-fit overflow-hidden rounded-md border border-black/15 dark:border-white/20">
            {(["DRAFT", "PUBLISHED"] as ContentStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  status === s
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-transparent text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
                }`}
              >
                {CONTENT_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </Field>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4 dark:border-white/10">
        <Button type="button" variant="outline" onClick={handleGenerate}>
          초안 생성
        </Button>
        <span className="text-xs text-black/50 dark:text-white/50">
          필수 항목을 입력한 뒤 초안을 생성할 수 있습니다.
        </span>
      </div>

      <Field label="생성된 초안" htmlFor="body" error={errors.body}>
        <textarea
          id="body"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setBodyEdited(true);
          }}
          rows={14}
          placeholder="'초안 생성' 버튼을 눌러 초안을 만들어보세요."
          className={fieldControlClassName(!!errors.body, "font-mono")}
        />
      </Field>

      <div className="flex items-center gap-3 border-t border-black/10 pt-4 dark:border-white/10">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending ? "저장 중..." : "저장"}
        </Button>
        <LinkButton href="/content" variant="ghost">
          취소
        </LinkButton>
      </div>
    </Card>
  );
}
