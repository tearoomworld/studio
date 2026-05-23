import { StudioLayout } from "@/components/StudioLayout";
import { SurfaceHead } from "@/components/SurfaceHead";
import { SettingsCard } from "@/components/SettingsCard";
import {
  COMPATIBILITY_RULES,
  FOUNDER_PROFILE,
  STUDIO_DEFAULTS,
} from "@/lib/studio-defaults";

export default function SettingsPage() {
  return (
    <StudioLayout>
      <div className="mx-auto max-w-[980px] px-12 py-12">
        <SurfaceHead
          eyebrow="System"
          title="Settings."
          subtitle="Studio-wide defaults. The locked stack, the founder profile, the patterns every new company starts from."
        />

        <SettingsCard
          title="Studio defaults · locked"
          intro="Every new company inherits these. Override only when the company specifically needs something different."
          rows={STUDIO_DEFAULTS}
        />

        <SettingsCard
          title="Founder profile"
          intro="Background that gets referenced across every company's founder story."
          rows={FOUNDER_PROFILE}
        />

        <SettingsCard
          title="Compatibility rules · studio-wide"
          intro="Applied to every company. Override only with explicit reason."
          rows={COMPATIBILITY_RULES}
        />
      </div>
    </StudioLayout>
  );
}
