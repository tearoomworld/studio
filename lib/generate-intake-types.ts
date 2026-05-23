export type IntakeAnswers = {
  idea: string;
  motion: string;
  aesthetic: string;
  features: string;
  v2: string;
  wedge: string;
  moodboard_count: number;
};

export type IntakeMessage = {
  role: "user" | "assistant";
  content: string;
};

export const GTM_OPTIONS = [
  {
    id: "sprint",
    title: "Outbound · sprint",
    desc: "Defined buyer, one-by-one outreach. Pipeline, Compose, Demos.",
  },
  {
    id: "marathon",
    title: "Content + presence · marathon",
    desc: "IG/TikTok, in-person, word of mouth. Content calendar, field log.",
  },
  {
    id: "paid",
    title: "Paid acquisition · ads",
    desc: "Scaled paid channels. Creative library, funnel analytics.",
  },
  {
    id: "partnerships",
    title: "Partnerships · B2B2C",
    desc: "One partner → many customers. Partner pipeline, co-marketing.",
  },
] as const;
