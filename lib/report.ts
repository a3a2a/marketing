import type {
  CampaignChannel,
  CampaignStatus,
  ContentStatus,
  ContentType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CHANNEL_LABELS,
  CONTENT_STATUS_LABELS as CAMPAIGN_LIB_CONTENT_STATUS_LABELS,
  CONTENT_TYPE_LABELS as CAMPAIGN_LIB_CONTENT_TYPE_LABELS,
  STATUS_LABELS as CAMPAIGN_STATUS_LABELS,
} from "@/lib/campaign";

// ---------------------------------------------------------------------------
// 리포트 모듈 전용 데이터 집계 헬퍼.
// 색상은 앱 전반의 배지 색상(콘텐츠/캠페인 모듈)과 맞춰 대시보드와 목록 화면의
// 시각적 정체성을 일치시킨다. 각 차트는 범례 + 값 라벨을 함께 표시해
// 색상만으로 구분되지 않도록 한다.
// ---------------------------------------------------------------------------

export type ChartDatum = {
  key: string;
  label: string;
  value: number;
  color: string;
};

const CONTENT_STATUS_ORDER: ContentStatus[] = ["DRAFT", "PUBLISHED"];
const CONTENT_TYPE_ORDER: ContentType[] = ["BLOG", "SNS", "EMAIL"];
const CAMPAIGN_STATUS_ORDER: CampaignStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "COMPLETED",
  "PAUSED",
];
const CAMPAIGN_CHANNEL_ORDER: CampaignChannel[] = [
  "BLOG",
  "SNS",
  "EMAIL",
  "ETC",
];

const CONTENT_STATUS_COLORS: Record<ContentStatus, string> = {
  DRAFT: "#6b7280", // gray — Badges.tsx의 초안 배지와 동일 계열
  PUBLISHED: "#16a34a", // green — Badges.tsx의 발행됨 배지와 동일 계열
};

const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
  BLOG: "#2563eb", // blue
  SNS: "#9333ea", // purple
  EMAIL: "#d97706", // amber
};

const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  DRAFT: "#6b7280", // gray
  SCHEDULED: "#4f46e5", // indigo
  ACTIVE: "#059669", // emerald
  COMPLETED: "#2563eb", // blue
  PAUSED: "#e11d48", // rose
};

const CAMPAIGN_CHANNEL_COLORS: Record<CampaignChannel, string> = {
  BLOG: "#2563eb", // blue — matches CHANNEL_BADGE_CLASSES.BLOG in lib/campaign.ts
  SNS: "#9333ea", // purple — matches CHANNEL_BADGE_CLASSES.SNS
  EMAIL: "#d97706", // amber — matches CHANNEL_BADGE_CLASSES.EMAIL
  ETC: "#6b7280", // gray
};

export type RecentActivityItem = {
  id: string;
  kind: "content" | "campaign";
  title: string;
  statusLabel: string;
  statusColor: string;
  timestamp: string; // ISO string — client components serialize dates as strings
  href: string;
};

export type ReportSummary = {
  totalContentCount: number;
  totalCampaignCount: number;
  publishedContentCount: number;
  activeCampaignCount: number;
  contentByStatus: ChartDatum[];
  contentByType: ChartDatum[];
  campaignByStatus: ChartDatum[];
  campaignByChannel: ChartDatum[];
  recentActivity: RecentActivityItem[];
};

export async function getReportSummary(): Promise<ReportSummary> {
  const [
    totalContentCount,
    totalCampaignCount,
    publishedContentCount,
    activeCampaignCount,
    contentStatusGroups,
    contentTypeGroups,
    campaignStatusGroups,
    campaignChannelGroups,
    recentContent,
    recentCampaigns,
  ] = await Promise.all([
    prisma.contentDraft.count(),
    prisma.campaign.count(),
    prisma.contentDraft.count({ where: { status: "PUBLISHED" } }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.contentDraft.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.contentDraft.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.campaign.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.campaign.groupBy({ by: ["channel"], _count: { _all: true } }),
    prisma.contentDraft.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
    prisma.campaign.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, name: true, status: true, updatedAt: true },
    }),
  ]);

  const contentStatusMap = new Map(
    contentStatusGroups.map((g) => [g.status, g._count._all]),
  );
  const contentTypeMap = new Map(
    contentTypeGroups.map((g) => [g.type, g._count._all]),
  );
  const campaignStatusMap = new Map(
    campaignStatusGroups.map((g) => [g.status, g._count._all]),
  );
  const campaignChannelMap = new Map(
    campaignChannelGroups.map((g) => [g.channel, g._count._all]),
  );

  const contentByStatus: ChartDatum[] = CONTENT_STATUS_ORDER.map((status) => ({
    key: status,
    label: CAMPAIGN_LIB_CONTENT_STATUS_LABELS[status],
    value: contentStatusMap.get(status) ?? 0,
    color: CONTENT_STATUS_COLORS[status],
  }));

  const contentByType: ChartDatum[] = CONTENT_TYPE_ORDER.map((type) => ({
    key: type,
    label: CAMPAIGN_LIB_CONTENT_TYPE_LABELS[type],
    value: contentTypeMap.get(type) ?? 0,
    color: CONTENT_TYPE_COLORS[type],
  }));

  const campaignByStatus: ChartDatum[] = CAMPAIGN_STATUS_ORDER.map(
    (status) => ({
      key: status,
      label: CAMPAIGN_STATUS_LABELS[status],
      value: campaignStatusMap.get(status) ?? 0,
      color: CAMPAIGN_STATUS_COLORS[status],
    }),
  );

  const campaignByChannel: ChartDatum[] = CAMPAIGN_CHANNEL_ORDER.map(
    (channel) => ({
      key: channel,
      label: CHANNEL_LABELS[channel],
      value: campaignChannelMap.get(channel) ?? 0,
      color: CAMPAIGN_CHANNEL_COLORS[channel],
    }),
  );

  const recentActivity: RecentActivityItem[] = [
    ...recentContent.map((c) => ({
      id: c.id,
      kind: "content" as const,
      title: c.title,
      statusLabel: CAMPAIGN_LIB_CONTENT_STATUS_LABELS[c.status],
      statusColor: CONTENT_STATUS_COLORS[c.status],
      timestamp: c.updatedAt.toISOString(),
      href: `/content/${c.id}/edit`,
    })),
    ...recentCampaigns.map((c) => ({
      id: c.id,
      kind: "campaign" as const,
      title: c.name,
      statusLabel: CAMPAIGN_STATUS_LABELS[c.status],
      statusColor: CAMPAIGN_STATUS_COLORS[c.status],
      timestamp: c.updatedAt.toISOString(),
      href: `/campaign/${c.id}/edit`,
    })),
  ]
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, 5);

  return {
    totalContentCount,
    totalCampaignCount,
    publishedContentCount,
    activeCampaignCount,
    contentByStatus,
    contentByType,
    campaignByStatus,
    campaignByChannel,
    recentActivity,
  };
}
