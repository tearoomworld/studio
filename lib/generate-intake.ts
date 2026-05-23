import Anthropic from "@anthropic-ai/sdk";
import type { IntakeAnswers, IntakeMessage } from "./generate-intake-types";

const MODEL = "claude-sonnet-4-20250514";

function client() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: key });
}

function parseJson(text: string) {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1].trim() : trimmed;
  return JSON.parse(raw) as Record<string, unknown>;
}

export async function runIntakeTurn(input: {
  answers: Partial<IntakeAnswers>;
  messages: IntakeMessage[];
  userMessage?: string;
}) {
  const anthropic = client();
  const system = `You are the Studio intake guide for Ayesha, a solo founder in Atlanta building companies like Kindred and Source.

Your job: review her answers so far, ask ONE sharp follow-up at a time if anything is vague, and help her get ready to generate a full asset suite (build plan, website HTML, product mock HTML, deck, pitch).

Rules:
- Warm, concise, founder-to-founder tone — not corporate
- If idea, motion, aesthetic, features list, or wedge are thin, ask a specific question
- When enough context exists, set ready_to_generate true and summarize what you'll build
- You may suggest small edits via patch fields (only include keys you're improving)
- Never invent a company name unless suggesting a working title
- Features/app list is critical — push for 4-8 concrete screens or user flows for the product mock

Respond ONLY with JSON:
{
  "reply": "markdown string shown to user",
  "ready_to_generate": boolean,
  "patch": { "idea"?: string, "aesthetic"?: string, "features"?: string, "wedge"?: string }
}`;

  const context = {
    answers: input.answers,
    conversation: input.messages,
    latest_user_message: input.userMessage ?? null,
  };

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system,
    messages: [{ role: "user", content: JSON.stringify(context) }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";
  const data = parseJson(text);

  return {
    reply: String(data.reply ?? ""),
    ready_to_generate: Boolean(data.ready_to_generate),
    patch: (data.patch ?? {}) as Partial<IntakeAnswers>,
  };
}
