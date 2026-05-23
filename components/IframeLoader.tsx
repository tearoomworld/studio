"use client";

import { useEffect, useState } from "react";
import { AssetHtmlReplace } from "@/components/AssetHtmlReplace";
import type { UploadableKind } from "@/lib/company-pages";

export function IframeLoader({
  src,
  eager,
  slug,
  replaceKind,
}: {
  src: string;
  eager?: boolean;
  slug?: string;
  replaceKind?: UploadableKind | null;
}) {
  const [loaded, setLoaded] = useState(false);
  const [frameKey, setFrameKey] = useState(0);

  useEffect(() => {
    setLoaded(false);
    setFrameKey((k) => k + 1);
  }, [src]);

  useEffect(() => {
    if (!eager) return;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = src;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [src, eager]);

  return (
    <div className="relative h-[calc(100vh-0px)] w-full">
      {slug && replaceKind && (
        <AssetHtmlReplace slug={slug} kind={replaceKind} />
      )}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-soft-bg text-sm text-ink/50">
          Loading…
        </div>
      )}
      <iframe
        key={frameKey}
        src={src}
        title="Portal asset"
        className="h-full w-full border-0"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
