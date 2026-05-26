import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "ตั้งค่า — MARINA OPTICAL" }] }),
  component: () => (<AppShell title="ตั้งค่า"><div className="p-6"><SectionCard title="ตั้งค่าระบบ"><p className="text-sm text-muted-foreground">เร็วๆ นี้</p></SectionCard></div></AppShell>),
});