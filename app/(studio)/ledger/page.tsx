import { StudioLayout } from "@/components/StudioLayout";
import { LedgerClient } from "./LedgerClient";
import { createClient } from "@/lib/supabase/server";

export default async function LedgerPage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("ledger_entries")
    .select("*")
    .order("order_index");

  return (
    <StudioLayout>
      <div className="mx-auto max-w-[980px] px-12 py-12">
        <header className="mb-8 border-b border-black/5 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
            Overview
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
            The ledger.
          </h1>
        </header>
        <LedgerClient initial={entries ?? []} />
      </div>
    </StudioLayout>
  );
}
