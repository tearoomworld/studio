import Anthropic from "@anthropic-ai/sdk";
import { getVoiceSystem } from "./voice-skills";

const MODEL = "claude-sonnet-4-20250514";

function client() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: key });
}

export async function analyzeEmail(input: {
  subject: string;
  body: string;
  prospect_context: string;
  voice_skill: string;
}) {
  const anthropic = client();
  const voice = getVoiceSystem(input.voice_skill);

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: `You analyze cold outbound emails for tactic quality. Brand voice: ${voice}. Respond ONLY with valid JSON.`,
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          subject: input.subject,
          body: input.body,
          prospect_context: input.prospect_context,
        }),
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";
  return JSON.parse(text) as {
    used_tactics: string[];
    suggested_tactics: string[];
    overall_score: number;
    reasoning: string;
  };
}

export async function generateContent(input: {
  prompt: string;
  count: number;
  voice_skill: string;
}) {
  const anthropic = client();
  const voice = getVoiceSystem(input.voice_skill);

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: `You generate social/content ideas. Brand voice: ${voice}. Respond ONLY with valid JSON: {"ideas":[{"title","body","format","channel"}]}. Generate exactly ${input.count} ideas.`,
    messages: [{ role: "user", content: input.prompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";
  return JSON.parse(text) as {
    ideas: { title: string; body: string; format: string; channel: string }[];
  };
}
