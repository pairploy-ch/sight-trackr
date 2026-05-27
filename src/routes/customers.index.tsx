import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Plus, Phone, Calendar, AlertTriangle,
  FileIcon, Pencil, Trash2, X, Save, ChevronRight,
} from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";
import {
  customers as initialCustomers,
  STATUS_LABEL, STATUS_COLOR,
  rxHistory, visitHistory,
} from "@/data/mock";

export const Route = createFileRoute("/customers/")({
  head: () => ({
    meta: [
      { title: "ลูกค้า — MARINA OPTICAL" },
      { name: "description", content: "รายชื่อและประวัติลูกค้าร้านแว่น" },
    ],
  }),
  component: CustomersPage,
});

type Customer = (typeof initialCustomers)[number];

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 ${props.className ?? ""}`}
    />
  );
}

function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState(initialCustomers);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(customers[0].id);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.name.includes(q) ||
          c.phone.includes(q) ||
          c.id.toLowerCase().includes(q.toLowerCase()) ||
          String(c.jobNo).includes(q),
      ),
    [q, customers],
  );

  const cur = customers.find((c) => c.id === selected) ?? customers[0];
  const rx = rxHistory[cur.id] ?? [];
  const visits = visitHistory[cur.id] ?? [];

  function startEdit() {
    setEditData({ ...cur });
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditData(null);
  }

  function saveEdit() {
    if (!editData) return;
    setCustomers((prev) => prev.map((c) => (c.id === editData.id ? editData : c)));
    setIsEditing(false);
    setEditData(null);
  }

  function handleDelete(id: string) {
    const remaining = customers.filter((c) => c.id !== id);
    setCustomers(remaining);
    if (selected === id && remaining.length > 0) setSelected(remaining[0].id);
    setDeleteId(null);
  }

  return (
    <AppShell title="ลูกค้าทั้งหมด" subtitle={`${customers.length} รายการ`}>
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 p-6">

        {/* ── Left: list ── */}
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
            <Link
              to="/customers/new"
              className="w-full flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> เพิ่มลูกค้าใหม่
            </Link>
          </div>
          <div className="overflow-y-auto divide-y divide-border">
            {filtered.map((c) => {
              const active = c.id === selected;
              return (
                <button
                  key={c.id}
                  onClick={() => { setSelected(c.id); cancelEdit(); }}
                  className={`w-full text-left p-4 hover:bg-secondary/60 transition ${active ? "bg-secondary" : ""}`}
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

        {/* ── Right: detail ── */}
        <div className="space-y-6 min-w-0">

          {/* Customer info */}
          <SectionCard
            title={isEditing ? "แก้ไขข้อมูลลูกค้า" : cur.name}
            action={
              isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1.5 text-sm rounded-md border border-border px-3 py-1.5 hover:bg-secondary"
                  >
                    <X className="h-3.5 w-3.5" /> ยกเลิก
                  </button>
                  <button
                    onClick={saveEdit}
                    className="flex items-center gap-1.5 text-sm rounded-md bg-primary text-primary-foreground px-3 py-1.5 hover:opacity-90"
                  >
                    <Save className="h-3.5 w-3.5" /> บันทึก
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-1.5 text-sm rounded-md border border-border px-3 py-1.5 hover:bg-secondary"
                  >
                    <Pencil className="h-3.5 w-3.5" /> แก้ไข
                  </button>
                  <button
                    onClick={() => setDeleteId(cur.id)}
                    className="flex items-center gap-1.5 text-sm rounded-md border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> ลบ
                  </button>
                </div>
              )
            }
          >
            {isEditing && editData ? (
              /* ── Edit form ── */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">ชื่อ-นามสกุล</label>
                  <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">เบอร์โทร</label>
                  <Input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">อายุ</label>
                  <Input
                    type="number"
                    value={editData.age}
                    onChange={(e) => setEditData({ ...editData, age: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">วันเยี่ยมล่าสุด</label>
                  <Input value={editData.lastVisit} onChange={(e) => setEditData({ ...editData, lastVisit: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">ยอดรวม</label>
                  <Input
                    type="number"
                    value={editData.total}
                    onChange={(e) => setEditData({ ...editData, total: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">ชำระแล้ว</label>
                  <Input
                    type="number"
                    value={editData.paid}
                    onChange={(e) => setEditData({ ...editData, paid: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">เลนส์</label>
                  <Input value={editData.lens} onChange={(e) => setEditData({ ...editData, lens: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">กรอบ</label>
                  <Input value={editData.frame} onChange={(e) => setEditData({ ...editData, frame: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">วันนัดรับ</label>
                  <Input value={editData.pickup} onChange={(e) => setEditData({ ...editData, pickup: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">สถานะ</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as Customer["status"] })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  >
                    {Object.entries(STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <Stat label="รหัสลูกค้า" value={cur.id} />
                <Stat label="เบอร์โทร" value={cur.phone} />
                <Stat label="อายุ" value={`${cur.age} ปี`} />
                <Stat label="เยี่ยมล่าสุด" value={cur.lastVisit} />
                <Stat label="ใบงานล่าสุด" value={`#${cur.jobNo}`} />
                <Stat label="ยอดรวม" value={`${cur.total.toLocaleString()} บาท`} />
                <Stat label="ชำระแล้ว" value={`${cur.paid.toLocaleString()} บาท`} />
                <Stat
                  label="คงเหลือ"
                  value={`${(cur.total - cur.paid).toLocaleString()} บาท`}
                  highlight={cur.total > cur.paid}
                />
              </div>
            )}
          </SectionCard>

          {/* Current job — show only in view mode */}
          {!isEditing && (
            <SectionCard title="ใบงานปัจจุบัน">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Detail label="เลนส์" value={cur.lens} />
                <Detail label="กรอบ" value={cur.frame} />
                <Detail label="วันนัดรับ" value={cur.pickup} icon={<Calendar className="h-4 w-4" />} />
                <Detail label="สถานะงาน" value={STATUS_LABEL[cur.status]} />
              </div>
            </SectionCard>
          )}

          {/* Rx history */}
          {!isEditing && (
            <SectionCard title="ประวัติค่าสายตา">
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
                        <td className="px-3 py-2">{r.sphR}</td><td className="px-3 py-2">{r.cylR}</td>
                        <td className="px-3 py-2">{r.axR}</td><td className="px-3 py-2">{r.addR}</td>
                        <td className="px-3 py-2">{r.sphL}</td><td className="px-3 py-2">{r.cylL}</td>
                        <td className="px-3 py-2">{r.axL}</td><td className="px-3 py-2">{r.addL}</td>
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
          )}

          {/* Visit / order history */}
          {!isEditing && (
            <SectionCard title="ประวัติการสั่งซื้อ / ใบงาน">
              <div className="space-y-3">
                {visits.map((v) => (
                  <button
                    key={v.jobNo}
                    onClick={() => navigate({ to: "/jobs/$id", params: { id: String(v.jobNo) } })}
                    className="w-full text-left rounded-lg border border-border p-4 hover:bg-secondary/60 transition group"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-primary">ใบงาน #{v.jobNo}</span>
                        <span className="text-xs text-muted-foreground">{v.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{v.price.toLocaleString()} บาท</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition" />
                      </div>
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
                          <span
                            key={f}
                            className="inline-flex items-center gap-1.5 text-xs rounded-md border border-border px-2 py-1 text-muted-foreground"
                          >
                            <FileIcon className="h-3.5 w-3.5 text-primary" />{f}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
                {visits.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">ยังไม่มีประวัติการสั่งซื้อ</div>
                )}
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {/* ── Delete confirm ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-xl mx-4 p-6 space-y-4">
            <h2 className="font-semibold text-foreground">ยืนยันการลบ</h2>
            <p className="text-sm text-muted-foreground">
              ต้องการลบ{" "}
              <span className="font-medium text-foreground">
                {customers.find((c) => c.id === deleteId)?.name}
              </span>{" "}
              ออกจากระบบ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 rounded-lg bg-destructive text-destructive-foreground px-4 py-2 text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> ลบ
              </button>
            </div>
          </div>
        </div>
      )}
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