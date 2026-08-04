import Link from "next/link";

const modules = [
  {
    key: "content",
    name: "콘텐츠 생성",
    href: "/content",
    description: "블로그, SNS, 이메일 초안을 빠르게 만들고 관리합니다.",
  },
  {
    key: "campaign",
    name: "캠페인 관리",
    href: "/campaign",
    description: "채널별 캠페인 일정과 진행 상태를 관리합니다.",
  },
  {
    key: "report",
    name: "리포트",
    href: "/report",
    description: "콘텐츠와 캠페인 현황을 한눈에 확인합니다.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Marketing Studio
        </h1>
        <p className="max-w-2xl text-base leading-7 text-black/70 dark:text-white/70">
          중소규모 마케팅 팀을 위한 올인원 도구입니다. 콘텐츠 초안 생성,
          캠페인 일정 관리, 성과 리포트까지 외부 서비스나 API 키 없이
          로컬에서 바로 실행됩니다.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {modules.map((mod) => (
          <Link
            key={mod.key}
            href={mod.href}
            className="flex flex-col gap-2 rounded-lg border border-black/10 bg-white p-5 transition-colors hover:border-black/30 hover:bg-black/[.02] dark:border-white/10 dark:bg-black dark:hover:border-white/30 dark:hover:bg-white/[.04]"
          >
            <h2 className="text-lg font-medium">{mod.name}</h2>
            <p className="text-sm text-black/60 dark:text-white/60">
              {mod.description}
            </p>
            <span className="mt-2 text-sm font-medium text-black/80 dark:text-white/80">
              바로가기 →
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
