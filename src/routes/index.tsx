import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search, SlidersHorizontal, Plus, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, Wrench, ShieldCheck, Package, Truck,
  Glasses, ArrowUpDown, FileDown, RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ใบงานทั้งหมด — MARINA OPTICAL" },
      { name: "description", content: "รายการใบงานทั้งหมด" },
    ],
  }),
  component: Index,
});

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderStatus =
  | "รับออเดอร์แล้ว"
  | "รอเลนส์"
  | "กำลังประกอบ"
  | "QC แล้ว"
  | "พร้อมรับ"
  | "ส่งมอบแล้ว";

interface Order {
  id: number;
  customer: string;
  phone: string;
  lensType: string;
  brand: string;
  total: number;
  deposit: number;
  remaining: number;
  orderDate: string;
  pickupDate: string;
  status: OrderStatus;
  staff: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ORDERS: Order[] = [
  { id: 217, customer: "คุณวิเชียร เกิดสมบัติ",   phone: "082-447-8801", lensType: "PROGRESSIVE", brand: "RODENSTOCK", total: 6500,  deposit: 3000, remaining: 3500, orderDate: "12/05/2567", pickupDate: "19/05/2567", status: "รอเลนส์",         staff: "คุณมารินา" },
  { id: 216, customer: "คุณสมหญิง ประดิษฐ์ดี",    phone: "089-123-4567", lensType: "SINGLE VISION", brand: "HOYA",       total: 3200,  deposit: 1500, remaining: 1700, orderDate: "11/05/2567", pickupDate: "16/05/2567", status: "QC แล้ว",          staff: "คุณกิตติพงศ์" },
  { id: 215, customer: "คุณประเสริฐ วงศ์ทอง",     phone: "091-234-5678", lensType: "PROGRESSIVE", brand: "ZEISS",       total: 9800,  deposit: 5000, remaining: 4800, orderDate: "10/05/2567", pickupDate: "17/05/2567", status: "กำลังประกอบ",     staff: "คุณมารินา" },
  { id: 214, customer: "คุณนิภา สุขสวัสดิ์",      phone: "086-345-6789", lensType: "BIFOCAL",      brand: "HOYA",       total: 4500,  deposit: 2000, remaining: 2500, orderDate: "09/05/2567", pickupDate: "15/05/2567", status: "พร้อมรับ",         staff: "คุณมารินา" },
  { id: 213, customer: "คุณอานนท์ รุ่งเรือง",     phone: "083-456-7890", lensType: "PROGRESSIVE", brand: "RODENSTOCK", total: 11200, deposit: 6000, remaining: 5200, orderDate: "08/05/2567", pickupDate: "14/05/2567", status: "ส่งมอบแล้ว",        staff: "คุณกิตติพงศ์" },
  { id: 212, customer: "คุณสุภาพ เจริญผล",        phone: "087-567-8901", lensType: "SINGLE VISION", brand: "ZEISS",     total: 2800,  deposit: 1000, remaining: 1800, orderDate: "07/05/2567", pickupDate: "13/05/2567", status: "ส่งมอบแล้ว",        staff: "คุณมารินา" },
  { id: 211, customer: "คุณชัยรัตน์ สิงห์ทอง",   phone: "092-678-9012", lensType: "OFFICE LENS",  brand: "HOYA",       total: 5600,  deposit: 2500, remaining: 3100, orderDate: "06/05/2567", pickupDate: "12/05/2567", status: "ส่งมอบแล้ว",        staff: "คุณกิตติพงศ์" },
  { id: 210, customer: "คุณวิไลวรรณ พรมมา",       phone: "084-789-0123", lensType: "PROGRESSIVE", brand: "RODENSTOCK", total: 8400,  deposit: 4000, remaining: 4400, orderDate: "05/05/2567", pickupDate: "11/05/2567", status: "ส่งมอบแล้ว",        staff: "คุณมารินา" },
  { id: 209, customer: "คุณธนา บุญส่ง",           phone: "095-890-1234", lensType: "BIFOCAL",      brand: "ZEISS",      total: 6100,  deposit: 3000, remaining: 3100, orderDate: "04/05/2567", pickupDate: "10/05/2567", status: "ส่งมอบแล้ว",        staff: "คุณกิตติพงศ์" },
  { id: 208, customer: "คุณมาลี อินทะวงศ์",       phone: "081-901-2345", lensType: "SINGLE VISION", brand: "HOYA",      total: 1900,  deposit: 1000, remaining:  900, orderDate: "03/05/2567", pickupDate: "09/05/2567", status: "ส่งมอบแล้ว",        staff: "คุณมารินา" },
  { id: 207, customer: "คุณพิชัย สุขสันต์",       phone: "098-012-3456", lensType: "PROGRESSIVE", brand: "ZEISS",       total: 12500, deposit: 6000, remaining: 6500, orderDate: "02/05/2567", pickupDate: "08/05/2567", status: "ส่งมอบแล้ว",        staff: "คุณกิตติพงศ์" },
  { id: 206, customer: "คุณรัตนา ศรีวิชัย",       phone: "085-123-4560", lensType: "OFFICE LENS",  brand: "HOYA",       total: 3800,  deposit: 2000, remaining: 1800, orderDate: "01/05/2567", pickupDate: "07/05/2567", status: "ส่งมอบแล้ว",        staff: "คุณมารินา" },
  { id: 218, customer: "คุณสมศักดิ์ บัวทอง",      phone: "088-234-5671", lensType: "PROGRESSIVE", brand: "HOYA",        total: 7200,  deposit: 3500, remaining: 3700, orderDate: "13/05/2567", pickupDate: "20/05/2567", status: "รับออเดอร์แล้ว",   staff: "คุณมารินา" },
  { id: 219, customer: "คุณกนกวรรณ ดีมาก",        phone: "090-345-6782", lensType: "SINGLE VISION", brand: "RODENSTOCK", total: 4100, deposit: 2000, remaining: 2100, orderDate: "13/05/2567", pickupDate: "18/05/2567", status: "รับออเดอร์แล้ว",   staff: "คุณกิตติพงศ์" },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, {
  icon: React.ReactNode;
  bg: string;
  text: string;
  border: string;
}> = {
  "รับออเดอร์แล้ว": {
    icon: <Clock className="h-3.5 w-3.5" />,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  "รอเลนส์": {
    icon: <RefreshCw className="h-3.5 w-3.5" />,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  "กำลังประกอบ": {
    icon: <Wrench className="h-3.5 w-3.5" />,
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  "QC แล้ว": {
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  "พร้อมรับ": {
    icon: <Package className="h-3.5 w-3.5" />,
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  "ส่งมอบแล้ว": {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
};

const ALL_STATUSES: OrderStatus[] = [
  "รับออเดอร์แล้ว",
  "รอเลนส์",
  "กำลังประกอบ",
  "QC แล้ว",
  "พร้อมรับ",
  "ส่งมอบแล้ว",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap
        ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.icon}
      {status}
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

const PAGE_SIZE = 10;

// ─── Main component ───────────────────────────────────────────────────────────

function Index() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ทั้งหมด">("ทั้งหมด");
  const [staffFilter, setStaffFilter] = useState("ทั้งหมด");
  const [sortKey, setSortKey] = useState<keyof Order>("id");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);

  const staffList = useMemo(
    () => ["ทั้งหมด", ...Array.from(new Set(MOCK_ORDERS.map((o) => o.staff)))],
    [],
  );

  const filtered = useMemo(() => {
    let rows = [...MOCK_ORDERS];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (o) =>
          o.customer.toLowerCase().includes(q) ||
          String(o.id).includes(q) ||
          o.phone.includes(q),
      );
    }
    if (statusFilter !== "ทั้งหมด") rows = rows.filter((o) => o.status === statusFilter);
    if (staffFilter !== "ทั้งหมด") rows = rows.filter((o) => o.staff === staffFilter);
    rows.sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });
    return rows;
  }, [search, statusFilter, staffFilter, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: keyof Order) {
    if (sortKey === key) setSortAsc((p) => !p);
    else { setSortKey(key); setSortAsc(false); }
    setPage(1);
  }

  function handleFilterChange() {
    setPage(1);
  }

  // summary stats
  const inProgress = MOCK_ORDERS.filter(
    (o) => !["ส่งมอบแล้ว"].includes(o.status),
  ).length;
  const readyToPickup = MOCK_ORDERS.filter((o) => o.status === "พร้อมรับ").length;
  const totalRevenue = MOCK_ORDERS.reduce((s, o) => s + o.total, 0);

  return (
    <AppShell
      title={
        <div className="flex items-center gap-3">
          <Glasses className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold text-primary leading-none">MARINA OPTICAL</span>
        </div>
      }
      subtitle="รายการใบงานทั้งหมด — All Vision Records"
    >
      <div className="p-6 space-y-6">

        {/* ── Summary stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="ใบงานทั้งหมด"     value={MOCK_ORDERS.length} sub="รายการ" />
          <StatCard label="กำลังดำเนินการ"   value={inProgress}        sub="รายการ" />
          <StatCard label="พร้อมรับแล้ว"      value={readyToPickup}     sub="รอลูกค้า" />
          <StatCard
            label="ยอดรวมเดือนนี้"
            value={`${totalRevenue.toLocaleString()} ฿`}
            sub="พ.ค. 2567"
          />
        </div>

        {/* ── Filters ── */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="ค้นหา ชื่อลูกค้า, เบอร์โทร, เลขใบงาน…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
                className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>

            {/* Staff filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select
                value={staffFilter}
                onChange={(e) => { setStaffFilter(e.target.value); handleFilterChange(); }}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                {staffList.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="ml-auto flex gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
                <FileDown className="h-4 w-4" /> ส่งออก Excel
              </button>
<Link
  to="/jobs/new"
  className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:opacity-90"
>
  <Plus className="h-4 w-4" /> สร้างใบงานใหม่
</Link>
            </div>
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2">
            {(["ทั้งหมด", ...ALL_STATUSES] as const).map((s) => {
              const isActive = statusFilter === s;
              const count =
                s === "ทั้งหมด"
                  ? MOCK_ORDERS.length
                  : MOCK_ORDERS.filter((o) => o.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s as typeof statusFilter); handleFilterChange(); }}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors
                    ${isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                >
                  {s}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold
                    ${isActive ? "bg-white/20 text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/70 text-secondary-foreground">
                <tr>
                  {[
                    { label: "เลขใบงาน", key: "id"          as keyof Order, w: "w-24"  },
                    { label: "วันที่",    key: "orderDate"   as keyof Order, w: "w-28"  },
                    { label: "ลูกค้า",   key: "customer"    as keyof Order, w: ""      },
                    { label: "ประเภทเลนส์", key: "lensType" as keyof Order, w: "w-40"  },
                    { label: "สถานะ",    key: "status"      as keyof Order, w: "w-40"  },
                    { label: "ยอดรวม",   key: "total"       as keyof Order, w: "w-28"  },
                    { label: "คงเหลือ",  key: "remaining"   as keyof Order, w: "w-28"  },
                    { label: "นัดรับ",   key: "pickupDate"  as keyof Order, w: "w-28"  },
                    { label: "ผู้รับงาน",key: "staff"       as keyof Order, w: "w-28"  },
                  ].map(({ label, key, w }) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      className={`px-4 py-3 text-left font-medium cursor-pointer select-none hover:bg-secondary group ${w}`}
                    >
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
                    <tr
                      key={order.id}
                      className={`border-t border-border hover:bg-secondary/50 transition-colors
                        ${i % 2 === 0 ? "" : "bg-secondary/20"}`}
                    >
                      <td className="px-4 py-3 font-bold text-primary">
                    <Link to="/jobs/$id" params={{ id: String(order.id) }} className="hover:underline">
  #{order.id}
</Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{order.orderDate}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{order.customer}</div>
                        <div className="text-xs text-muted-foreground">{order.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{order.lensType}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {order.total.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${order.remaining > 0 ? "text-destructive" : "text-green-600"}`}>
                        {order.remaining.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{order.pickupDate}</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.staff}</td>
                      <td className="px-4 py-3">
           <Link
  to="/jobs/$id"
  params={{ id: String(order.id) }}
  className="rounded-md border border-primary text-primary px-3 py-1 text-xs font-medium hover:bg-primary/10 transition-colors"
>
  เปิดใบงาน
</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-secondary/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              แสดง {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-border px-2 py-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
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
                    <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n as number)}
                      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors
                        ${page === n
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-foreground hover:bg-secondary"
                        }`}
                    >
                      {n}
                    </button>
                  ),
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-border px-2 py-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}