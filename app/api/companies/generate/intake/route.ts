import { NextResponse } from "next/server";
import { runIntakeTurn } from "@/lib/generate-intake";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await runIntakeTurn({
      answers: body.answers ?? {},
      messages: body.messages ?? [],
      userMessage: body.userMessage,
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Intake failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
