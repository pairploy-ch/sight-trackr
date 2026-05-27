import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Phone, Calendar, FileText } from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";
import { customers, STATUS_LABEL, STATUS_COLOR } from "@/data/mock";

export const Route = createFileRoute("/customers/")({
  head: () => ({
    meta: [
      { title: "ลูกค้า — MARINA OPTICAL" },
      { name: "description", content: "รายชื่อและประวัติลูกค้าร้านแว่น" },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(customers[0].id);

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.name.includes(q) ||
          c.phone.includes(q) ||
          c.id.toLowerCase().includes(q.toLowerCase()) ||
          String(c.jobNo).includes(q),
      ),
    [q],
  );

  const cur = customers.find((c) => c.id === selected) ?? customers[0];

  return (
    <AppShell title="ลูกค้าทั้งหมด" subtitle={`${customers.length} รายการ`}>
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 p-6">
        <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col max-h-[calc(100vh-140px)]">
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหา ชื่อ / เบอร์ / รหัส / ใบงาน"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <Link to="/customers/new" className="w-full flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90">
              <Plus className="h-4 w-4" /> เพิ่มลูกค้าใหม่
            </Link>
          </div>
          <div className="overflow-y-auto divide-y divide-border">
            {filtered.map((c) => {
              const active = c.id === selected;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`w-full text-left p-4 hover:bg-secondary/60 transition ${
                    active ? "bg-secondary" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground truncate">{c.name}</span>
                    <span className="text-xs text-muted-foreground">#{c.jobNo}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>
                    <span>{c.id}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">ไม่พบลูกค้า</div>
            )}
          </div>
        </div>

        <div className="space-y-6 min-w-0">
          <SectionCard
            title={cur.name}
            action={
              <div className="flex gap-2">
                <Link to="/history" className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-secondary">
                  ดูประวัติเก่า
                </Link>
                <Link to="/jobs/new" className="text-sm rounded-md bg-primary text-primary-foreground px-3 py-1.5 hover:opacity-90">
                  สร้างใบงานใหม่
                </Link>
              </div>
            }
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Stat label="รหัสลูกค้า" value={cur.id} />
              <Stat label="เบอร์โทร" value={cur.phone} />
              <Stat label="อายุ" value={`${cur.age} ปี`} />
              <Stat label="เยี่ยมล่าสุด" value={cur.lastVisit} />
              <Stat label="ใบงานล่าสุด" value={`#${cur.jobNo}`} />
              <Stat label="ยอดรวม" value={`${cur.total.toLocaleString()} บาท`} />
              <Stat label="ชำระแล้ว" value={`${cur.paid.toLocaleString()} บาท`} />
              <Stat label="คงเหลือ" value={`${(cur.total - cur.paid).toLocaleString()} บาท`} highlight={cur.total > cur.paid} />
            </div>
          </SectionCard>

          <SectionCard title="ใบงานปัจจุบัน">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Detail label="เลนส์" value={cur.lens} />
              <Detail label="กรอบ" value={cur.frame} />
              <Detail label="วันนัดรับ" value={cur.pickup} icon={<Calendar className="h-4 w-4" />} />
              <Detail label="สถานะงาน" value={STATUS_LABEL[cur.status]} />
            </div>
          </SectionCard>

          <SectionCard title="การกระทำด่วน">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["พิมพ์ใบงาน","ส่ง PDF ทาง Line","บันทึกการมาเยี่ยม","แนบรูปกรอบ","แนบใบเสร็จ","เคลม / แก้ไขงาน"].map((b) => (
                <button key={b} className="flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm hover:bg-secondary">
                  <FileText className="h-4 w-4 text-primary" /> {b}
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 font-semibold ${highlight ? "text-destructive" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}