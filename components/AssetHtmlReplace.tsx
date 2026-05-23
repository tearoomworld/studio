"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { kindLabel, type UploadableKind } from "@/lib/company-pages";

export function AssetHtmlReplace({
  slug,
  kind,
}: {
  slug: string;
  kind: UploadableKind;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const label = kindLabel(kind);

  const saveHtml = useCallback(
    async (html: string) => {
      setBusy(true);
      setError(null);
      setMessage(null);
      try {
        const res = await fetch(`/api/company-pages/${slug}/${kind}`, {
          method: "PUT",
          headers: { "Content-Type": "text/html; charset=utf-8" },
          body: html,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error ?? "Upload failed");
        }
        setMessage(`${label} saved — refreshing preview.`);
        setOpen(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [slug, kind, label, router],
  );

  async function onFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".html") && !file.type.includes("html")) {
      setError("Use an .html file");
      return;
    }
    await saveHtml(await file.text());
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await onFile(file);
  }

  async function revertToDefault() {
    if (
      !confirm(
        `Remove your custom ${label} HTML? The portal will show the original file again (public mock or last generated version).`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/company-pages/${slug}/${kind}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not revert");
      }
      setMessage("Reverted to default asset.");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Revert failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="absolute right-4 top-4 z-20 rounded-xl border border-black/[0.08] bg-white/95 px-3.5 py-2 text-[12px] font-semibold text-ink shadow-sm backdrop-blur-sm transition-all hover:border-coral/40 hover:bg-coral-soft/80"
      >
        Replace HTML
      </button>

      {open && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-ink/20 p-6 backdrop-blur-[2px]"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="studio-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold tracking-tight text-ink">
              Replace {label}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">
              Drop a new <code className="rounded bg-soft-bg px-1 text-xs">.html</code>{" "}
              file or pick one from your machine. Your upload is stored in Studio
              and loads in this tab immediately — perfect when you change design
              direction.
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`mt-5 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                dragOver
                  ? "border-coral bg-coral-soft/50"
                  : "border-black/10 bg-cream-deep/60 hover:border-coral/50"
              }`}
              onClick={() => inputRef.current?.click()}
            >
              <span className="text-2xl text-ink/30">↓</span>
              <p className="mt-2 text-sm font-medium text-ink">
                Drop .html here or click to browse
              </p>
              <p className="mt-1 text-xs text-ink/45">Single file · max ~2.5MB</p>
              <input
                ref={inputRef}
                type="file"
                accept=".html,text/html"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onFile(file);
                  e.target.value = "";
                }}
              />
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-700">{error}</p>
            )}
            {message && (
              <p className="mt-3 text-sm text-sage-deep">{message}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-black/[0.08] px-4 py-2 text-sm font-medium text-ink/70 hover:bg-soft-bg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void revertToDefault()}
                className="rounded-xl px-4 py-2 text-sm font-medium text-ink/50 hover:bg-soft-bg hover:text-ink disabled:opacity-50"
              >
                Revert to default
              </button>
            </div>

            <p className="mt-4 border-t border-black/[0.06] pt-4 text-[11px] leading-relaxed text-ink/45">
              Kindred & Source static mocks in{" "}
              <code className="text-ink/60">public/</code> stay as fallbacks until
              you upload here. New companies from Generate use this store by default.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
