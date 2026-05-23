import { embedPortalUrl } from "./embed-url";

export type PortalTab = { label: string; src: string; pane?: string; eager?: boolean };

/** Build / Audit / Agents always use Studio shell — never per-company portal HTML. */
export const STUDIO_PORTAL_PATH = "/studio-portal.html";

export const STUDIO_CORE_TABS: PortalTab[] = [
  { label: "Build", src: embedPortalUrl(STUDIO_PORTAL_PATH, "buildplan") },
  { label: "Audit", src: embedPortalUrl(STUDIO_PORTAL_PATH, "audit"), pane: "audit" },
  { label: "Agents", src: embedPortalUrl(STUDIO_PORTAL_PATH, "agents"), pane: "agents" },
];

export const ASSET_TABS: Record<string, PortalTab[]> = {
  kindred: [
    ...STUDIO_CORE_TABS,
    { label: "Deck", src: "/kindred-deck.html" },
    { label: "Pitch", src: "/pitch.html" },
    { label: "Demo", src: "/demo.html", eager: true },
    { label: "Website", src: "/website.html" },
  ],
  source: [
    ...STUDIO_CORE_TABS,
    { label: "Deck", src: "/source-deck.html" },
    { label: "Pitch", src: "/source-pitch.html" },
    { label: "Web", src: "/source-web.html", eager: true },
    { label: "Mobile", src: "/source-mobile.html", eager: true },
  ],
};

export function tabKeyForLabel(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

export function getAssetTabs(
  slug: string,
  brand?: Record<string, unknown> | null,
): PortalTab[] {
  const generated = brand?.generated_tabs as PortalTab[] | undefined;
  if (generated?.length) {
    return [...STUDIO_CORE_TABS, ...generated];
  }
  return ASSET_TABS[slug] ?? [...STUDIO_CORE_TABS];
}

export function getPortalTabSrc(
  slug: string,
  tab: string,
  brand?: Record<string, unknown> | null,
): string | null {
  const tabs = getAssetTabs(slug, brand);
  if (tab === "build") {
    const src = tabs[0]?.src;
    return src ? src : null;
  }
  const match = tabs.find(
    (t, i) => i > 0 && tabKeyForLabel(t.label) === tab,
  );
  return match?.src || null;
}

export function isEagerTab(
  slug: string,
  tab: string,
  brand?: Record<string, unknown> | null,
): boolean {
  const tabs = getAssetTabs(slug, brand);
  if (!tabs || tab === "build") return false;
  const match = tabs.find(
    (t, i) => i > 0 && tabKeyForLabel(t.label) === tab,
  );
  return !!match?.eager;
}
