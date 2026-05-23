import { StudioLayout } from "@/components/StudioLayout";
import { SurfaceHead } from "@/components/SurfaceHead";
import { GeneratePortal } from "./GeneratePortal";

export default function GeneratePage() {
  return (
    <StudioLayout>
      <div className="mx-auto max-w-[980px] px-12 py-12">
        <SurfaceHead
          eyebrow="Plan"
          title="Generate a new prototype."
          subtitle="An interactive intake portal — answer questions, upload moodboard images, refine with Claude, then generate build plan + HTML prototypes from your feature list."
        />
        <GeneratePortal />
      </div>
    </StudioLayout>
  );
}
