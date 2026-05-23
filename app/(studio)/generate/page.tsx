import { StudioLayout } from "@/components/StudioLayout";
import { GenerateForm } from "./GenerateForm";

export default function GeneratePage() {
  return (
    <StudioLayout>
      <div className="mx-auto max-w-[720px] px-12 py-12">
        <header className="mb-8 border-b border-black/5 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
            Plan
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
            Generate new.
          </h1>
          <p className="mt-3 text-base text-ink/70">
            Intake produces a meta-prompt for Claude Code — no API file write yet.
          </p>
        </header>
        <GenerateForm />
      </div>
    </StudioLayout>
  );
}
