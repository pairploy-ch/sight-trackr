import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Banknote, ClipboardList,
  Users, Package, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [{ title: "รายงาน — MARINA OPTICAL" }],
  }),
  component: ReportsPage,
});

// ─── Mock data ────────────────────────────────────────────────────────────────

const MONTHLY_REVENUE = [
  { month: "ต.ค.", revenue: 48200, orders: 18 },
  { month: "พ.ย.", revenue: 52100, orders: 21 },
  { month: "ธ.ค.", revenue: 61400, orders: 25 },
  { month: "ม.ค.", revenue: 44800, orders: 17 },
  { month: "ก.พ.", revenue: 57300, orders: 22 },
  { month: "มี.ค.", revenue: 63900, orders: 26 },
  { month: "เม.ย.", revenue: 59200, orders: 23 },
  { month: "พ.ค.", revenue: 71500, orders: 29 },
];

const LENS_TYPE_DATA = [
  { name: "Progressive", value: 48, color: "#6366f1" },
  { name: "Single Vision", value: 28, color: "#14b8a6" },
  { name: "Bifocal",       value: 14, color: "#f59e0b" },
  { name: "Office Lens",   value: 10, color: "#f43f5e" },
];

const BRAND_DATA = [
  { brand: "RODENSTOCK", orders: 42 },
  { brand: "HOYA",       orders: 38 },
  { brand: "ZEISS",      orders: 29 },
  { brand: "NIKON",      orders: 14 },
  { brand: "ESSILOR",    orders: 8  },
];

const STAFF_DATA = [
  { name: "คุณมารินา",    orders: 64, revenue: 248000 },
  { name: "คุณกิตติพงศ์", orders: 57, revenue: 219000 },
  { name: "คุณสมศรี",     orders: 23, revenue: 87000  },
];

const STATUS_DATA = [
  { status: "รับออเดอร์แล้ว", count: 4  },
  { status: "รอเลนส์",        count: 7  },
  { status: "กำลังประกอบ",    count: 5  },
  { status: "QC แล้ว",        count: 3  },
  { status: "พร้อมรับ",       count: 6  },
  { status: "ส่งมอบแล้ว",     count: 94 },
];

const RECENT_ORDERS = [
  { id: 219, customer: "คุณกนกวรรณ ดีมาก",      status: "รับออเดอร์แล้ว", total: 4100,  date: "13/05/2567" },
  { id: 218, customer: "คุณสมศักดิ์ บัวทอง",    status: "รับออเดอร์แล้ว", total: 7200,  date: "13/05/2567" },
  { id: 217, customer: "คุณวิเชียร เกิดสมบัติ", status: "รอเลนส์",        total: 6500,  date: "12/05/2567" },
  { id: 216, customer: "คุณสมหญิง ประดิษฐ์ดี",  status: "QC แล้ว",        total: 3200,  date: "11/05/2567" },
  { id: 215, customer: "คุณประเสริฐ วงศ์ทอง",   status: "กำลังประกอบ",    total: 9800,  date: "10/05/2567" },
];

const STATUS_COLOR: Record<string, string> = {
  "รับออเดอร์แล้ว": "bg-blue-50 text-blue-700 border-blue-200",
  "รอเลนส์":        "bg-amber-50 text-amber-700 border-amber-200",
  "กำลังประกอบ":    "bg-orange-50 text-orange-700 border-orange-200",
  "QC แล้ว":        "bg-purple-50 text-purple-700 border-purple-200",
  "พร้อมรับ":       "bg-teal-50 text-teal-700 border-teal-200",
  "ส่งมอบแล้ว":     "bg-green-50 text-green-700 border-green-200",
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

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

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, trend, trendValue, icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down";
  trendValue?: string;
  icon: React.ElementType;
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
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {trend && trendValue && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-green-600" : "text-destructive"}`}>
          {trend === "up"
            ? <ArrowUpRight className="h-3.5 w-3.5" />
            : <ArrowDownRight className="h-3.5 w-3.5" />
          }
          {trendValue} จากเดือนที่แล้ว
        </div>
      )}
    </div>
  );
}

// ─── Period selector ──────────────────────────────────────────────────────────

const PERIODS = ["7 วัน", "30 วัน", "3 เดือน", "6 เดือน", "1 ปี"] as const;
type Period = typeof PERIODS[number];

// ─── Main ─────────────────────────────────────────────────────────────────────

