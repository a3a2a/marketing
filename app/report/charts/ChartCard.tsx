import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export default function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-black/80 dark:text-white/80">
        {title}
      </h3>
      {children}
    </Card>
  );
}

export function ChartEmptyState() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-black/40 dark:text-white/40">
      표시할 데이터가 없습니다.
    </div>
  );
}
