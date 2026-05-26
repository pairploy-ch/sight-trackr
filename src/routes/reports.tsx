import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "รายงาน — MARINA OPTICAL" }] }),
  component: () => (
    <AppShell title="รายงาน" subtitle="ยอดขาย / สต๊อก / สถานะงาน">
      <div className="p-6"><SectionCard title="รายงาน"><p className="text-sm text-muted-foreground">เร็วๆ นี้ — ยอดขายรายวัน, รายงานเลนส์, สถานะงานสรุป</p></SectionCard></div>
    </AppShell>
  ),
});