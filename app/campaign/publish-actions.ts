"use server";

import { revalidatePath } from "next/cache";
import type { PublishMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CHANNEL_LABELS, getCampaignById } from "@/lib/campaign";
import { sendEmail } from "@/lib/publish/email";
import { postToSns } from "@/lib/publish/sns";

export type PublishActionResult = {
  mode: PublishMode;
  message: string;
};

function truncate(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

// Publishes a campaign through its channel's provider (email/SNS), or
// records a simulated-only attempt for channels with no live provider
// (BLOG/ETC). Always writes a PublishLog row, and on a non-failed outcome
// promotes a DRAFT/SCHEDULED campaign to ACTIVE.
export async function publishCampaign(
  campaignId: string,
): Promise<PublishActionResult> {
  const campaign = await getCampaignById(campaignId);

  if (!campaign) {
    return { mode: "FAILED", message: "캠페인을 찾을 수 없습니다." };
  }

  const draft = campaign.contentDraft;
  const subject = draft?.title ?? campaign.name;
  const body = draft?.body ?? campaign.notes ?? "";

  let mode: PublishMode;
  let message: string;

  try {
    if (campaign.channel === "EMAIL") {
      const to = process.env.PUBLISH_TEST_EMAIL_TO || "test@example.com";
      const result = await sendEmail({ to, subject, body });
      mode = result.status;
      message = result.message;
    } else if (campaign.channel === "SNS") {
      const text = body ? `${subject}\n\n${body}` : subject;
      const result = await postToSns({ text });
      mode = result.status;
      message = result.message;
    } else {
      // BLOG / ETC: no real provider wired up for these channels.
      mode = "SIMULATED";
      message = `${CHANNEL_LABELS[campaign.channel]} 채널은 실제 발행 연동이 없어 시뮬레이션 모드로 처리되었습니다 — 내용: "${truncate(
        body || subject,
      )}"`;
    }
  } catch (err) {
    mode = "FAILED";
    message =
      err instanceof Error
        ? err.message
        : "발행 처리 중 알 수 없는 오류가 발생했습니다.";
  }

  await prisma.publishLog.create({
    data: {
      campaignId: campaign.id,
      channel: campaign.channel,
      mode,
      message,
    },
  });

  if (
    mode !== "FAILED" &&
    (campaign.status === "DRAFT" || campaign.status === "SCHEDULED")
  ) {
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "ACTIVE" },
    });
  }

  revalidatePath(`/campaign/${campaignId}/edit`);
  revalidatePath("/campaign");

  return { mode, message };
}
