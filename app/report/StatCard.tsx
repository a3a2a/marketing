import { Card } from "@/components/ui/Card";

export default function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        <p className="text-sm text-black/60 dark:text-white/60">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums">
        {value.toLocaleString("ko-KR")}
        <span className="ml-1 text-base font-normal text-black/50 dark:text-white/50">
          건
        </span>
      </p>
    </Card>
  );
}
