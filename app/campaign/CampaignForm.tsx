"use client";

import { useActionState } from "react";
import {
  CHANNEL_LABELS,
  CHANNEL_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  type ContentDraftOption,
} from "@/lib/campaign";
import type { CampaignFormState } from "./actions";
import ContentDraftSelect from "./ContentDraftSelect";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, fieldControlClassName } from "@/components/ui/Field";

type CampaignFormAction = (
  state: CampaignFormState,
  formData: FormData,
) => Promise<CampaignFormState>;

export type CampaignFormInitialValues = {
  name: string;
  channel: string;
  status: string;
  scheduledDate: string; // yyyy-mm-dd
  contentDraftId: string | null;
  notes: string | null;
};

export default function CampaignForm({
  action,
  drafts,
  initialValues,
}: {
  action: CampaignFormAction;
  drafts: ContentDraftOption[];
  initialValues?: CampaignFormInitialValues;
}) {
  const [state, formAction, pending] = useActionState<
    CampaignFormState,
    FormData
  >(action, { errors: {} });

  return (
    <Card className="mx-auto max-w-2xl space-y-6 p-6">
      <form action={formAction} className="space-y-6">
        <Field label="캠페인 이름" htmlFor="name" required error={state.errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={initialValues?.name}
            className={fieldControlClassName(!!state.errors.name)}
            placeholder="예: 여름 신제품 런칭 캠페인"
            aria-invalid={!!state.errors.name}
            aria-describedby={state.errors.name ? "name-error" : undefined}
          />
        </Field>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="채널" htmlFor="channel" required error={state.errors.channel}>
            <select
              id="channel"
              name="channel"
              defaultValue={initialValues?.channel ?? ""}
              className={fieldControlClassName(!!state.errors.channel)}
              aria-invalid={!!state.errors.channel}
              aria-describedby={
                state.errors.channel ? "channel-error" : undefined
              }
            >
              <option value="" disabled>
                채널 선택
              </option>
              {CHANNEL_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABELS[c]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="상태" htmlFor="status" required error={state.errors.status}>
            <select
              id="status"
              name="status"
              defaultValue={initialValues?.status ?? "DRAFT"}
              className={fieldControlClassName(!!state.errors.status)}
              aria-invalid={!!state.errors.status}
              aria-describedby={
                state.errors.status ? "status-error" : undefined
              }
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="예약 일자"
          htmlFor="scheduledDate"
          required
          error={state.errors.scheduledDate}
        >
          <input
            id="scheduledDate"
            name="scheduledDate"
            type="date"
            defaultValue={initialValues?.scheduledDate}
            className={fieldControlClassName(
              !!state.errors.scheduledDate,
              "sm:w-64",
            )}
            aria-invalid={!!state.errors.scheduledDate}
            aria-describedby={
              state.errors.scheduledDate ? "scheduledDate-error" : undefined
            }
          />
        </Field>

        <Field
          label="연결할 콘텐츠 초안"
          htmlFor="content-draft-select"
          hint="콘텐츠 생성 모듈에서 만든 초안(발행 여부 무관)을 캠페인에 연결할 수 있습니다. 선택하지 않으면 콘텐츠 없이 저장됩니다."
        >
          <ContentDraftSelect
            id="content-draft-select"
            drafts={drafts}
            defaultValue={initialValues?.contentDraftId ?? ""}
          />
        </Field>

        <Field label="메모" htmlFor="notes">
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={initialValues?.notes ?? ""}
            className={fieldControlClassName(false)}
            placeholder="캠페인에 대한 참고 사항을 입력하세요."
          />
        </Field>

        {state.submitError && (
          <p className="text-sm text-rose-600">{state.submitError}</p>
        )}

        <div className="flex items-center gap-3 border-t border-black/10 pt-4 dark:border-white/10">
          <Button type="submit" disabled={pending}>
            {pending ? "저장 중..." : "저장"}
          </Button>
          <LinkButton href="/campaign" variant="outline">
            취소
          </LinkButton>
        </div>
      </form>
    </Card>
  );
}
