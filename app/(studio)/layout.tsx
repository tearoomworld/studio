import { requireUser } from "@/lib/auth";

export default async function StudioAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <>{children}</>;
}
