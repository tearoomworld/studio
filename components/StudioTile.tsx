import Link from "next/link";

const TILES = [
  {
    href: "/calendar",
    label: "Calendar",
    icon: "▦",
    bg: "bg-sky-soft",
    iconBg: "bg-white/70",
  },
  {
    href: "/operations",
    label: "Operations",
    icon: "▣",
    bg: "bg-sage-soft",
    iconBg: "bg-white/70",
  },
  {
    href: "/generate",
    label: "Generate",
    icon: "+",
    bg: "bg-coral-soft",
    iconBg: "bg-white/70",
  },
  {
    href: "/ledger",
    label: "Ledger",
    icon: "≡",
    bg: "bg-blush-soft",
    iconBg: "bg-white/70",
  },
] as const;

export function StudioQuickNav() {
  return (
    <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
      {TILES.map((tile) => (
        <Link
          key={tile.href}
          href={tile.href}
          className={`studio-tile group flex min-h-[120px] flex-col justify-between p-5 ${tile.bg}`}
        >
          <span className="text-[13px] font-semibold tracking-tight text-ink/80">
            {tile.label}
          </span>
          <span
            className={`studio-tile-icon flex h-11 w-11 items-center justify-center rounded-2xl text-xl text-ink ${tile.iconBg}`}
          >
            {tile.icon}
          </span>
        </Link>
      ))}
    </div>
  );
}