function ReportsPage() {
  const [period, setPeriod] = useState<Period>("6 เดือน");

  const currentRevenue = 71500;
  const prevRevenue    = 59200;
  const revDiff        = (((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1);

  return (
    <AppShell title="รายงาน" subtitle="ภาพรวมและสถิติการดำเนินงาน">
      <div className="p-6 space-y-6">

        {/* ── Period selector ── */}
        <div className="flex items-center gap-2">
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

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="รายได้เดือนนี้"
            value={`${currentRevenue.toLocaleString()} ฿`}
            sub="พ.ค. 2567"
            trend="up"
            trendValue={`+${revDiff}%`}
            icon={Banknote}
          />
          <StatCard
            label="ใบงานทั้งหมด"
            value="119"
            sub="รายการ"
            trend="up"
            trendValue="+8.3%"
            icon={ClipboardList}
          />
          <StatCard
            label="ลูกค้าใหม่"
            value="14"
            sub="คนเดือนนี้"
            trend="down"
            trendValue="-2 คน"
            icon={Users}
          />
          <StatCard
            label="ยอดค้างชำระ"
            value="38,400 ฿"
            sub="19 ใบงาน"
            trend="up"
            trendValue="+3,200 ฿"
            icon={Package}
          />
        </div>

        {/* ── Revenue + Orders chart ── */}
        <SectionCard title="รายได้และจำนวนใบงานรายเดือน">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_REVENUE} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary, #e5e7eb)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<RevenueTooltip />} cursor={{ fill: "var(--color-background-secondary, #f9fafb)" }} />
                <Bar yAxisId="left"  dataKey="revenue" name="รายได้ (฿)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="orders"  name="ใบงาน"      fill="#14b8a6" radius={[4, 4, 0, 0]} />
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
        </SectionCard>

        {/* ── Pie + Brand bar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Lens type pie */}
          <SectionCard title="สัดส่วนประเภทเลนส์">
            <div className="flex items-center gap-6">
              <div className="h-48 w-48 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={LENS_TYPE_DATA}
                      cx="50%" cy="50%"
                      innerRadius={52} outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {LENS_TYPE_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [`${v}%`, ""]}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid var(--color-border-tertiary)",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 flex-1">
                {LENS_TYPE_DATA.map((d) => (
                  <div key={d.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-sm text-foreground">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-border w-20 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${d.value}%`, background: d.color }} />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-10 text-right">{d.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Brand bar */}
          <SectionCard title="ยอดขายตามยี่ห้อเลนส์">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BRAND_DATA} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary, #e5e7eb)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="brand" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip
                    formatter={(v: number) => [`${v} ใบงาน`, "จำนวน"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border-tertiary)", fontSize: 12 }}
                    cursor={{ fill: "var(--color-background-secondary, #f9fafb)" }}
                  />
                  <Bar dataKey="orders" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* ── Staff + Status ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Staff performance */}
          <SectionCard title="ผลงานพนักงาน">
            <div className="space-y-4">
              {STAFF_DATA.map((s, i) => {
                const maxOrders = Math.max(...STAFF_DATA.map((x) => x.orders));
                return (
                  <div key={s.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="font-medium text-foreground">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{s.orders} ใบงาน</span>
                        <span className="font-semibold text-foreground">{s.revenue.toLocaleString()} ฿</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(s.orders / maxOrders) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Status distribution */}
          <SectionCard title="สถานะใบงานปัจจุบัน">
            <div className="space-y-3">
              {STATUS_DATA.map((s) => {
                const total = STATUS_DATA.reduce((sum, x) => sum + x.count, 0);
                const pct   = Math.round((s.count / total) * 100);
                return (
                  <div key={s.status} className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap w-36 justify-center ${STATUS_COLOR[s.status] ?? ""}`}>
                      {s.status}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-6 text-right">{s.count}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* ── Recent orders ── */}
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
                {RECENT_ORDERS.map((o, i) => (
                  <tr key={o.id} className={`border-t border-border hover:bg-secondary/40 ${i % 2 !== 0 ? "bg-secondary/20" : ""}`}>
                    <td className="px-4 py-3 font-bold text-primary">#{o.id}</td>
                    <td className="px-4 py-3 text-foreground">{o.customer}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[o.status] ?? ""}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{o.total.toLocaleString()} ฿</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

      </div>
    </AppShell>
  );
}