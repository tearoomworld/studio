import Anthropic from "@anthropic-ai/sdk";
import type { GeneratedCompany } from "./anthropic";

const MODEL = "claude-sonnet-4-20250514";

export type PageKind = "website" | "product" | "deck" | "pitch";

const PAGE_PROMPTS: Record<PageKind, string> = {
  website: `Generate a complete single-file marketing website HTML (no external CSS files).
Include: hero, 3 feature sections, social proof strip, pricing or pilot CTA, FAQ, footer.
Use inline <style> only. Mobile-responsive. Match the aesthetic exactly.`,
  product: `Generate a complete single-file interactive product mock HTML (no React build).
Include 4-6 clickable "screens" (use simple JS to show/hide sections) reflecting the app & feature list.
Director/dashboard style UI. Inline CSS + minimal vanilla JS. Match aesthetic.`,
  deck: `Generate a complete single-file pitch deck HTML with 8-10 slides.
Use scroll-snap or slide sections. Large typography. Investor narrative. Inline CSS only.`,
  pitch: `Generate a complete single-file short pitch HTML (5-6 slides).
Tighter than full deck. Hook, problem, solution, traction path, ask. Inline CSS only.`,
};

function client() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: key });
}

export async function generateHtmlPage(
  kind: PageKind,
  brief: {
    name: string;
    slug: string;
    tagline: string;
    idea: string;
    aesthetic: string;
    features: string;
    motion: string;
    wedge: string;
    v2: string;
    moodboard_note: string;
  },
): Promise<string> {
  const anthropic = client();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: `You output ONLY raw HTML starting with <!DOCTYPE html>. No markdown fences. No explanation.
${PAGE_PROMPTS[kind]}
Reference quality: polished like Kindred/Source studio mocks — generous whitespace, distinctive typography, not generic AI slop.
Avoid purple gradients on text. Use semantic HTML.`,
    messages: [
      {
        role: "user",
        content: JSON.stringify(brief),
      },
    ],
  });

  let text = message.content[0].type === "text" ? message.content[0].text : "";
  text = text.trim();
  const fence = text.match(/```(?:html)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  if (!text.toLowerCase().startsWith("<!doctype") && !text.startsWith("<html")) {
    text = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>${brief.name}</title></head><body><pre>${text.slice(0, 2000)}</pre></body></html>`;
  }
  return text;
}

export async function generateAllPages(
  spec: GeneratedCompany,
  intake: {
    idea: string;
    aesthetic: string;
    features: string;
    wedge: string;
    v2: string;
    moodboard_note: string;
  },
): Promise<Record<PageKind, string>> {
  const brief = {
    name: spec.name,
    slug: spec.slug,
    tagline: spec.tagline,
    idea: intake.idea,
    aesthetic: intake.aesthetic,
    features: intake.features,
    motion: spec.motion,
    wedge: intake.wedge,
    v2: intake.v2,
    moodboard_note: intake.moodboard_note,
  };

  const kinds: PageKind[] = ["website", "product", "pitch", "deck"];
  const entries = await Promise.all(
    kinds.map(async (kind) => [kind, await generateHtmlPage(kind, brief)] as const),
  );
  return Object.fromEntries(entries) as Record<PageKind, string>;
}

/** Asset tabs only — Build/Audit/Agents come from STUDIO_CORE_TABS in portal-tabs.ts */
export function portalTabsFromPages(slug: string) {
  return [
    { label: "Website", kind: "website" as const },
    { label: "Product", kind: "product" as const },
    { label: "Pitch", kind: "pitch" as const },
    { label: "Deck", kind: "deck" as const },
  ].map((t) => ({
    label: t.label,
    src: `/api/company-pages/${slug}/${t.kind}`,
    eager: t.kind === "product",
  }));
}
