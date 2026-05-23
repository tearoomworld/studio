import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getSiteOrigin } from "@/lib/site-url";

export async function GET() {
  const supabase = getSupabaseEnv();
  return NextResponse.json({
    ok: true,
    supabase_configured: !!supabase,
    has_anthropic: !!process.env.ANTHROPIC_API_KEY,
    magic_link_origin: getSiteOrigin(),
  });
}
