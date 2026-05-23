"use client";

import { useEffect, useState } from "react";

export function IframeLoader({
  src,
  eager,
}: {
  src: string;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

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
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-soft-bg text-sm text-ink/50">
          Loading…
        </div>
      )}
      <iframe
        src={src}
        title="Portal asset"
        className="h-full w-full border-0"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
