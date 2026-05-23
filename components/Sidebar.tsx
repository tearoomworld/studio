"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Prototypes", icon: "◉" },
  { href: "/calendar", label: "Calendar", icon: "▦" },
  { href: "/operations", label: "Operations", icon: "▣" },
  { href: "/ledger", label: "Ledger", icon: "≡" },
  { href: "/generate", label: "Generate new", icon: "+", group: "Plan" },
  { href: "/settings", label: "Settings", icon: "⚙", group: "System" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [today, setToday] = useState("");
  let lastGroup: string | undefined;

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    );
  }, []);

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-black/[0.08] bg-cream-deep px-3.5 py-5">
      <div className="mb-4 border-b border-black/[0.08] px-2 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-ink text-sm font-semibold text-white shadow-sm">
            S
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-coral ring-2 ring-cream-deep" />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-ink">
              Studio
            </div>
            <div className="text-[11px] text-ink/50">{today || "—"}</div>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const groupLabel =
            item.group && item.group !== lastGroup ? (
              (lastGroup = item.group),
              (
                <div
                  key={`g-${item.group}`}
                  className="mt-4 px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink/40"
                >
                  {item.group}
                </div>
              )
            ) : null;
          if (item.group) lastGroup = item.group;

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <div key={item.href}>
              {groupLabel}
              <Link
                href={item.href}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13.5px] font-medium transition-all duration-300 ease-out ${
                  active
                    ? "bg-coral-soft text-coral-deep shadow-sm"
                    : "text-ink/75 hover:bg-white/60 hover:text-ink"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-[13px] transition-colors ${
                    active
                      ? "bg-white/80 text-coral-deep"
                      : "bg-white/40 text-ink/45"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-black/[0.08] px-2 pt-4 text-[11px] leading-relaxed text-ink/50">
        <strong className="text-ink/70">Solo founder · Atlanta</strong>
        <br />
        Live on Supabase + Vercel.
      </div>

      <form action="/auth/sign-out" method="post" className="mt-3 px-2">
        <button
          type="submit"
          className="w-full rounded-xl px-2.5 py-2 text-left text-[12px] text-ink/50 transition-colors hover:bg-white/60"
        >
          Sign out
        </button>
      </form>
    </aside>
  );
}
