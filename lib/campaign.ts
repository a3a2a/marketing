import {
  CampaignChannel,
  CampaignStatus,
  ContentStatus,
  ContentType,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Labels (Korean) & badge styling for enums used by the 캠페인 관리 module.
// ---------------------------------------------------------------------------

export const CHANNEL_LABELS: Record<CampaignChannel, string> = {
  BLOG: "블로그",
  SNS: "SNS",
  EMAIL: "이메일",
  ETC: "기타",
};

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: "초안",
  SCHEDULED: "예약됨",
  ACTIVE: "진행중",
  COMPLETED: "완료",
  PAUSED: "중지",
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  BLOG: "블로그",
  SNS: "SNS",
  EMAIL: "이메일",
};

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: "초안",
  PUBLISHED: "발행됨",
};

export const CHANNEL_OPTIONS = Object.keys(CHANNEL_LABELS) as CampaignChannel[];
export const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as CampaignStatus[];

// Ordered progression used to render the quick status-change control.
export const STATUS_FLOW: CampaignStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "COMPLETED",
  "PAUSED",
];

// Color recipe (bg-{color}-100/text-{color}-700 light, bg-{color}-500/15
// text-{color}-300 dark) is shared with app/content/Badges.tsx so the same
// concept (e.g. "블로그") always reads as the same color in every module.
export const CHANNEL_BADGE_CLASSES: Record<CampaignChannel, string> = {
  BLOG: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  SNS: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  EMAIL: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  ETC: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/70",
};

export const STATUS_BADGE_CLASSES: Record<CampaignStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/70",
  SCHEDULED:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  ACTIVE:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  PAUSED: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export const CONTENT_TYPE_BADGE_CLASSES: Record<ContentType, string> = {
  BLOG: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  SNS: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  EMAIL: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

export const CONTENT_STATUS_BADGE_CLASSES: Record<ContentStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/70",
  PUBLISHED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
};

export function isCampaignChannel(value: string): value is CampaignChannel {
  return (CHANNEL_OPTIONS as string[]).includes(value);
}

export function isCampaignStatus(value: string): value is CampaignStatus {
  return (STATUS_OPTIONS as string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Data access
// ---------------------------------------------------------------------------

export type CampaignWithContent = Prisma.CampaignGetPayload<{
  include: { contentDraft: true };
}>;

export type CampaignListFilter = {
  channel?: CampaignChannel;
  status?: CampaignStatus;
  sort?: "asc" | "desc";
};

export async function listCampaigns(
  filter: CampaignListFilter,
): Promise<CampaignWithContent[]> {
  const where: Prisma.CampaignWhereInput = {};
  if (filter.channel) where.channel = filter.channel;
  if (filter.status) where.status = filter.status;

  return prisma.campaign.findMany({
    where,
    include: { contentDraft: true },
    orderBy: { scheduledDate: filter.sort === "desc" ? "desc" : "asc" },
  });
}

export async function countAllCampaigns(): Promise<number> {
  return prisma.campaign.count();
}

export async function getCampaignById(
  id: string,
): Promise<CampaignWithContent | null> {
  return prisma.campaign.findUnique({
    where: { id },
    include: { contentDraft: true },
  });
}

export type ContentDraftOption = {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
};

export async function listContentDraftOptions(): Promise<ContentDraftOption[]> {
  return prisma.contentDraft.findMany({
    select: { id: true, title: true, type: true, status: true },
    orderBy: { createdAt: "desc" },
  });
}
