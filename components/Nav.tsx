"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/login/actions";

// Nav items live here (not in app/layout.tsx) so feature-building agents can
// add pages under each module route without ever touching the shared layout.
const navItems: { label: string; href: string }[] = [
  { label: "홈", href: "/" },
  { label: "콘텐츠", href: "/content" },
  { label: "캠페인", href: "/campaign" },
  { label: "리포트", href: "/report" },
];

// Must match auth/session.ts's DISPLAY_COOKIE_NAME. Kept as a local literal
// (rather than importing that module) so this client component never pulls
// in any session-signing code — it only ever reads this plain display value.
const DISPLAY_COOKIE_NAME = "session_user";

function readDisplayEmail(): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${DISPLAY_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.slice(DISPLAY_COOKIE_NAME.length + 1)) : null;
}

export default function Nav() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setUserEmail(readDisplayEmail());
  }, [pathname]);

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

        {userEmail && (
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-black/60 sm:inline dark:text-white/60">
              {userEmail}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              >
                로그아웃
              </button>
            </form>
          </div>
        )}
      </nav>
    </header>
  );
}
