"use client";

import { useActionState, useEffect, useState } from "react";
import { signIn, type SignInState } from "./actions";

type Phase = "intro" | "login";

const defaultEmail =
  process.env.NEXT_PUBLIC_STUDIO_OWNER_EMAIL?.trim() || "hq@tearoom.world";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function LoginExperience({ initialMessage }: { initialMessage?: string }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signIn,
    { error: initialMessage ? safeDecode(initialMessage) : undefined },
  );

  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => setPhase("login"), 2600);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-cream text-ink">
      <LoginStyles />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-8">
        {(phase === "intro" || phase === "login") && (
          <StudioWordmark compact={phase === "login"} />
        )}

        {phase === "intro" && (
          <p className="login-fade mt-6 text-[13px] tracking-[0.2em] text-ink/35 uppercase">
            loading
          </p>
        )}

        {phase === "login" && (
          <form
            action={formAction}
            className="login-rise mt-10 flex w-full flex-col gap-4"
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink/40">
                Email
              </span>
              <input
                name="email"
                type="email"
                autoComplete="username"
                defaultValue={defaultEmail}
                required
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2.5 text-sm text-ink outline-none ring-coral/30 focus:ring-2"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink/40">
                Password
              </span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-2.5 text-sm text-ink outline-none ring-coral/30 focus:ring-2"
              />
            </label>

            {state.error && (
              <p className="text-center text-sm text-blush-deep">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function StudioWordmark({ compact }: { compact: boolean }) {
  const letters = "Studio".split("");

  return (
    <div
      className={`flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        compact ? "scale-[0.72]" : "scale-100"
      }`}
    >
      <div className="relative mb-3 flex items-center gap-2">
        <span
          className={`logo-mark block rounded-full bg-ink transition-all duration-700 ${
            compact ? "h-2 w-2" : "h-2.5 w-2.5 logo-mark-in"
          }`}
        />
        <span
          className={`logo-line block h-px bg-ink/20 transition-all duration-700 ${
            compact ? "w-8" : "w-0 logo-line-grow"
          }`}
        />
      </div>

      <h1
        className="flex text-[clamp(2.75rem,12vw,4.5rem)] font-light tracking-[-0.04em] text-ink"
        aria-label="Studio"
      >
        {letters.map((char, i) => (
          <span
            key={i}
            className="logo-letter inline-block"
            style={{ animationDelay: `${120 + i * 70}ms` }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
}

function LoginStyles() {
  return (
    <style jsx global>{`
      @keyframes logo-letter-in {
        from {
          opacity: 0;
          transform: translateY(0.35em);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes logo-mark-in {
        from {
          opacity: 0;
          transform: scale(0);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes logo-line-grow {
        to {
          width: 3rem;
        }
      }
      @keyframes login-fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes login-rise-in {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .logo-letter {
        animation: logo-letter-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) backwards;
      }
      .logo-mark-in {
        animation: logo-mark-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
      }
      .logo-line-grow {
        animation: logo-line-grow 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.35s
          backwards;
      }
      .login-fade {
        animation: login-fade-in 0.6s ease 0.9s backwards;
      }
      .login-rise {
        animation: login-rise-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) backwards;
      }
    `}</style>
  );
}
