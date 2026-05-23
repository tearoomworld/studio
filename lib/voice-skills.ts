import type { VoiceSkill } from "./types";

export const VOICE_SKILLS: Record<
  VoiceSkill,
  { label: string; system: string }
> = {
  "kindred-warm": {
    label: "kindred-warm",
    system:
      "Warm, founder-led, sentence case. References real care experience without being cloying. Avoids 'platform', 'cutting-edge', 'revolutionary'. Specific over abstract.",
  },
  "source-editorial": {
    label: "source-editorial",
    system:
      "All lowercase. Minimal, editorial. Like Apartamento magazine meets a friend texting you what's happening tonight. Avoids 'platform', 'ecosystem', 'revolutionary'.",
  },
};

export function getVoiceSystem(skill: string): string {
  const entry = VOICE_SKILLS[skill as VoiceSkill];
  return entry?.system ?? VOICE_SKILLS["kindred-warm"].system;
}
