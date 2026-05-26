import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, FileIcon, AlertTriangle } from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";
import { customers, rxHistory, visitHistory } from "@/data/mock";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "ประวัติลูกค้า — MARINA OPTICAL" },
      { name: "description", content: "ประวัติค่าสายตา เลนส์ กรอบ และปัญหาของลูกค้า" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [selected, setSelected] = useState("CUS-000152");
  const cur = customers.find((c) => c.id === selected) ?? customers[0];
  const rx = rxHistory[cur.id] ?? [];
  const visits = visitHistory[cur.id] ?? [];

  return (
    <AppShell title="ประวัติลูกค้า" subtitle="ดูประวัติค่าสายตา / เลนส์ / กรอบ / ปัญหา">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 p-6">
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="ค้นหาชื่อ / เบอร์"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </div>
          <div className="divide-y divide-border max-h-[calc(100vh-220px)] overflow-y-auto">
            {customers.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left px-4 py-3 hover:bg-secondary/60 ${c.id === selected ? "bg-secondary" : ""}`}
              >
                <div className="font-medium text-sm text-foreground">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.phone} · {c.id}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 min-w-0">
          <SectionCard title={`ประวัติค่าสายตา — ${cur.name}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-secondary-foreground">
                  <tr>
                    {["วันที่","R SPH","R CYL","R AX","R ADD","L SPH","L CYL","L AX","L ADD","หมายเหตุ"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rx.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 font-semibold text-primary whitespace-nowrap">{r.date}</td>
                      <td className="px-3 py-2">{r.sphR}</td><td className="px-3 py-2">{r.cylR}</td><td className="px-3 py-2">{r.axR}</td><td className="px-3 py-2">{r.addR}</td>
                      <td className="px-3 py-2">{r.sphL}</td><td className="px-3 py-2">{r.cylL}</td><td className="px-3 py-2">{r.axL}</td><td className="px-3 py-2">{r.addL}</td>
                      <td className="px-3 py-2 text-muted-foreground">{r.notes ?? "—"}</td>
                    </tr>
                  ))}
                  {rx.length === 0 && (
                    <tr><td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">ยังไม่มีประวัติ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="ประวัติการสั่งซื้อ / ใบงาน">
            <div className="space-y-4">
              {visits.map((v) => (
                <div key={v.jobNo} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-primary">ใบงาน #{v.jobNo}</span>
                      <span className="text-xs text-muted-foreground">{v.date}</span>
                    </div>
                    <span className="text-sm font-semibold">{v.price.toLocaleString()} บาท</span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">เลนส์</div>
                      <div className="font-medium">{v.lens}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">กรอบ</div>
                      <div className="font-medium">{v.frame}</div>
                    </div>
                  </div>
                  {v.issue && (
                    <div className="mt-3 flex items-start gap-2 rounded-md bg-destructive/10 text-destructive p-2.5 text-sm">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{v.issue}</span>
                    </div>
                  )}
                  {v.files && v.files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {v.files.map((f) => (
                        <span key={f} className="inline-flex items-center gap-1.5 text-xs rounded-md border border-border px-2 py-1 text-muted-foreground">
                          <FileIcon className="h-3.5 w-3.5 text-primary" />{f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {visits.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">ยังไม่มีประวัติการสั่งซื้อ</div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}