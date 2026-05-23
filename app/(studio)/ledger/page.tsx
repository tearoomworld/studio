import { StudioLayout } from "@/components/StudioLayout";
import { SurfaceHead } from "@/components/SurfaceHead";
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
        <SurfaceHead
          eyebrow="Overview"
          title="The ledger."
          subtitle="What's working. What isn't. Updated whenever you learn something real from a customer call, a build day, or a moment in the field. Pattern-match across companies."
        />
        <LedgerClient initial={entries ?? []} />
      </div>
    </StudioLayout>
  );
}
