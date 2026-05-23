import { Fraunces } from "next/font/google";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PortalSidebar } from "@/components/PortalSidebar";
import { resolveAssetIframeSrc } from "@/lib/company-pages";
import { getAssetTabs, getPortalTabSrc, isEagerTab } from "@/lib/portal-tabs";
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

  const brand = company.brand as Record<string, unknown>;
  const tabs = getAssetTabs(slug, brand);
  const defaultSrc = getPortalTabSrc(slug, tab, brand);
  const { src: iframeSrc, kind: replaceKind } = await resolveAssetIframeSrc(
    supabase,
    company.id,
    slug,
    tab,
    defaultSrc,
    brand,
    tabs,
  );
  const eager = isEagerTab(slug, tab, brand);

  let buildContent = null;
  if (tab === "build" && !iframeSrc) {
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
        className={`${fraunces.className} inline-flex items-center gap-3 text-[30px] font-medium tracking-[-0.025em] text-[#b85e25]`}
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#E29449]"
          aria-hidden
        />
        Kin<em className="italic text-[#E29449]">dred</em>
      </div>
    ) : (
      <div className="text-2xl font-medium lowercase tracking-tight text-ink">
        {company.name}
        <span className="text-sage-deep">.</span>
      </div>
    );

  return (
    <div className="grid h-screen grid-cols-[224px_1fr]">
      <Suspense fallback={<div className="w-56 bg-soft-bg" />}>
        <PortalSidebar
          slug={slug}
          name={company.name}
          logo={logo}
          brand={company.brand as Record<string, unknown>}
        />
      </Suspense>
      <div className="h-screen overflow-hidden bg-white">
        {iframeSrc ? (
          <IframeLoader
            src={iframeSrc}
            eager={eager}
            slug={slug}
            replaceKind={replaceKind}
          />
        ) : (
          buildContent ?? (
            <p className="p-8 text-sm text-ink/50">No content for this tab.</p>
          )
        )}
      </div>
    </div>
  );
}
