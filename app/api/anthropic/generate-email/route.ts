import { NextResponse } from "next/server";
import { generateEmail } from "@/lib/anthropic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await generateEmail({
      prospect_name: body.prospect_name,
      prospect_context: body.prospect_context ?? "",
      template_subject: body.template_subject,
      template_body: body.template_body,
      voice_skill: body.voice_skill ?? "kindred-warm",
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Email generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
