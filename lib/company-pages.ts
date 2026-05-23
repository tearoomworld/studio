import type { SupabaseClient } from "@supabase/supabase-js";
import type { PortalTab } from "./portal-tabs";
import { tabKeyForLabel } from "./portal-tabs";

export const PAGE_KINDS = [
  "website",
  "product",
  "deck",
  "pitch",
  "portal",
] as const;

export type PageKind = (typeof PAGE_KINDS)[number];

export const UPLOADABLE_KINDS = ["website", "product", "deck", "pitch"] as const;
export type UploadableKind = (typeof UPLOADABLE_KINDS)[number];

const LABEL_TO_KIND: Record<string, UploadableKind> = {
  website: "website",
  web: "website",
  product: "product",
  demo: "product",
  mobile: "product",
  pitch: "pitch",
  deck: "deck",
};

export function isUploadableKind(kind: string): kind is UploadableKind {
  return (UPLOADABLE_KINDS as readonly string[]).includes(kind);
}

/** Map portal tab key → DB kind for HTML replace */
export function tabKeyToKind(
  tab: string,
  slug: string,
  brand?: Record<string, unknown> | null,
  tabs?: PortalTab[],
): UploadableKind | null {
  if (tab === "build") return null;
  const list = tabs ?? [];
  const match = list.find(
    (t, i) => i > 0 && tabKeyForLabel(t.label) === tab,
  );
  if (!match) return null;
  const key = match.label.toLowerCase().trim();
  return LABEL_TO_KIND[key] ?? null;
}

export function kindLabel(kind: UploadableKind): string {
  const labels: Record<UploadableKind, string> = {
    website: "Website",
    product: "Product mock",
    pitch: "Pitch",
    deck: "Deck",
  };
  return labels[kind];
}

export function apiPageUrl(slug: string, kind: UploadableKind) {
  return `/api/company-pages/${slug}/${kind}`;
}

/** Prefer custom HTML in DB over static / public mocks */
export async function resolveAssetIframeSrc(
  supabase: SupabaseClient,
  companyId: string,
  slug: string,
  tab: string,
  defaultSrc: string | null,
  brand?: Record<string, unknown> | null,
  tabs?: PortalTab[],
): Promise<{ src: string | null; kind: UploadableKind | null }> {
  const kind = tabKeyToKind(tab, slug, brand, tabs);
  if (!kind) return { src: defaultSrc, kind: null };

  const { data: row } = await supabase
    .from("company_pages")
    .select("id")
    .eq("company_id", companyId)
    .eq("kind", kind)
    .maybeSingle();

  if (row) return { src: apiPageUrl(slug, kind), kind };
  return { src: defaultSrc, kind };
}
