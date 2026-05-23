"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ASSET_TABS: Record<string, { label: string; src: string; eager?: boolean }[]> =
  {
    kindred: [
      { label: "Build", src: "" },
      { label: "Audit", src: "/kindred-portal.html#audit" },
      { label: "Agents", src: "/kindred-portal.html#agents" },
      { label: "Deck", src: "/kindred-deck.html" },
      { label: "Pitch", src: "/pitch.html" },
      { label: "Demo", src: "/demo.html" },
      { label: "Website", src: "/website.html" },
    ],
    source: [
      { label: "Build", src: "" },
      { label: "Audit", src: "/source-portal.html#audit" },
      { label: "Agents", src: "/source-portal.html#agents" },
      { label: "Deck", src: "/source-deck.html" },
      { label: "Pitch", src: "/source-pitch.html" },
      { label: "Web", src: "/source-web.html", eager: true },
      { label: "Mobile", src: "/source-mobile.html", eager: true },
    ],
  };

export function PortalSidebar({
  slug,
  name,
  logo,
}: {
  slug: string;
  name: string;
  logo: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "build";
  const tabs = ASSET_TABS[slug] ?? ASSET_TABS.kindred;

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
          const tabKey =
            i === 0
              ? "build"
              : t.label.toLowerCase().replace(/\s+/g, "-");
          const href =
            i === 0 ? `/${slug}` : `/${slug}?tab=${tabKey}`;
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

export function getPortalTabSrc(slug: string, tab: string): string | null {
  const tabs = ASSET_TABS[slug];
  if (!tabs) return null;
  if (tab === "build") return null;
  const match = tabs.find(
    (t, i) =>
      i > 0 &&
      t.label.toLowerCase().replace(/\s+/g, "-") === tab,
  );
  return match?.src ?? null;
}

export function isEagerTab(slug: string, tab: string): boolean {
  const tabs = ASSET_TABS[slug];
  const match = tabs?.find(
    (t, i) =>
      i > 0 &&
      t.label.toLowerCase().replace(/\s+/g, "-") === tab,
  );
  return !!match?.eager;
}
