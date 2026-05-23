import { NextResponse } from "next/server";
import { generateCompanySpec } from "@/lib/anthropic";
import { generateAllPages, portalTabsFromPages } from "@/lib/generate-assets";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const moodboard = (body.moodboard_images ?? []) as { name: string }[];
    const moodboard_note =
      moodboard.length > 0
        ? `${moodboard.length} moodboard image(s): ${moodboard.map((i) => i.name).join(", ")}. Visual direction described in aesthetic field.`
        : "No moodboard images uploaded.";

    const intakeSummary = Array.isArray(body.messages)
      ? body.messages
          .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
          .join("\n")
      : "";

    const spec = await generateCompanySpec({
      idea: body.idea,
      motion: body.motion,
      aesthetic: body.aesthetic ?? "",
      features: body.features ?? "",
      v2: body.v2 ?? "",
      wedge: body.wedge ?? "",
      intake_summary: intakeSummary,
    });

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", spec.slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: `Company slug "${spec.slug}" already exists. Refine the idea or name with Claude in intake.`,
        },
        { status: 409 },
      );
    }

    const { count } = await supabase
      .from("companies")
      .select("*", { count: "exact", head: true });

    const generatedTabs = portalTabsFromPages(spec.slug);
    const brand = {
      ...spec.brand,
      features_list: body.features,
      moodboard_note,
      generated_tabs: generatedTabs,
    };

    const { data: company, error: companyErr } = await supabase
      .from("companies")
      .insert({
        slug: spec.slug,
        name: spec.name,
        tagline: spec.tagline,
        status: "prototype",
        motion: spec.motion,
        estimated_weeks: spec.estimated_weeks,
        brand,
        voice_skill: spec.voice_skill,
        order_index: count ?? 0,
      })
      .select()
      .single();

    if (companyErr || !company) {
      return NextResponse.json(
        { error: companyErr?.message ?? "Failed to create company" },
        { status: 400 },
      );
    }

    for (let i = 0; i < spec.phases.length; i++) {
      const phase = spec.phases[i];
      const { data: phaseRow, error: phaseErr } = await supabase
        .from("phases")
        .insert({
          company_id: company.id,
          order_index: i,
          icon: phase.icon,
          title: phase.title,
          description: phase.description,
        })
        .select()
        .single();

      if (phaseErr || !phaseRow) continue;

      const tasks = phase.tasks.map((t, j) => ({
        phase_id: phaseRow.id,
        order_index: j,
        text: t.text,
        tag: t.tag ?? null,
        done: false,
      }));

      if (tasks.length) await supabase.from("tasks").insert(tasks);
    }

    await supabase.from("teams").insert({
      company_id: company.id,
      slug: spec.team.slug,
      name: spec.team.name,
      kind: spec.team.kind,
      description: spec.team.description,
      order_index: 0,
    });

    const pages = await generateAllPages(spec, {
      idea: body.idea,
      aesthetic: body.aesthetic ?? "",
      features: body.features ?? "",
      wedge: body.wedge ?? "",
      v2: body.v2 ?? "",
      moodboard_note,
    });

    for (const [kind, html] of Object.entries(pages)) {
      await supabase.from("company_pages").upsert(
        {
          company_id: company.id,
          kind,
          html,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "company_id,kind" },
      );
    }

    return NextResponse.json({
      slug: company.slug,
      name: company.name,
      message: `Created ${company.name} with build plan, team, and HTML prototypes (website, product, pitch, deck).`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
