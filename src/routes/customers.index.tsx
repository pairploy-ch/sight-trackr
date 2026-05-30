import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Plus, Phone, Calendar, AlertTriangle,
  FileIcon, Pencil, Trash2, X, Save, ChevronRight, Loader2,
  Clock, RefreshCw, Wrench, ShieldCheck, Package, CheckCircle2,
} from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/customers/")({
  head: () => ({
    meta: [
      { title: "ลูกค้า — MARINA OPTICAL" },
      { name: "description", content: "รายชื่อและประวัติลูกค้าร้านแว่น" },
    ],
  }),
  component: CustomersPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  name: string;
  phone: string;
  age: number;
  last_visit: string;
  lens: string;
  frame: string;
  total: number;
  paid: number;
}

interface Visit {
  id: number;
  customer_id: string;
  job_no: number;
  date: string;
  lens: string;
  frame: string;
  pickup: string;
  price: number;
  status: string;
  issue: string | null;
  files: string[] | null;
}

interface Rx {
  id: number;
  customer_id: string;
  date: string;
  sph_r: number; cyl_r: number; ax_r: number; add_r: number;
  sph_l: number; cyl_l: number; ax_l: number; add_l: number;
  notes: string | null;
}

// ─── Status config ────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "waiting_lens" | "in_progress" | "qc_done" | "ready" | "delivered" | "cancelled";

