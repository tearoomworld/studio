import { NextResponse } from "next/server";
import {
  handleCalWebhook,
  verifyCalSignature,
  type CalWebhookBody,
} from "@/lib/cal-webhook";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.CAL_WEBHOOK_SECRET?.trim();
  const signature = request.headers.get("x-cal-signature-256");

  if (!verifyCalSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: CalWebhookBody;
  try {
    body = JSON.parse(rawBody) as CalWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await handleCalWebhook(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[cal webhook]", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
