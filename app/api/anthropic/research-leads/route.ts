import { NextResponse } from "next/server";
import { researchLeads } from "@/lib/anthropic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await researchLeads({
      query: body.query,
      icp: body.icp ?? "Atlanta-area senior living Activities Directors",
      voice_skill: body.voice_skill ?? "kindred-warm",
      count: body.count ?? 8,
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Lead research failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