const STATUS_CONFIG: Record<OrderStatus, {
  label: string; icon: React.ReactNode;
  bg: string; text: string; border: string;
}> = {
  pending:      { label: "รับออเดอร์แล้ว", icon: <Clock className="h-3.5 w-3.5" />,        bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  waiting_lens: { label: "รอเลนส์",         icon: <RefreshCw className="h-3.5 w-3.5" />,    bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  in_progress:  { label: "กำลังประกอบ",     icon: <Wrench className="h-3.5 w-3.5" />,       bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  qc_done:      { label: "QC แล้ว",          icon: <ShieldCheck className="h-3.5 w-3.5" />,  bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  ready:        { label: "พร้อมรับ",         icon: <Package className="h-3.5 w-3.5" />,      bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200"   },
  delivered:    { label: "ส่งมอบแล้ว",       icon: <CheckCircle2 className="h-3.5 w-3.5" />, bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  cancelled:    { label: "ยกเลิก",           icon: <Clock className="h-3.5 w-3.5" />,        bg: "bg-gray-50",   text: "text-gray-500",   border: "border-gray-200"   },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as OrderStatus];
  if (!cfg) return <span className="text-xs text-muted-foreground">{status}</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 ${props.className ?? ""}`}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CustomersPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [visits, setVisits]       = useState<Visit[]>([]);
  const [rxList, setRxList]       = useState<Rx[]>([]);
  const [loading, setLoading]     = useState(true);

  const [q, setQ]                 = useState("");
  const [selected, setSelected]   = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData]   = useState<Customer | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setCustomers(data);
        setSelected(data[0].id);
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!selected) return;
    async function loadDetail() {
      const [v, r] = await Promise.all([
        supabase.from("visits").select("*").eq("customer_id", selected).order("job_no", { ascending: false }),
        supabase.from("rx_history").select("*").eq("customer_id", selected).order("date", { ascending: false }),
      ]);
      setVisits(v.data ?? []);
      setRxList(r.data ?? []);
    }
    loadDetail();
  }, [selected]);

  const filtered = useMemo(
    () => customers.filter(
      (c) => c.name.includes(q) || c.phone.includes(q) || c.id.toLowerCase().includes(q.toLowerCase()),
    ),
    [q, customers],
  );

  const cur         = customers.find((c) => c.id === selected) ?? null;
  const latestVisit = visits[0] ?? null;

  function startEdit() {
    if (!cur) return;
    setEditData({ ...cur });
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditData(null);
  }

  async function saveEdit() {
    if (!editData) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("customers")
      .update({
        name: editData.name, phone: editData.phone, age: editData.age,
        last_visit: editData.last_visit, lens: editData.lens, frame: editData.frame,
        total: editData.total, paid: editData.paid,
      })
      .eq("id", editData.id)
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      setCustomers((prev) => prev.map((c) => (c.id === data.id ? data : c)));
      setIsEditing(false);
      setEditData(null);
    }
  }

  async function handleDelete(id: string) {
    await supabase.from("customers").delete().eq("id", id);
    const remaining = customers.filter((c) => c.id !== id);
    setCustomers(remaining);
    setSelected(remaining[0]?.id ?? null);
    setDeleteId(null);
  }

  if (loading) {
    return (
      <AppShell title="ลูกค้าทั้งหมด">
        <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> กำลังโหลด...
        </div>
      </AppShell>
    );
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
                placeholder="ค้นหา ชื่อ / เบอร์ / รหัส"
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
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>
                    <span>{c.id}</span>
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
        {cur ? (
          <div className="space-y-6 min-w-0">

            <SectionCard
              title={isEditing ? "แก้ไขข้อมูลลูกค้า" : cur.name}
              action={
                isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={cancelEdit} className="flex items-center gap-1.5 text-sm rounded-md border border-border px-3 py-1.5 hover:bg-secondary">
                      <X className="h-3.5 w-3.5" /> ยกเลิก
                    </button>
                    <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 text-sm rounded-md bg-primary text-primary-foreground px-3 py-1.5 hover:opacity-90 disabled:opacity-60">
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} บันทึก
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={startEdit} className="flex items-center gap-1.5 text-sm rounded-md border border-border px-3 py-1.5 hover:bg-secondary">
                      <Pencil className="h-3.5 w-3.5" /> แก้ไข
                    </button>
                    <button onClick={() => setDeleteId(cur.id)} className="flex items-center gap-1.5 text-sm rounded-md border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" /> ลบ
                    </button>
                  </div>
                )
              }
            >
              {isEditing && editData ? (
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
                    <Input type="number" value={editData.age} onChange={(e) => setEditData({ ...editData, age: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">วันเยี่ยมล่าสุด</label>
                    <Input type="date" value={editData.last_visit} onChange={(e) => setEditData({ ...editData, last_visit: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">ยอดรวม</label>
                    <Input type="number" value={editData.total} onChange={(e) => setEditData({ ...editData, total: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">ชำระแล้ว</label>
                    <Input type="number" value={editData.paid} onChange={(e) => setEditData({ ...editData, paid: Number(e.target.value) })} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <Stat label="รหัสลูกค้า" value={cur.id} />
                  <Stat label="เบอร์โทร" value={cur.phone} />
                  <Stat label="อายุ" value={`${cur.age} ปี`} />
                  <Stat label="เยี่ยมล่าสุด" value={cur.last_visit ?? "—"} />
                  <Stat label="ยอดรวม" value={`${cur.total.toLocaleString()} บาท`} />
                  <Stat label="ชำระแล้ว" value={`${cur.paid.toLocaleString()} บาท`} />
                  <Stat label="คงเหลือ" value={`${(cur.total - cur.paid).toLocaleString()} บาท`} highlight={cur.total > cur.paid} />
                </div>
              )}
            </SectionCard>

            {/* Latest job */}
            {!isEditing && latestVisit && (
              <SectionCard title="ใบงานปัจจุบัน">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Detail label="เลนส์" value={latestVisit.lens ?? "—"} />
                  <Detail label="กรอบ" value={latestVisit.frame ?? "—"} />
                  <Detail label="วันนัดรับ" value={latestVisit.pickup ?? "—"} icon={<Calendar className="h-4 w-4" />} />
                  <Detail label="สถานะงาน" value={<StatusBadge status={latestVisit.status} />} />
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
                      {rxList.map((r) => (
                        <tr key={r.id} className="border-t border-border">
                          <td className="px-3 py-2 font-semibold text-primary whitespace-nowrap">{r.date}</td>
                          <td className="px-3 py-2">{r.sph_r}</td><td className="px-3 py-2">{r.cyl_r}</td>
                          <td className="px-3 py-2">{r.ax_r}</td><td className="px-3 py-2">{r.add_r}</td>
                          <td className="px-3 py-2">{r.sph_l}</td><td className="px-3 py-2">{r.cyl_l}</td>
                          <td className="px-3 py-2">{r.ax_l}</td><td className="px-3 py-2">{r.add_l}</td>
                          <td className="px-3 py-2 text-muted-foreground">{r.notes ?? "—"}</td>
                        </tr>
                      ))}
                      {rxList.length === 0 && (
                        <tr><td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">ยังไม่มีประวัติ</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            )}

            {/* Visit history */}
            {!isEditing && (
              <SectionCard title="ประวัติการสั่งซื้อ / ใบงาน">
                <div className="space-y-3">
                  {visits.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => navigate({ to: "/jobs/$id", params: { id: String(v.job_no) } })}
                      className="w-full text-left rounded-lg border border-border p-4 hover:bg-secondary/60 transition group"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-primary">ใบงาน #{v.job_no}</span>
                          <span className="text-xs text-muted-foreground">{v.date}</span>
                          <StatusBadge status={v.status} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{v.price.toLocaleString()} บาท</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition" />
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">เลนส์</div>
                          <div className="font-medium">{v.lens ?? "—"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">กรอบ</div>
                          <div className="font-medium">{v.frame ?? "—"}</div>
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
                    </button>
                  ))}
                  {visits.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">ยังไม่มีประวัติการสั่งซื้อ</div>
                  )}
                </div>
              </SectionCard>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            เลือกลูกค้าเพื่อดูข้อมูล
          </div>
        )}
      </div>

      {/* Delete confirm */}
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
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
                ยกเลิก
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 rounded-lg bg-destructive text-destructive-foreground px-4 py-2 text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2">
                <Trash2 className="h-4 w-4" /> ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 font-semibold ${highlight ? "text-destructive" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function Detail({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}