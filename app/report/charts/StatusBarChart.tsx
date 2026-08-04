"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDatum } from "@/lib/report";
import ChartCard, { ChartEmptyState } from "./ChartCard";
import { useIsDarkMode } from "@/components/ui/useIsDarkMode";

// 막대 차트: 항목별 절대 개수를 비교하는 데 적합.
// 각 막대는 값 라벨을 직접 표시해 색상에만 의존하지 않는다.
export default function StatusBarChart({
  title,
  data,
}: {
  title: string;
  data: ChartDatum[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const isDark = useIsDarkMode();
  // Recharts draws raw SVG (no Tailwind dark: support), so the axis/grid/
  // label/tooltip palette is chosen explicitly per theme to stay legible
  // (WCAG AA-ish contrast) against both a white and a near-black background.
  const axisColor = isDark ? "#a1a1aa" : "#52525b"; // zinc-400 / zinc-600
  const gridColor = isDark ? "#71717a" : "#a1a1aa";
  const tooltipStyle = {
    fontSize: 12,
    borderRadius: 8,
    background: isDark ? "#18181b" : "#ffffff",
    border: `1px solid ${isDark ? "#3f3f46" : "#e4e4e7"}`,
    color: isDark ? "#f4f4f5" : "#18181b",
  };

  return (
    <ChartCard title={title}>
      {total === 0 ? (
        <ChartEmptyState />
      ) : (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 16, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridColor}
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: axisColor }}
                axisLine={{ stroke: gridColor, strokeOpacity: 0.6 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                formatter={(value) => [`${value}건`, "건수"]}
                contentStyle={tooltipStyle}
                cursor={{ fill: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56}>
                {data.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{ fontSize: 12, fill: axisColor }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
