import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { parsePlanFromHtml, planToRows } from "../lib/parse-plan";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in studio/.env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const root = path.join(process.cwd(), "..");

const LEDGER = [
  {
    status: "yes",
    title: "Founder story = trust unlock",
    body: '"GT + tech + grandma caretaker" lands in every Kindred cold email reply. Use the same shape (credentials + lived experience) for every future company.',
    order_index: 0,
  },
  {
    status: "yes",
    title: "Single-HTML mocks beat polished pixels",
    body: "Click-through HTML mocks have closed more conversations than Figma files would. Always lead with something interactive.",
    order_index: 1,
  },
  {
    status: "yes",
    title: "Audit-before-code saves weeks",
    body: "The v1→v2 audit pattern catches dormant-data and polymorphism lock-ins before they become migrations.",
    order_index: 2,
  },
  {
    status: "yes",
    title: "Portal model beats nested tabs",
    body: "Each company gets its own working portal with its own sidebar. The Studio shell stays for strategy; the portals own the work.",
    order_index: 3,
  },
  {
    status: "yes",
    title: "Different motions can run in parallel",
    body: "Kindred = sprint (build then sell). Source = marathon (build then sustained content + presence).",
    order_index: 4,
  },
  {
    status: "maybe",
    title: "Lowercase brand voice (Source)",
    body: "Aesthetic is striking but untested with actual buyers. Validate at first 10 atlanta events before doubling down.",
    order_index: 5,
  },
  {
    status: "no",
    title: "Vision-without-pilot is procrastination",
    body: "Writing the talent marketplace before Kindred has a paid customer is avoidance. Note the ideas. Don't build them.",
    order_index: 6,
  },
  {
    status: "no",
    title: "Copy-pasting structure across companies",
    body: "Each company needs its own motion, voice, and portal — not a clone of the last one's tabs.",
    order_index: 7,
  },
];

const PROSPECTS = [
  {
    name: "Sunrise Manor",
    contact_name: "Patricia Cole",
    contact_email: "pcole@sunrisemanoratl.org",
    status: "researching",
    notes: "Decatur GA · 120 beds · activities director role open on LinkedIn",
  },
  {
    name: "Bridge Senior Living",
    contact_name: "Marcus Webb",
    contact_email: "mwebb@bridgesenior.com",
    status: "researching",
    notes: "Marietta GA · recently expanded memory care wing",
  },
  {
    name: "Peachtree Hills Residence",
    contact_name: "Diane Foster",
    contact_email: "dfoster@peachtreehills.org",
    status: "researching",
    notes: "Midtown Atlanta · strong activities calendar already",
  },
  {
    name: "Oakwood Gardens",
    contact_name: "James Ortiz",
    contact_email: "jortiz@oakwoodgardens.com",
    status: "researching",
    notes: "Sandy Springs · pilot-friendly AD, met at GA aging conference",
  },
  {
    name: "Cedar Lane Community",
    contact_name: "Angela Price",
    contact_email: "aprice@cedarlane.community",
    status: "researching",
    notes: "East Atlanta · nonprofit board, slower procurement",
  },
];

const TEMPLATES = [
  {
    name: "Warm intro — grandma story",
    subject: "a weekly visit between your residents and another community",
    body: `Hi {{contact_name}},

I'm Ayesha — I built Kindred after years helping care for my grandmother and seeing how isolated senior communities can feel week to week.

Kindred is a simple weekly group video visit between two communities. Your activities team runs it; we handle the tech.

Would a 15-minute call next week make sense to see if this fits {{prospect_name}}?

— Ayesha`,
  },
  {
    name: "Follow-up — specific over abstract",
    subject: "following up — kindred for {{prospect_name}}",
    body: `Hi {{contact_name}},

Wanted to follow up on my note about Kindred — group video sessions between senior communities, run by your ADs.

Happy to share how a similar-sized community in Atlanta set up their first session in under a week.

Open to a short demo?

— Ayesha`,
  },
  {
    name: "Pilot offer",
    subject: "pilot — two communities, four weeks, no cost",
    body: `Hi {{contact_name}},

We're opening a small pilot for Atlanta-area communities — four weeks, two partner communities, we cover everything.

If {{prospect_name}} is exploring ways to add meaningful programming without adding headcount, I'd love to talk.

— Ayesha`,
  },
];

