"use client";

export function PhaseOneButton({
  label,
  message = "Adding teams is a Phase 1 feature.",
}: {
  label: string;
  message?: string;
}) {
  return (
    <button
      type="button"
      className="mt-8 text-sm text-ink/50 hover:text-ink"
      onClick={() => alert(message)}
    >
      {label}
    </button>
  );
}
