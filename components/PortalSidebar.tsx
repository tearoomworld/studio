"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAssetTabs, tabKeyForLabel } from "@/lib/portal-tabs";

export function PortalSidebar({
  slug,
  name,
  logo,
  brand,
}: {
  slug: string;
  name: string;
  logo: React.ReactNode;
  brand?: Record<string, unknown> | null;
}) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "build";
  const tabs = getAssetTabs(slug, brand);

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-black/5 bg-soft-bg px-3 py-5">
      <Link
        href="/"
        className="mb-4 px-2 text-[12px] font-medium text-ink/50 hover:text-ink"
      >
        ← Studio
      </Link>
      <div className="mb-6 px-2">{logo}</div>
      <nav className="flex flex-col gap-0.5">
        {tabs.map((t, i) => {
          const tabKey = i === 0 ? "build" : tabKeyForLabel(t.label);
          const href = i === 0 ? `/${slug}` : `/${slug}?tab=${tabKey}`;
          const active = tab === tabKey || (i === 0 && tab === "build");
          return (
            <Link
              key={tabKey}
              href={href}
              className={`rounded-lg px-2.5 py-2 text-[13px] font-medium ${
                active
                  ? "bg-black/[0.06] text-ink"
                  : "text-ink/70 hover:bg-black/[0.04]"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      <p className="mt-auto px-2 text-[11px] leading-relaxed text-ink/45">
        {name} portal
      </p>
    </aside>
  );
}