async function upsertCompany(
  slug: string,
  row: Record<string, unknown>,
) {
  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    await supabase.from("companies").update(row).eq("id", existing.id);
    return existing.id as string;
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({ slug, ...row })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function seedCompanyPlan(
  companyId: string,
  planFile: string,
  varName: string,
) {
  const plan = parsePlanFromHtml(planFile, varName);
  const phases = planToRows(plan);

  const { data: oldPhases } = await supabase
    .from("phases")
    .select("id")
    .eq("company_id", companyId);
  if (oldPhases?.length) {
    const ids = oldPhases.map((p) => p.id);
    await supabase.from("tasks").delete().in("phase_id", ids);
    await supabase.from("phases").delete().eq("company_id", companyId);
  }

  for (const phase of phases) {
    const { data: ph, error: pe } = await supabase
      .from("phases")
      .insert({
        company_id: companyId,
        order_index: phase.order_index,
        icon: phase.icon,
        title: phase.title,
        description: phase.description,
      })
      .select("id")
      .single();
    if (pe) throw pe;

    if (phase.tasks.length) {
      const { error: te } = await supabase.from("tasks").insert(
        phase.tasks.map((t) => ({ ...t, phase_id: ph.id })),
      );
      if (te) throw te;
    }
  }
}

async function main() {
  console.log("Seeding Studio…");

  const kindredId = await upsertCompany("kindred", {
    name: "Kindred",
    tagline:
      "A weekly visit between senior communities. Group video sessions, Spotlights, AD-run.",
    status: "prototype",
    motion: "sprint",
    estimated_weeks: 5,
    voice_skill: "kindred-warm",
    order_index: 1,
    brand: { logo: "kindred", accent: "sage" },
  });

  const sourceId = await upsertCompany("source", {
    name: "Source",
    tagline:
      "An editorial events app for Atlanta. Find, buy, host. Ticket fees fund a quarterly host prize pool.",
    status: "prototype",
    motion: "marathon",
    estimated_weeks: 8,
    voice_skill: "source-editorial",
    order_index: 2,
    brand: { logo: "source", accent: "sage-deep", lowercase: true },
  });

  await seedCompanyPlan(
    kindredId,
    path.join(root, "kindred-portal.html"),
    "kindredPlan",
  );
  await seedCompanyPlan(
    sourceId,
    path.join(root, "source-portal.html"),
    "sourcePlan",
  );

  for (const entry of LEDGER) {
    const { data: ex } = await supabase
      .from("ledger_entries")
      .select("id")
      .eq("title", entry.title)
      .maybeSingle();
    if (ex) {
      await supabase.from("ledger_entries").update(entry).eq("id", ex.id);
    } else {
      await supabase.from("ledger_entries").insert(entry);
    }
  }

  async function upsertTeam(
    companyId: string,
    slug: string,
    row: Record<string, unknown>,
  ) {
    const { data: ex } = await supabase
      .from("teams")
      .select("id")
      .eq("company_id", companyId)
      .eq("slug", slug)
      .maybeSingle();
    if (ex) {
      await supabase.from("teams").update(row).eq("id", ex.id);
      return ex.id as string;
    }
    const { data, error } = await supabase
      .from("teams")
      .insert({ company_id: companyId, slug, ...row })
      .select("id")
      .single();
    if (error) throw error;
    return data.id as string;
  }

  const salesTeamId = await upsertTeam(kindredId, "sales", {
    name: "Sales",
    kind: "sales",
    description:
      "Selling to atlanta-area Activities Directors. Cold outbound.",
    order_index: 0,
  });

  await upsertTeam(sourceId, "marketing", {
    name: "Marketing",
    kind: "marketing",
    description: "Content + presence + host scouting for source.",
    order_index: 0,
  });

  const { count: prospectCount } = await supabase
    .from("prospects")
    .select("*", { count: "exact", head: true })
    .eq("team_id", salesTeamId);

  if (!prospectCount) {
    await supabase
      .from("prospects")
      .insert(PROSPECTS.map((p) => ({ ...p, team_id: salesTeamId })));
  }

  const { count: templateCount } = await supabase
    .from("templates")
    .select("*", { count: "exact", head: true })
    .eq("team_id", salesTeamId);

  if (!templateCount) {
    await supabase
      .from("templates")
      .insert(TEMPLATES.map((t) => ({ ...t, team_id: salesTeamId })));
  }

  const tables = [
    "companies",
    "phases",
    "tasks",
    "ledger_entries",
    "teams",
    "prospects",
    "templates",
    "content_ideas",
    "calendar_events",
  ] as const;

  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    console.log(`  ${table}: ${count ?? 0}`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
