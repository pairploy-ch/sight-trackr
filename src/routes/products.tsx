import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "สินค้า / เลนส์ — MARINA OPTICAL" }] }),
  component: () => (<AppShell title="สินค้า / เลนส์"><div className="p-6"><SectionCard title="คลังเลนส์และกรอบ"><p className="text-sm text-muted-foreground">เร็วๆ นี้</p></SectionCard></div></AppShell>),
});