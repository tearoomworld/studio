import { NextResponse } from "next/server";
import { analyzeEmail } from "@/lib/anthropic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await analyzeEmail(body);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
