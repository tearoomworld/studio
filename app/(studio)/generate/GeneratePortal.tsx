"use client";

import { Fraunces } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GTM_OPTIONS, type IntakeMessage } from "@/lib/generate-intake-types";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["italic", "normal"],
});

type MoodImage = { id: string; name: string; dataUrl: string };

type StepId =
  | "boot"
  | "idea"
  | "motion"
  | "aesthetic"
  | "features"
  | "v2"
  | "wedge"
  | "refine"
  | "review"
  | "generating";

const STEP_ORDER: StepId[] = [
  "idea",
  "motion",
  "aesthetic",
  "features",
  "v2",
  "wedge",
  "refine",
  "review",
];

const GENERATION_TASKS = [
  "Company + brand voice",
  "8-phase build plan",
  "Operations team",
  "Marketing website HTML",
  "Product mock (from feature list)",
  "Pitch + deck HTML",
  "Portal shell",
];

export function GeneratePortal() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>("boot");
  const [idea, setIdea] = useState("");
  const [motion, setMotion] = useState("sprint");
  const [aesthetic, setAesthetic] = useState("");
  const [features, setFeatures] = useState("");
  const [v2, setV2] = useState("");
  const [wedge, setWedge] = useState("");
  const [images, setImages] = useState<MoodImage[]>([]);
  const [messages, setMessages] = useState<IntakeMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [claudeReply, setClaudeReply] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genProgress, setGenProgress] = useState(0);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step !== "boot") return;
    const t = setTimeout(() => setStep("idea"), 2400);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, claudeReply]);

  function nextStep() {
    const idx = STEP_ORDER.indexOf(step as (typeof STEP_ORDER)[number]);
    if (idx >= 0 && idx < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[idx + 1]);
      if (STEP_ORDER[idx + 1] === "refine") startRefine();
    }
  }

  function prevStep() {
    const idx = STEP_ORDER.indexOf(step as (typeof STEP_ORDER)[number]);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  }

  function onImages(files: FileList | null) {
    if (!files) return;
    Array.from(files).slice(0, 6).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            name: file.name,
            dataUrl: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }

  async function startRefine() {
    setBusy(true);
    setClaudeReply("");
    const res = await fetch("/api/companies/generate/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: answersPayload(),
        messages: [],
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.error) {
      setError(data.error);
      return;
    }
    setClaudeReply(data.reply);
    setReady(Boolean(data.ready_to_generate));
    setMessages([{ role: "assistant", content: data.reply }]);
  }

  async function sendChat(e?: React.FormEvent) {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text && !ready) return;

    const userMsg: IntakeMessage = { role: "user", content: text || "I'm ready to generate." };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setChatInput("");
    setBusy(true);

    const res = await fetch("/api/companies/generate/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: answersPayload(),
        messages: nextMessages,
        userMessage: text,
      }),
    });
    const data = await res.json();
    setBusy(false);

    if (data.error) {
      setError(data.error);
      return;
    }

    if (data.patch?.idea) setIdea(data.patch.idea);
    if (data.patch?.aesthetic) setAesthetic(data.patch.aesthetic);
    if (data.patch?.features) setFeatures(data.patch.features);
    if (data.patch?.wedge) setWedge(data.patch.wedge);

    setClaudeReply(data.reply);
    setReady(Boolean(data.ready_to_generate));
    setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
  }

  function answersPayload() {
    return {
      idea,
      motion,
      aesthetic,
      features,
      v2,
      wedge,
      moodboard_count: images.length,
    };
  }

  async function generate() {
    setStep("generating");
    setError(null);
    setGenProgress(1);

    const tick = setInterval(() => {
      setGenProgress((p) => Math.min(p + 1, GENERATION_TASKS.length));
    }, 4500);

    const res = await fetch("/api/companies/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...answersPayload(),
        messages,
        moodboard_images: images.map(({ name, dataUrl }) => ({
          name,
          data_url: dataUrl.slice(0, 200),
        })),
      }),
    });
    clearInterval(tick);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Generation failed");
      setStep("review");
      return;
    }

    setGenProgress(GENERATION_TASKS.length);
    setTimeout(() => router.push(`/${data.slug}`), 1500);
  }

  const progressIdx = STEP_ORDER.indexOf(step as (typeof STEP_ORDER)[number]);

  return (
    <div className="relative min-h-[72vh] overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#fafbfb]">
      <Ambient />
      <div className="relative z-10 px-8 py-10 md:px-12 md:py-12">
        {step === "boot" && <BootScreen frauncesClass={fraunces.className} />}

        {step !== "boot" && step !== "generating" && (
          <div className="mb-8 flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEP_ORDER.slice(0, 7).map((s, i) => (
                <div
                  key={s}
                  className={`h-1 w-8 rounded-full transition ${
                    i <= progressIdx ? "bg-sage-deep" : "bg-black/10"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] uppercase tracking-wide text-ink/40">
              intake portal
            </span>
          </div>
        )}

        {step === "idea" && (
          <StepShell
            q="What's the company?"
            sub="What it does, who it's for, why it matters. ~6 sentences. Specific beats ambitious."
            onNext={nextStep}
            canNext={idea.trim().length > 40}
          >
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={6}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed"
              placeholder="An events app for Atlanta that helps people find great things happening in their city…"
            />
          </StepShell>
        )}

        {step === "motion" && (
          <StepShell
            q="Go-to-market motion"
            sub="Determines which Operations tabs auto-spawn for this company."
            onNext={nextStep}
            onBack={prevStep}
            canNext
          >
            <div className="space-y-2">
              {GTM_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setMotion(o.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    motion === o.id
                      ? "border-ink bg-white shadow-sm"
                      : "border-black/[0.06] bg-white/60 hover:border-black/15"
                  }`}
                >
                  <strong className="text-sm text-ink">{o.title}</strong>
                  <p className="mt-0.5 text-xs text-ink/55">{o.desc}</p>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === "aesthetic" && (
          <StepShell
            q="Aesthetic + moodboard"
            sub="Palette, typography, feel. Drop 2–4 reference images."
            onNext={nextStep}
            onBack={prevStep}
            canNext={aesthetic.trim().length > 10}
          >
            <textarea
              value={aesthetic}
              onChange={(e) => setAesthetic(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
              placeholder="Warm peach + cream, Fraunces serif headlines, generous whitespace…"
            />
            <div className="mt-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white/80 py-8 transition hover:border-sage-deep hover:bg-sage-soft/20">
                <span className="text-2xl text-ink/30">+</span>
                <span className="mt-1 text-xs font-medium text-ink/50">
                  Add moodboard images
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onImages(e.target.files)}
                />
              </label>
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square overflow-hidden rounded-lg bg-black/5"
                      style={{
                        backgroundImage: `url(${img.dataUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setImages((prev) => prev.filter((x) => x.id !== img.id))
                        }
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </StepShell>
        )}

        {step === "features" && (
          <StepShell
            q="App & feature list"
            sub="Screens, flows, and jobs-to-be-done — this drives the product mock HTML."
            onNext={nextStep}
            onBack={prevStep}
            canNext={features.trim().length > 20}
          >
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={8}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 font-mono text-sm leading-relaxed"
              placeholder={`Home feed — upcoming events near you\nEvent detail — host, venue, ticket CTA\nHost dashboard — create event, ticket sales\nProfile — saved events, following hosts\n…`}
            />
          </StepShell>
        )}

        {step === "v2" && (
          <StepShell
            q="v2 vision (dormant)"
            sub="What ships after v1 traction? Drives audit tab + dormant tables."
            onNext={nextStep}
            onBack={prevStep}
            canNext
          >
            <textarea
              value={v2}
              onChange={(e) => setV2(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
              placeholder="v2 adds attendee accounts, second city expansion…"
            />
          </StepShell>
        )}

        {step === "wedge" && (
          <StepShell
            q="Wedge — why this, why now?"
            sub="One sharp sentence on why incumbents leave room for you."
            onNext={nextStep}
            onBack={prevStep}
            canNext={wedge.trim().length > 5}
          >
            <input
              value={wedge}
              onChange={(e) => setWedge(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
              placeholder="Eventbrite treats events like products; we treat them like culture…"
            />
          </StepShell>
        )}

        {step === "refine" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div>
              <h2
                className={`${fraunces.className} text-2xl font-light text-ink`}
              >
                Work with{" "}
                <em className="text-sage-deep">Claude</em> until it&apos;s ready
              </h2>
              <p className="mt-2 text-sm text-ink/55">
                Answer follow-ups. Claude may tighten your idea, features, or
                wedge before generating assets.
              </p>
              <div className="mt-5 max-h-[320px] space-y-3 overflow-y-auto rounded-2xl border border-black/[0.06] bg-white p-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`text-sm leading-relaxed ${
                      m.role === "assistant"
                        ? "text-ink"
                        : "ml-8 text-right text-ink/70"
                    }`}
                  >
                    {m.role === "assistant" && (
                      <span className="mr-2 text-[10px] font-semibold uppercase text-sage-deep">
                        Studio
                      </span>
                    )}
                    {m.content}
                  </div>
                ))}
                {busy && (
                  <p className="text-sm text-ink/40">Claude is thinking…</p>
                )}
                <div ref={chatEnd} />
              </div>
              <form onSubmit={sendChat} className="mt-3 flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Your answer…"
                  className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-ink px-4 py-2.5 text-sm text-white disabled:opacity-50"
                >
                  Send
                </button>
              </form>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-sm text-ink/50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep("review")}
                  disabled={!ready && messages.length < 2}
                  className="ml-auto rounded-xl border border-black/10 px-4 py-2 text-sm font-medium disabled:opacity-40"
                >
                  {ready ? "Review & generate →" : "Skip to review"}
                </button>
              </div>
            </div>
            <aside className="rounded-2xl border border-black/[0.06] bg-white/80 p-5 text-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">
                Snapshot
              </p>
              <p className="mt-3 line-clamp-4 text-ink/70">{idea}</p>
              <p className="mt-2 text-xs text-ink/45">
                {images.length} moodboard · {features.split("\n").filter(Boolean).length}{" "}
                features listed
              </p>
              {ready && (
                <p className="mt-4 text-xs font-medium text-sage-deep">
                  ✓ Claude says you&apos;re ready
                </p>
              )}
            </aside>
          </div>
        )}

        {step === "review" && (
          <div>
            <h2 className={`${fraunces.className} text-3xl font-light text-ink`}>
              Ready to <em className="text-sage-deep">generate</em>?
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ReviewBlock title="Idea" body={idea} />
              <ReviewBlock title="Motion" body={motion} />
              <ReviewBlock title="Aesthetic" body={aesthetic} />
              <ReviewBlock title="Features" body={features} />
              <ReviewBlock title="v2" body={v2 || "—"} />
              <ReviewBlock title="Wedge" body={wedge} />
            </div>
            {images.length > 0 && (
              <div className="mt-4 flex gap-2">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="h-16 w-16 rounded-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${img.dataUrl})` }}
                  />
                ))}
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStep("refine")}
                className="text-sm text-ink/50"
              >
                ← More refinement
              </button>
              <button
                type="button"
                onClick={generate}
                className="ml-auto rounded-xl bg-ink px-6 py-3 text-sm font-medium text-white"
              >
                Generate asset suite →
              </button>
            </div>
            {error && <p className="mt-4 text-sm text-blush-deep">{error}</p>}
          </div>
        )}

        {step === "generating" && (
          <div className="rounded-2xl bg-ink px-8 py-10 text-white">
            <h2 className="flex items-center gap-3 text-xl font-semibold">
              <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-sage" />
              Generating your company
            </h2>
            <p className="mt-2 max-w-lg text-sm text-white/70">
              Build plan, operations team, and HTML prototypes (website, product
              mock, pitch, deck). This takes a few minutes.
            </p>
            <ul className="mt-6 space-y-2 rounded-xl bg-white/5 p-4">
              {GENERATION_TASKS.map((label, i) => (
                <li
                  key={label}
                  className={`flex items-center gap-2 text-sm ${
                    genProgress > i ? "text-white" : "text-white/35"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      genProgress > i ? "bg-sage" : "bg-white/20"
                    }`}
                  />
                  {label}
                </li>
              ))}
            </ul>
            {error && <p className="mt-4 text-sm text-blush-soft">{error}</p>}
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes gen-morph {
          0%,
          100% {
            border-radius: 58% 42% 34% 66% / 62% 36% 64% 38%;
          }
          50% {
            border-radius: 42% 58% 68% 32% / 48% 62% 38% 52%;
          }
        }
        @keyframes gen-rise {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .gen-rise {
          animation: gen-rise 0.65s ease backwards;
        }
      `}</style>
    </div>
  );
}

function Ambient() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(191,204,148,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(230,170,206,0.1),transparent_50%)]" />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 bg-sage/30 blur-3xl"
        style={{ animation: "gen-morph 8s ease-in-out infinite" }}
      />
    </>
  );
}

function BootScreen({ frauncesClass }: { frauncesClass: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div
        className="relative flex h-36 w-36 items-center justify-center"
        style={{ animation: "gen-rise 0.8s ease" }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-sage/80 via-sage-soft to-blush-soft opacity-90"
          style={{ animation: "gen-morph 6s ease-in-out infinite" }}
        />
        <span className="relative z-10 text-2xl font-semibold text-ink">+</span>
      </div>
      <p className={`${frauncesClass} gen-rise mt-8 text-lg italic text-ink/50`}>
        entering the intake portal…
      </p>
    </div>
  );
}

function StepShell({
  q,
  sub,
  children,
  onNext,
  onBack,
  canNext,
}: {
  q: string;
  sub: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  canNext?: boolean;
}) {
  return (
    <div className="gen-rise max-w-2xl">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">{q}</h2>
      <p className="mt-2 text-sm text-ink/55">{sub}</p>
      <div className="mt-6">{children}</div>
      <div className="mt-8 flex items-center gap-3">
        {onBack && (
          <button type="button" onClick={onBack} className="text-sm text-ink/50">
            ← Back
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={canNext === false}
          className="ml-auto rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function ReviewBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">
        {title}
      </p>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink/75">
        {body}
      </p>
    </div>
  );
}
