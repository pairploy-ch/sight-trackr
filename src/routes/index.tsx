import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search, SlidersHorizontal, Plus, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, Wrench, ShieldCheck, Package,
  ArrowUpDown, FileDown, RefreshCw, Loader2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ใบงานทั้งหมด — MARINA OPTICAL" },
      { name: "description", content: "รายการใบงานทั้งหมด" },
    ],
  }),
  component: Index,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "waiting_lens" | "in_progress" | "qc_done" | "ready" | "delivered" | "cancelled";

interface Order {
  id: number;
  job_no: number;
  customer: string;
  phone: string;
  lens_type: string;
  lens_brand: string;
  total: number;
  deposit: number;
  remaining: number;
  date: string;
  pickup: string;
  status: OrderStatus;
  staff: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  pending:      { label: "รับออเดอร์แล้ว", icon: <Clock className="h-3.5 w-3.5" />,       bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  waiting_lens: { label: "รอเลนส์",         icon: <RefreshCw className="h-3.5 w-3.5" />,    bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  in_progress:  { label: "กำลังประกอบ",     icon: <Wrench className="h-3.5 w-3.5" />,       bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  qc_done:      { label: "QC แล้ว",          icon: <ShieldCheck className="h-3.5 w-3.5" />,  bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  ready:        { label: "พร้อมรับ",         icon: <Package className="h-3.5 w-3.5" />,      bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200"   },
  delivered:    { label: "ส่งมอบแล้ว",       icon: <CheckCircle2 className="h-3.5 w-3.5" />, bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  cancelled:    { label: "ยกเลิก",           icon: <Clock className="h-3.5 w-3.5" />,        bg: "bg-gray-50",   text: "text-gray-500",   border: "border-gray-200"   },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as OrderStatus[];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/50 px-5 py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function exportToExcel(rows: Order[]) {
  const data = rows.map((o) => ({
    "เลขใบงาน":       o.job_no,
    "วันที่สั่ง":     o.date,
    "ชื่อลูกค้า":     o.customer,
    "เบอร์โทร":       o.phone,
    "ประเภทเลนส์":    o.lens_type,
    "ยี่ห้อ":         o.lens_brand,
    "ยอดรวม (บาท)":   o.total,
    "มัดจำ (บาท)":    o.deposit,
    "คงเหลือ (บาท)":  o.remaining,
    "วันนัดรับ":      o.pickup,
    "สถานะ":          STATUS_CONFIG[o.status]?.label ?? o.status,
   
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [{ wch: 10 },{ wch: 14 },{ wch: 24 },{ wch: 14 },{ wch: 16 },{ wch: 12 },{ wch: 14 },{ wch: 12 },{ wch: 14 },{ wch: 14 },{ wch: 18 },{ wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "ใบงาน");
  const summary = [
    { "รายการ": "ใบงานทั้งหมด",        "จำนวน": rows.length },
    { "รายการ": "ยอดรวมทั้งหมด (บาท)", "จำนวน": rows.reduce((s, o) => s + o.total, 0) },
    { "รายการ": "รับมัดจำแล้ว (บาท)",  "จำนวน": rows.reduce((s, o) => s + o.deposit, 0) },
    { "รายการ": "ยังค้างชำระ (บาท)",   "จำนวน": rows.reduce((s, o) => s + o.remaining, 0) },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summary);
  wsSummary["!cols"] = [{ wch: 24 },{ wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "สรุป");
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;
  XLSX.writeFile(wb, `marina-optical-orders-${dateStr}.xlsx`);
}

const PAGE_SIZE = 10;

// ─── Main ─────────────────────────────────────────────────────────────────────

function Index() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);

  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ทั้งหมด">("ทั้งหมด");
  const [staffFilter, setStaffFilter]   = useState("ทั้งหมด");
  const [sortKey, setSortKey]           = useState<keyof Order>("job_no");
  const [sortAsc, setSortAsc]           = useState(false);
  const [page, setPage]                 = useState(1);
  const [exporting, setExporting]       = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("visits")
        .select("*, customers(name, phone)")
        .order("job_no", { ascending: false });

      if (!error && data) {
        setOrders(data.map((v) => {
          const c = v.customers as any;
          const total   = v.price   ?? 0;
          const deposit = v.deposit ?? 0;
          return {
            id:         v.id,
            job_no:     v.job_no,
            customer:   c?.name  ?? "—",
            phone:      c?.phone ?? "—",
            lens_type:  v.lens_type  ?? "—",
            lens_brand: v.lens_brand ?? "—",
            total,
            deposit,
            remaining:  Math.max(0, total - deposit),
            date:       v.date   ?? "",
            pickup:     v.pickup ?? "",
            status:     (v.status as OrderStatus) ?? "pending",
            staff:      v.staff  ?? "—",
          };
        }));
      }
      setLoading(false);
    }
    load();
  }, []);

  const staffList = useMemo(
    () => ["ทั้งหมด", ...Array.from(new Set(orders.map((o) => o.staff).filter((s) => s !== "—")))],
    [orders],
  );

  const filtered = useMemo(() => {
    let rows = [...orders];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((o) =>
        o.customer.toLowerCase().includes(q) ||
        String(o.job_no).includes(q) ||
        o.phone.includes(q),
      );
    }
    if (statusFilter !== "ทั้งหมด") rows = rows.filter((o) => o.status === statusFilter);
    if (staffFilter !== "ทั้งหมด")  rows = rows.filter((o) => o.staff  === staffFilter);
    rows.sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });
    return rows;
  }, [orders, search, statusFilter, staffFilter, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: keyof Order) {
    if (sortKey === key) setSortAsc((p) => !p);
    else { setSortKey(key); setSortAsc(false); }
    setPage(1);
  }

  function handleExport() {
    setExporting(true);
    setTimeout(() => { exportToExcel(filtered); setExporting(false); }, 50);
  }

  const inProgress    = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length;
  const readyToPickup = orders.filter((o) => o.status === "ready").length;
  const totalRevenue  = orders.reduce((s, o) => s + o.total, 0);

  return (
    <AppShell
      title={<span className="text-2xl font-bold text-primary leading-none">MARINA OPTICAL</span>}
      subtitle="รายการใบงานทั้งหมด"
    >
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="ใบงานทั้งหมด"   value={orders.length}                          sub="รายการ"  />
          <StatCard label="กำลังดำเนินการ" value={inProgress}                             sub="รายการ"  />
          <StatCard label="พร้อมรับแล้ว"   value={readyToPickup}                          sub="รอลูกค้า" />
          <StatCard label="ยอดรวมทั้งหมด"  value={`${totalRevenue.toLocaleString()} ฿`}  sub="ทุกใบงาน" />
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="ค้นหา ชื่อลูกค้า, เบอร์โทร, เลขใบงาน…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            {/* <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select
                value={staffFilter}
                onChange={(e) => { setStaffFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                {staffList.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div> */}
            <div className="ml-auto flex gap-3">
              <button
                onClick={handleExport}
                disabled={exporting || filtered.length === 0}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileDown className={`h-4 w-4 ${exporting ? "animate-bounce" : ""}`} />
                {exporting ? "กำลังส่งออก…" : `ส่งออก Excel${filtered.length < orders.length ? ` (${filtered.length})` : ""}`}
              </button>
              <Link to="/jobs/new" className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:opacity-90">
                <Plus className="h-4 w-4" /> สร้างใบงานใหม่
              </Link>
            </div>
          </div>

          {/* Status pills */}
          <div className="flex flex-wrap gap-2">
            {(["ทั้งหมด", ...ALL_STATUSES] as const).map((s) => {
              const isActive = statusFilter === s;
              const count = s === "ทั้งหมด"
                ? orders.length
                : orders.filter((o) => o.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s as typeof statusFilter); setPage(1); }}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors
                    ${isActive ? "bg-primary text-primary-foreground border-primary shadow-sm" : "border-border text-muted-foreground hover:bg-secondary"}`}
                >
                  {s === "ทั้งหมด" ? "ทั้งหมด" : STATUS_CONFIG[s as OrderStatus].label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? "bg-white/20 text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> กำลังโหลด...
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/70 text-secondary-foreground">
                <tr>
                  {[
                    { label: "เลขใบงาน",    key: "job_no"    as keyof Order, w: "w-24" },
                    { label: "วันที่",       key: "date"      as keyof Order, w: "w-28" },
                    { label: "ลูกค้า",      key: "customer"  as keyof Order, w: ""     },
                    { label: "ประเภทเลนส์", key: "lens_type" as keyof Order, w: "w-40" },
                    { label: "สถานะ",       key: "status"    as keyof Order, w: "w-40" },
                    { label: "ยอดรวม",      key: "total"     as keyof Order, w: "w-28" },
                    { label: "คงเหลือ",     key: "remaining" as keyof Order, w: "w-28" },
                    { label: "นัดรับ",      key: "pickup"    as keyof Order, w: "w-28" },
               
                  ].map(({ label, key, w }) => (
                    <th key={key} onClick={() => toggleSort(key)} className={`px-4 py-3 text-left font-medium cursor-pointer select-none hover:bg-secondary group ${w}`}>
                      <span className="inline-flex items-center gap-1">
                        {label}
                        <ArrowUpDown className={`h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity ${sortKey === key ? "opacity-100 text-primary" : ""}`} />
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-medium w-20">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-16 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
                      ไม่พบรายการที่ตรงกับการค้นหา
                    </td>
                  </tr>
                ) : (
                  paginated.map((order, i) => (
                    <tr key={order.id} className={`border-t border-border hover:bg-secondary/50 transition-colors ${i % 2 === 0 ? "" : "bg-secondary/20"}`}>
                      <td className="px-4 py-3 font-bold text-primary">
                        <Link to="/jobs/$id" params={{ id: String(order.job_no) }} className="hover:underline">#{order.job_no}</Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{order.customer}</div>
                        <div className="text-xs text-muted-foreground">{order.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{order.lens_type}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-right font-semibold">{order.total.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${order.remaining > 0 ? "text-destructive" : "text-green-600"}`}>
                        {order.remaining.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{order.pickup}</td>
                      {/* <td className="px-4 py-3 text-muted-foreground">{order.staff}</td> */}
                      <td className="px-4 py-3">
                        <Link to="/jobs/$id" params={{ id: String(order.job_no) }} className="rounded-md border border-primary text-primary px-3 py-1 text-xs font-medium hover:bg-primary/10 transition-colors">
                          เปิด
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          {!loading && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-secondary/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              แสดง {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border border-border px-2 py-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce<(number | "…")[]>((acc, n, i, arr) => {
                  if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) =>
                  n === "…" ? (
                    <span key={`e-${i}`} className="px-2 text-muted-foreground">…</span>
                  ) : (
                    <button key={n} onClick={() => setPage(n as number)} className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${page === n ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:bg-secondary"}`}>
                      {n}
                    </button>
                  ),
                )}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-md border border-border px-2 py-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}