import { NextResponse } from "next/server";
import { generateContent } from "@/lib/anthropic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await generateContent({
      prompt: body.prompt,
      count: body.count ?? 3,
      voice_skill: body.voice_skill,
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
