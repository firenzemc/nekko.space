"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "总览", icon: "🏝️" },
  { href: "/map", label: "地图", icon: "🗺️" },
  { href: "/villagers", label: "村民", icon: "👥" },
  { href: "/mailbox", label: "信箱", icon: "✉️" },
  { href: "/newspaper", label: "岛报", icon: "📰" },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors ${
                active
                  ? "text-[var(--accent)] font-semibold"
                  : "opacity-60 hover:opacity-90"
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
