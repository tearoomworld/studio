import Anthropic from "@anthropic-ai/sdk";
import { getVoiceSystem } from "./voice-skills";

const MODEL = "claude-sonnet-4-20250514";

function client() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: key });
}

export function parseJsonFromClaude(text: string) {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1].trim() : trimmed;
  return JSON.parse(raw) as Record<string, unknown>;
}

async function claudeJson(system: string, user: string) {
  const anthropic = client();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });
  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";
  return parseJsonFromClaude(text);
}

export async function analyzeEmail(input: {
  subject: string;
  body: string;
  prospect_context: string;
  voice_skill: string;
}) {
  const voice = getVoiceSystem(input.voice_skill);
  return claudeJson(
    `You analyze cold outbound emails for tactic quality. Brand voice: ${voice}. Respond ONLY with valid JSON: {"used_tactics":[],"suggested_tactics":[],"overall_score":number,"reasoning":string}`,
    JSON.stringify({
      subject: input.subject,
      body: input.body,
      prospect_context: input.prospect_context,
    }),
  ) as Promise<{
    used_tactics: string[];
    suggested_tactics: string[];
    overall_score: number;
    reasoning: string;
  }>;
}

export async function generateContent(input: {
  prompt: string;
  count: number;
  voice_skill: string;
}) {
  const voice = getVoiceSystem(input.voice_skill);
  return claudeJson(
    `You generate social/content ideas. Brand voice: ${voice}. Respond ONLY with valid JSON: {"ideas":[{"title","body","format","channel"}]}. Generate exactly ${input.count} ideas.`,
    input.prompt,
  ) as Promise<{
    ideas: { title: string; body: string; format: string; channel: string }[];
  }>;
}

export async function researchLeads(input: {
  query: string;
  icp: string;
  voice_skill: string;
  count?: number;
}) {
  const voice = getVoiceSystem(input.voice_skill);
  const n = input.count ?? 8;
  return claudeJson(
    `You help a solo founder find B2B sales prospects. Brand voice context: ${voice}. Use real-sounding community/business names plausible for the query. Do not invent email addresses — leave contact_email null if unknown. Respond ONLY with JSON: {"leads":[{"name","location","contact_name","contact_email","fit_score":number,"notes","recommended_angle"}]}. Return ${n} leads ranked by fit_score descending.`,
    JSON.stringify({ query: input.query, icp: input.icp }),
  ) as Promise<{
    leads: {
      name: string;
      location: string;
      contact_name: string | null;
      contact_email: string | null;
      fit_score: number;
      notes: string;
      recommended_angle: string;
    }[];
  }>;
}

export async function rankProspects(input: {
  prospects: { id: string; name: string; notes: string | null; status: string }[];
  icp: string;
  voice_skill: string;
}) {
  const voice = getVoiceSystem(input.voice_skill);
  return claudeJson(
    `Rank sales prospects by outreach priority for this ICP. Brand voice: ${voice}. Respond ONLY with JSON: {"ranked":[{"id","fit_score":number,"priority":"high"|"medium"|"low","reason"}]}`,
    JSON.stringify(input),
  ) as Promise<{
    ranked: {
      id: string;
      fit_score: number;
      priority: "high" | "medium" | "low";
      reason: string;
    }[];
  }>;
}

export async function generateEmail(input: {
  prospect_name: string;
  prospect_context: string;
  template_subject?: string;
  template_body?: string;
  voice_skill: string;
}) {
  const voice = getVoiceSystem(input.voice_skill);
  return claudeJson(
    `Write a cold outbound email for a solo founder. Brand voice: ${voice}. Founder is Ayesha — GT engineering+design, ex-tech, Atlanta, grandmother caretaker story for Kindred-style companies. Respond ONLY with JSON: {"subject","body","used_tactics":[]}`,
    JSON.stringify(input),
  ) as Promise<{
    subject: string;
    body: string;
    used_tactics: string[];
  }>;
}

export type GeneratedCompany = {
  slug: string;
  name: string;
  tagline: string;
  motion: string;
  voice_skill: string;
  estimated_weeks: number;
  brand: Record<string, unknown>;
  phases: {
    title: string;
    icon: string;
    description: string;
    tasks: { text: string; tag?: string }[];
  }[];
  team: {
    slug: string;
    name: string;
    kind: string;
    description: string;
  };
};

export async function generateCompanySpec(input: {
  idea: string;
  motion: string;
  aesthetic: string;
  features: string;
  v2: string;
  wedge: string;
  intake_summary?: string;
}) {
  return claudeJson(
    `You design a new company hub for a solo founder's Studio dashboard (like Kindred or Source). Respond ONLY with valid JSON matching this schema:
{"slug","name","tagline","motion","voice_skill","estimated_weeks":number,"brand":{},"phases":[{"title","icon","description","tasks":[{"text","tag"}]}],"team":{"slug","name","kind","description"}}
Rules:
- slug: lowercase, no spaces, unique-ish (2-12 chars)
- motion: sprint|marathon|paid|partnerships
- voice_skill: invent a kebab-case skill id + store human description in brand.voice_description
- brand.features_list: copy of app/features for portal
- exactly 8 phases, each with 8-12 tasks; phase 1 should mention generating HTML mocks from features list
- team.kind: sales for sprint/paid/partnerships, marketing for marathon
- tasks should be copy-paste Claude Code prompts where tag=agent, otherwise tag=must|should
- honest, specific to the idea — no generic SaaS`,
    JSON.stringify(input),
  ) as Promise<GeneratedCompany>;
}
