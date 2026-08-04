"use server";

import { prisma } from "@/lib/prisma";
import type { ContentStatus, ContentTone, ContentType } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface ContentDraftInput {
  title: string;
  type: ContentType;
  product: string;
  audience: string;
  tone: ContentTone;
  keywords?: string;
  body: string;
}

function validate(data: ContentDraftInput) {
  if (!data.title.trim()) throw new Error("제목을 입력해주세요.");
  if (!data.type) throw new Error("콘텐츠 유형을 선택해주세요.");
  if (!data.product.trim()) throw new Error("제품/서비스를 입력해주세요.");
  if (!data.audience.trim()) throw new Error("타겟 고객을 입력해주세요.");
  if (!data.tone) throw new Error("톤을 선택해주세요.");
  if (!data.body.trim()) throw new Error("생성된 초안 내용이 비어있습니다.");
}

export async function createContentDraft(data: ContentDraftInput) {
  validate(data);
  await prisma.contentDraft.create({
    data: {
      title: data.title.trim(),
      type: data.type,
      product: data.product.trim(),
      audience: data.audience.trim(),
      tone: data.tone,
      keywords: data.keywords?.trim() || null,
      body: data.body,
      status: "DRAFT",
    },
  });
  revalidatePath("/content");
  redirect("/content");
}

export async function updateContentDraft(
  id: string,
  data: ContentDraftInput & { status: ContentStatus },
) {
  validate(data);
  await prisma.contentDraft.update({
    where: { id },
    data: {
      title: data.title.trim(),
      type: data.type,
      product: data.product.trim(),
      audience: data.audience.trim(),
      tone: data.tone,
      keywords: data.keywords?.trim() || null,
      body: data.body,
      status: data.status,
    },
  });
  revalidatePath("/content");
  revalidatePath(`/content/${id}/edit`);
  redirect("/content");
}

export async function deleteContentDraft(id: string) {
  await prisma.contentDraft.delete({ where: { id } });
  revalidatePath("/content");
}

export async function toggleContentStatus(id: string) {
  const draft = await prisma.contentDraft.findUnique({ where: { id } });
  if (!draft) return;
  const nextStatus: ContentStatus =
    draft.status === "DRAFT" ? "PUBLISHED" : "DRAFT";
  await prisma.contentDraft.update({
    where: { id },
    data: { status: nextStatus },
  });
  revalidatePath("/content");
  revalidatePath(`/content/${id}/edit`);
}
