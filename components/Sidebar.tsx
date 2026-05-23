"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Companies", icon: "◉" },
  { href: "/calendar", label: "Calendar", icon: "▦" },
  { href: "/operations", label: "Operations", icon: "▣" },
  { href: "/ledger", label: "Ledger", icon: "≡" },
  { href: "/generate", label: "Generate new", icon: "+", group: "Plan" },
  { href: "/settings", label: "Settings", icon: "⚙", group: "System" },
];

export function Sidebar() {
  const pathname = usePathname();
  let lastGroup: string | undefined;

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-black/5 bg-soft-bg px-3 py-5">
      <div className="mb-4 border-b border-black/5 px-2 pb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-semibold text-white">
            S
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-ink">
              Studio
            </div>
            <div className="text-[11px] text-ink/50">Solo founder</div>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map((item) => {
          const groupLabel =
            item.group && item.group !== lastGroup ? (
              (lastGroup = item.group),
              (
                <div
                  key={`g-${item.group}`}
                  className="mt-3 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink/45"
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
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors ${
                  active
                    ? "bg-black/[0.06] text-ink"
                    : "text-ink/80 hover:bg-black/[0.04]"
                }`}
              >
                <span className="w-4 text-center text-[13px] text-ink/45">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <form action="/auth/sign-out" method="post" className="mt-auto border-t border-black/5 pt-4">
        <button
          type="submit"
          className="w-full rounded-lg px-2.5 py-2 text-left text-[12px] text-ink/50 hover:bg-black/[0.04]"
        >
          Sign out
        </button>
      </form>
    </aside>
  );
}
