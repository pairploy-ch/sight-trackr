import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "ผู้ใช้งาน — MARINA OPTICAL" }] }),
  component: () => (<AppShell title="ผู้ใช้งาน" subtitle="พนักงานที่เข้าใช้ระบบ"><div className="p-6"><SectionCard title="พนักงาน"><p className="text-sm text-muted-foreground">เร็วๆ นี้ — Login แยกพนักงาน, สิทธิ์การใช้งาน</p></SectionCard></div></AppShell>),
});