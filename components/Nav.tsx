"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Nav items live here (not in app/layout.tsx) so feature-building agents can
// add pages under each module route without ever touching the shared layout.
const navItems: { label: string; href: string }[] = [
  { label: "홈", href: "/" },
  { label: "콘텐츠", href: "/content" },
  { label: "캠페인", href: "/campaign" },
  { label: "리포트", href: "/report" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-black/10 bg-white dark:border-white/10 dark:bg-black">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3 sm:gap-2">
        <span className="mr-4 shrink-0 text-lg font-semibold tracking-tight">
          Marketing Studio
        </span>
        <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-black/70 hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
