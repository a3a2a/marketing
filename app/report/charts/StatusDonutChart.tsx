"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ChartDatum } from "@/lib/report";
import ChartCard, { ChartEmptyState } from "./ChartCard";
import { useIsDarkMode } from "@/components/ui/useIsDarkMode";

// 도넛(파이) 차트: 상태처럼 "전체 대비 비중"을 보여주는 데 적합.
// 색상만으로 항목을 구분하지 않도록 범례 + 툴크(값/비율) + 조각 라벨을 함께 노출한다.
export default function StatusDonutChart({
  title,
  data,
}: {
  title: string;
  data: ChartDatum[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const isDark = useIsDarkMode();
  const labelColor = isDark ? "#e4e4e7" : "#3f3f46";
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
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={data.length > 1 ? 2 : 0}
                label={({ x, y, textAnchor, name, value, percent }) =>
                  value > 0 ? (
                    <text
                      x={x}
                      y={y}
                      textAnchor={textAnchor}
                      dominantBaseline="central"
                      fontSize={12}
                      fill={labelColor}
                    >
                      {`${name} ${Math.round((percent ?? 0) * 100)}%`}
                    </text>
                  ) : (
                    <></>
                  )
                }
                labelLine={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value}건`, name]}
                contentStyle={tooltipStyle}
              />
              <Legend
                verticalAlign="bottom"
                height={32}
                wrapperStyle={{ fontSize: 12, color: labelColor }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
