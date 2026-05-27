import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { customers, STATUS_LABEL, STATUS_ORDER, type CustomerStatus } from "@/data/mock";

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "งานที่กำลังดำเนินการ — MARINA OPTICAL" },
      { name: "description", content: "ติดตามสถานะใบงานทั้งหมด" },
    ],
  }),
  component: JobsPage,
});

const COLUMNS: CustomerStatus[] = ["received","waiting_lens","assembling","qc","ready","delivered"];

function JobsPage() {
  const claims = customers.filter((c) => c.status === "claim");
  return (
    <AppShell title="งานที่กำลังดำเนินการ" subtitle="Kanban — ติดตามทุกขั้นตอนการผลิต">
      <div className="p-6 space-y-6">
        {claims.length > 0 && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
            <div className="flex items-center gap-2 text-destructive font-semibold">
              <AlertTriangle className="h-4 w-4" /> เคลม / แก้ไขงาน — {claims.length} รายการ
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {claims.map((c) => (
                <span key={c.id} className="text-xs rounded-full bg-card border border-destructive/30 px-2.5 py-1">
                  #{c.jobNo} · {c.name}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {COLUMNS.map((key) => {
            const items = customers.filter((c) => c.status === key);
            return (
              <div key={key} className="rounded-xl bg-card border border-border border-t-4 border-t-primary/60 shadow-sm flex flex-col">
                <div className="px-4 py-3 border-b border-border">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{STATUS_ORDER.indexOf(key) + 1} / {STATUS_ORDER.length}</div>
                  <div className="text-sm font-semibold mt-0.5">{STATUS_LABEL[key]}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{items.length} ใบงาน</div>
                </div>
                <div className="p-3 space-y-3 min-h-[200px]">
                  {items.map((c) => (
                    <Link key={c.id} to="/" className="block rounded-lg border border-border bg-background p-3 hover:shadow-md hover:border-primary/40 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary">#{c.jobNo}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{c.pickup}</span>
                      </div>
                      <div className="mt-1.5 text-sm font-medium truncate">{c.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground truncate">{c.lens}</div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">คงเหลือ</span>
                        <span className={`font-semibold ${c.total > c.paid ? "text-destructive" : "text-foreground"}`}>
                          {(c.total - c.paid).toLocaleString()} ฿
                        </span>
                      </div>
                    </Link>
                  ))}
                  {items.length === 0 && <div className="text-xs text-muted-foreground text-center py-6">ว่าง</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}