/** Append embed=1 (and optional pane) for iframe loads inside Studio portal shell. */
export function embedPortalUrl(path: string, pane?: string): string {
  const hashIdx = path.indexOf("#");
  const base = hashIdx >= 0 ? path.slice(0, hashIdx) : path;
  const hash = hashIdx >= 0 ? path.slice(hashIdx) : "";

  const params = new URLSearchParams();
  params.set("embed", "1");
  if (pane) params.set("pane", pane);

  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${params.toString()}${hash}`;
}
