import { Sidebar } from "./Sidebar";

export function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-screen grid-cols-[240px_1fr] bg-white">
      <Sidebar />
      <main className="h-screen overflow-y-auto">{children}</main>
    </div>
  );
}
