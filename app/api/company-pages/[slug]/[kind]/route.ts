import { NextResponse } from "next/server";
import { isUploadableKind } from "@/lib/company-pages";
import { createClient } from "@/lib/supabase/server";

const MAX_HTML_BYTES = 2_500_000;

async function readHtmlBody(request: Request): Promise<string | null> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (file instanceof File) return file.text();
    const pasted = form.get("html");
    if (typeof pasted === "string") return pasted;
    return null;
  }

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { html?: string };
    return typeof body.html === "string" ? body.html : null;
  }

  const text = await request.text();
  return text.trim() ? text : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; kind: string }> },
) {
  const { slug, kind } = await params;
  if (!isUploadableKind(kind) && kind !== "portal") {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!company) return new NextResponse("Not found", { status: 404 });

  const { data: page } = await supabase
    .from("company_pages")
    .select("html")
    .eq("company_id", company.id)
    .eq("kind", kind)
    .maybeSingle();

  if (!page?.html) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:system-ui;padding:2rem;color:#5a6573"><p>No custom HTML for <strong>${kind}</strong> yet. Drop a file in Studio to replace this asset.</p></body></html>`,
      {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }

  return new NextResponse(page.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string; kind: string }> },
) {
  const { slug, kind } = await params;
  if (!isUploadableKind(kind)) {
    return NextResponse.json({ error: "Invalid asset kind" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const html = await readHtmlBody(request);
  if (!html?.trim()) {
    return NextResponse.json({ error: "No HTML provided" }, { status: 400 });
  }

  const bytes = new TextEncoder().encode(html).length;
  if (bytes > MAX_HTML_BYTES) {
    return NextResponse.json(
      { error: `HTML too large (max ${MAX_HTML_BYTES / 1_000_000}MB)` },
      { status: 413 },
    );
  }

  const normalized = html.trim();
  const { error } = await supabase.from("company_pages").upsert(
    {
      company_id: company.id,
      kind,
      html: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "company_id,kind" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    kind,
    slug,
    src: `/api/company-pages/${slug}/${kind}`,
    bytes,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; kind: string }> },
) {
  const { slug, kind } = await params;
  if (!isUploadableKind(kind)) {
    return NextResponse.json({ error: "Invalid asset kind" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  await supabase
    .from("company_pages")
    .delete()
    .eq("company_id", company.id)
    .eq("kind", kind);

  return NextResponse.json({ ok: true, reverted: true });
}
