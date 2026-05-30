import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Banknote, ClipboardList, Users, Package, Loader2,
  ArrowUpRight, ArrowDownRight,
  Clock, RefreshCw, Wrench, ShieldCheck, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "รายงาน — MARINA OPTICAL" }] }),
  component: ReportsPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "waiting_lens" | "in_progress" | "qc_done" | "ready" | "delivered" | "cancelled";

interface Stats {
  totalCustomers: number;
  totalOrders: number;
  revenueThisMonth: number;
  unpaidAmount: number;
  recentOrders: {
    id: number;
    job_no: number;
    customer_id: string;
    status: string;
    price: number;
    date: string;
  }[];
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
}

// ─── Status config ────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const THAI_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.",
                     "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

const PERIODS = ["7 วัน", "30 วัน", "3 เดือน", "6 เดือน", "1 ปี"] as const;
type Period = typeof PERIODS[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function periodToDate(period: Period): Date {
  const d = new Date();
  if (period === "7 วัน")   d.setDate(d.getDate() - 7);
  if (period === "30 วัน")  d.setDate(d.getDate() - 30);
  if (period === "3 เดือน") d.setMonth(d.getMonth() - 3);
  if (period === "6 เดือน") d.setMonth(d.getMonth() - 6);
  if (period === "1 ปี")    d.setFullYear(d.getFullYear() - 1);
  return d;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, trend, trendValue, icon: Icon, loading,
}: {
  label: string; value: string; sub?: string;
  trend?: "up" | "down"; trendValue?: string;
  icon: React.ElementType; loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div>
        {loading
          ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          : <p className="text-2xl font-bold text-foreground">{value}</p>
        }
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {trend && trendValue && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-green-600" : "text-destructive"}`}>
          {trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {trendValue}
        </div>
      )}
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-primary">รายได้: {payload[0]?.value?.toLocaleString()} ฿</p>
      <p className="text-muted-foreground">ใบงาน: {payload[1]?.value} รายการ</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function ReportsPage() {
  const [period, setPeriod]   = useState<Period>("6 เดือน");
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, [period]);

  async function fetchStats() {
    setLoading(true);
    const since = periodToDate(period).toISOString().split("T")[0];
    const now   = new Date();

    const { count: totalCustomers } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    const { data: visits } = await supabase
      .from("visits")
      .select("id, job_no, customer_id, status, price, paid, discount, date")
      .gte("date", since)
      .order("date", { ascending: false });

    const rows = visits ?? [];

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString().split("T")[0];

    const revenueThisMonth = rows
      .filter((r) => r.date >= thisMonthStart)
      .reduce((sum, r) => sum + Number(r.price ?? 0), 0);

    const unpaidAmount = rows.reduce((sum, r) => {
      const remaining = Number(r.price ?? 0) - Number(r.discount ?? 0) - Number(r.paid ?? 0);
      return sum + (remaining > 0 ? remaining : 0);
    }, 0);

    const monthMap = new Map<string, { label: string; revenue: number; orders: number }>();
    rows.forEach((r) => {
      const d   = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      if (!monthMap.has(key)) monthMap.set(key, { label: THAI_MONTHS[d.getMonth()], revenue: 0, orders: 0 });
      const entry = monthMap.get(key)!;
      entry.revenue += Number(r.price ?? 0);
      entry.orders  += 1;
    });
    const monthlyRevenue = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ month: v.label, revenue: v.revenue, orders: v.orders }));

    setStats({
      totalCustomers:  totalCustomers ?? 0,
      totalOrders:     rows.length,
      revenueThisMonth,
      unpaidAmount,
      recentOrders: rows.slice(0, 5).map((r) => ({
        id:          r.id,
        job_no:      r.job_no,
        customer_id: r.customer_id,
        status:      r.status,
        price:       Number(r.price),
        date:        r.date,
      })),
      monthlyRevenue,
    });
    setLoading(false);
  }

  return (
    <AppShell title="รายงาน" subtitle="ภาพรวมและสถิติการดำเนินงาน">
      <div className="p-6 space-y-6">

        {/* Period selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-1">ช่วงเวลา</span>
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors
                ${period === p
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-secondary"
                }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="รายได้เดือนนี้"   value={`${(stats?.revenueThisMonth ?? 0).toLocaleString()} ฿`} sub="จากใบงานที่บันทึก" icon={Banknote}     loading={loading} />
          <StatCard label="ใบงานในช่วงนี้"   value={`${stats?.totalOrders ?? 0}`}                           sub="รายการ"           icon={ClipboardList} loading={loading} />
          <StatCard label="ลูกค้าทั้งหมด"    value={`${stats?.totalCustomers ?? 0}`}                         sub="คน"               icon={Users}         loading={loading} />
          <StatCard label="ยอดค้างชำระ"      value={`${(stats?.unpaidAmount ?? 0).toLocaleString()} ฿`}      sub="price - discount - paid" icon={Package} loading={loading} />
        </div>

        {/* Monthly chart */}
        <SectionCard title="รายได้และจำนวนใบงานรายเดือน">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.monthlyRevenue ?? []} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left"  tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<RevenueTooltip />} cursor={{ fill: "#f9fafb" }} />
                    <Bar yAxisId="left"  dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
                    <Bar yAxisId="right" dataKey="orders"  fill="#14b8a6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-6 mt-3 justify-center">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-3 w-3 rounded-sm bg-indigo-500 inline-block" /> รายได้ (฿)
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-3 w-3 rounded-sm bg-teal-500 inline-block" /> จำนวนใบงาน
                </div>
              </div>
            </>
          )}
        </SectionCard>

        {/* Recent orders */}
        <SectionCard title="ใบงานล่าสุด">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/70">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">เลขใบงาน</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">ลูกค้า</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">สถานะ</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">ยอดรวม</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">วันที่</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-t border-border">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="h-4 bg-secondary rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  : stats?.recentOrders.map((o, i) => (
                      <tr key={o.id} className={`border-t border-border hover:bg-secondary/40 ${i % 2 !== 0 ? "bg-secondary/20" : ""}`}>
                        <td className="px-4 py-3 font-bold text-primary">#{o.job_no}</td>
                        <td className="px-4 py-3 text-foreground">{o.customer_id}</td>
                        <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                        <td className="px-4 py-3 text-right font-semibold">{o.price.toLocaleString()} ฿</td>
                        <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </SectionCard>

      </div>
    </AppShell>
  );
}