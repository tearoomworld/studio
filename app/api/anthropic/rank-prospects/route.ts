import { NextResponse } from "next/server";
import { rankProspects } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await rankProspects({
      prospects: body.prospects ?? [],
      icp: body.icp ?? "Atlanta senior communities, Activities Directors",
      voice_skill: body.voice_skill ?? "kindred-warm",
    });

    if (body.persist && result.ranked?.length) {
      const supabase = await createClient();
      await Promise.all(
        result.ranked.map((r) =>
          supabase
            .from("prospects")
            .update({
              fit_score: r.fit_score,
              priority: r.priority,
              rank_reason: r.reason,
              updated_at: new Date().toISOString(),
            })
            .eq("id", r.id),
        ),
      );
    }

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ranking failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
