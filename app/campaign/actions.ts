"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isCampaignChannel, isCampaignStatus } from "@/lib/campaign";

export type CampaignFormState = {
  errors: Partial<
    Record<"name" | "channel" | "status" | "scheduledDate", string>
  >;
  submitError?: string;
};

function parseCampaignForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const channel = String(formData.get("channel") ?? "");
  const status = String(formData.get("status") ?? "");
  const scheduledDateRaw = String(formData.get("scheduledDate") ?? "");
  const contentDraftIdRaw = String(formData.get("contentDraftId") ?? "");
  const notesRaw = String(formData.get("notes") ?? "");

  const errors: CampaignFormState["errors"] = {};

  if (!name) errors.name = "캠페인 이름을 입력해 주세요.";

  if (!channel) {
    errors.channel = "채널을 선택해 주세요.";
  } else if (!isCampaignChannel(channel)) {
    errors.channel = "올바르지 않은 채널입니다.";
  }

  if (!status) {
    errors.status = "상태를 선택해 주세요.";
  } else if (!isCampaignStatus(status)) {
    errors.status = "올바르지 않은 상태입니다.";
  }

  let scheduledDate: Date | undefined;
  if (!scheduledDateRaw) {
    errors.scheduledDate = "예약 일자를 입력해 주세요.";
  } else {
    const parsed = new Date(scheduledDateRaw);
    if (Number.isNaN(parsed.getTime())) {
      errors.scheduledDate = "올바른 날짜 형식이 아닙니다.";
    } else {
      scheduledDate = parsed;
    }
  }

  return {
    errors,
    data: {
      name,
      channel: isCampaignChannel(channel) ? channel : undefined,
      status: isCampaignStatus(status) ? status : undefined,
      scheduledDate,
      contentDraftId: contentDraftIdRaw ? contentDraftIdRaw : null,
      notes: notesRaw ? notesRaw : null,
    },
  };
}

export async function createCampaign(
  _prevState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const { errors, data } = parseCampaignForm(formData);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  await prisma.campaign.create({
    data: {
      name: data.name,
      channel: data.channel!,
      status: data.status!,
      scheduledDate: data.scheduledDate!,
      contentDraftId: data.contentDraftId,
      notes: data.notes,
    },
  });

  revalidatePath("/campaign");
  redirect("/campaign");
}

export async function updateCampaign(
  id: string,
  _prevState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const { errors, data } = parseCampaignForm(formData);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    await prisma.campaign.update({
      where: { id },
      data: {
        name: data.name,
        channel: data.channel!,
        status: data.status!,
        scheduledDate: data.scheduledDate!,
        contentDraftId: data.contentDraftId,
        notes: data.notes,
      },
    });
  } catch {
    return {
      errors: {},
      submitError: "캠페인을 저장하는 중 오류가 발생했습니다.",
    };
  }

  revalidatePath("/campaign");
  revalidatePath(`/campaign/${id}/edit`);
  redirect("/campaign");
}

export async function deleteCampaign(id: string): Promise<void> {
  await prisma.campaign.delete({ where: { id } });
  revalidatePath("/campaign");
}

export async function updateCampaignStatus(
  id: string,
  status: string,
): Promise<void> {
  if (!isCampaignStatus(status)) return;
  await prisma.campaign.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/campaign");
}
