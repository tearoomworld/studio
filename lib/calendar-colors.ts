export const EVENT_KINDS = [
  { value: "manual", label: "General", defaultColor: "#5a6573" },
  { value: "demo", label: "Demo", defaultColor: "#97a570" },
  { value: "content", label: "Content", defaultColor: "#c4869f" },
  { value: "field", label: "Field", defaultColor: "#0D1821" },
  { value: "focus", label: "Focus block", defaultColor: "#7A5AE0" },
  { value: "call", label: "Call", defaultColor: "#2A6FDB" },
] as const;

export const EVENT_COLOR_SWATCHES = [
  "#97a570",
  "#c4869f",
  "#0D1821",
  "#E29449",
  "#2A6FDB",
  "#7A5AE0",
  "#1F8A5B",
  "#D98B6E",
  "#5a6573",
  "#F2D98E",
];

export function defaultColorForKind(kind: string) {
  return (
    EVENT_KINDS.find((k) => k.value === kind)?.defaultColor ?? "#5a6573"
  );
}

export function resolveEventColor(ev: {
  color?: string | null;
  source_kind: string;
}) {
  return ev.color || defaultColorForKind(ev.source_kind);
}

export function eventTint(hex: string) {
  return `${hex}1a`;
}
