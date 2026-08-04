import { getReportSummary } from "@/lib/report";
import StatCard from "./StatCard";
import DateRangeFilter from "./DateRangeFilter";
import RecentActivityList from "./RecentActivityList";
import StatusDonutChart from "./charts/StatusDonutChart";
import StatusBarChart from "./charts/StatusBarChart";
import { PageHeader } from "@/components/ui/PageHeader";

// 리포트 대시보드: 콘텐츠·캠페인 데이터를 상태/채널/타입별로 집계해
// 요약 통계와 차트로 보여준다. 모든 집계는 서버 컴포넌트에서 Prisma
// groupBy/count로 직접 계산하며(전체 기간 기준, MVP는 기간 필터 미지원),
// 클라이언트 차트 컴포넌트에는 계산된 결과만 props로 전달한다.
export default async function ReportPage() {
  const summary = await getReportSummary();

  return (
    <div className="space-y-8">
      <PageHeader
        title="리포트"
        description="콘텐츠와 캠페인 현황을 한눈에 확인하세요. (전체 기간 기준 집계)"
        action={<DateRangeFilter />}
      />

      {/* 요약 통계 카드 */}
      <section
        aria-label="요약 통계"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="전체 콘텐츠 수"
          value={summary.totalContentCount}
          accent="#2563eb"
        />
        <StatCard
          label="전체 캠페인 수"
          value={summary.totalCampaignCount}
          accent="#9333ea"
        />
        <StatCard
          label="발행된 콘텐츠 수"
          value={summary.publishedContentCount}
          accent="#16a34a"
        />
        <StatCard
          label="진행중 캠페인 수"
          value={summary.activeCampaignCount}
          accent="#059669"
        />
      </section>

      {/* 차트 */}
      <section
        aria-label="집계 차트"
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <StatusDonutChart
          title="콘텐츠 상태별 현황"
          data={summary.contentByStatus}
        />
        <StatusBarChart
          title="콘텐츠 타입별 현황"
          data={summary.contentByType}
        />
        <StatusBarChart
          title="캠페인 상태별 현황"
          data={summary.campaignByStatus}
        />
        <StatusDonutChart
          title="캠페인 채널별 현황"
          data={summary.campaignByChannel}
        />
      </section>

      {/* 최근 활동 */}
      <section aria-label="최근 활동" className="space-y-3">
        <h2 className="text-lg font-semibold">최근 활동</h2>
        <RecentActivityList items={summary.recentActivity} />
      </section>
    </div>
  );
}
