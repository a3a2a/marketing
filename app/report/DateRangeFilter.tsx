// MVP 범위: 전체 기간 집계만 지원한다.
// 향후 기간별 필터링을 위한 자리표시자 컨트롤 — 현재는 비활성화 상태로만 노출한다.
export default function DateRangeFilter() {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-black/15 bg-black/[0.02] px-3 py-2 text-sm text-black/40 dark:border-white/15 dark:bg-white/[0.03] dark:text-white/40"
      title="추후 지원 예정 기능입니다."
    >
      <span aria-hidden>📅</span>
      <select
        disabled
        aria-label="기간 필터 (준비 중)"
        className="cursor-not-allowed rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm disabled:opacity-60 dark:border-white/10"
        defaultValue="all"
      >
        <option value="all">전체 기간</option>
      </select>
      <span className="text-xs">기간별 필터는 추후 지원 예정입니다</span>
    </div>
  );
}
