import { Fraunces } from "next/font/google";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  PortalSidebar,
  getPortalTabSrc,
  isEagerTab,
} from "@/components/PortalSidebar";
import { IframeLoader } from "@/components/IframeLoader";
import { BuildPlan } from "./BuildPlan";
import { createClient } from "@/lib/supabase/server";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export default async function CompanyPortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab = "build" } = await searchParams;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!company) notFound();

  const iframeSrc = getPortalTabSrc(slug, tab);
  const eager = isEagerTab(slug, tab);

  let buildContent = null;
  if (tab === "build") {
    const { data: phases } = await supabase
      .from("phases")
      .select("id, title, icon, description, order_index")
      .eq("company_id", company.id)
      .order("order_index");

    const phaseIds = phases?.map((p) => p.id) ?? [];
    const { data: tasks } = phaseIds.length
      ? await supabase
          .from("tasks")
          .select("id, phase_id, group_label, text, done, tag, order_index")
          .in("phase_id", phaseIds)
          .order("order_index")
      : { data: [] };

    const phasesWithTasks =
      phases?.map((p) => ({
        ...p,
        tasks: (tasks ?? []).filter((t) => t.phase_id === p.id),
      })) ?? [];

    buildContent = <BuildPlan phases={phasesWithTasks} />;
  }

  const logo =
    slug === "kindred" ? (
      <div
        className={`${fraunces.className} text-2xl font-medium text-ink`}
      >
        Kin<span className="text-sage-deep">dred</span>
      </div>
    ) : (
      <div className="text-2xl font-medium lowercase tracking-tight text-ink">
        source<span className="text-sage-deep">.</span>
      </div>
    );

  return (
    <div className="grid h-screen grid-cols-[224px_1fr]">
      <Suspense fallback={<div className="w-56 bg-soft-bg" />}>
        <PortalSidebar slug={slug} name={company.name} logo={logo} />
      </Suspense>
      <div className="h-screen overflow-y-auto bg-white">
        {iframeSrc ? (
          <IframeLoader src={iframeSrc} eager={eager} />
        ) : (
          buildContent ?? (
            <p className="p-8 text-sm text-ink/50">No content for this tab.</p>
          )
        )}
      </div>
    </div>
  );
}
