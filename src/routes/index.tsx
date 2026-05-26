import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Glasses, Home, Users, FileText, History, Clock, BarChart3,
  Package, Settings, UserCog, ScanBarcode, Menu, Bell, ChevronDown,
  CheckCircle2, Circle, FileIcon, Plus, Save, FilePlus, Printer,
  FileDown, Send, Trash2, Calendar, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const navItems = [
  { icon: Home, label: "หน้าหลัก", active: true },
  { icon: Users, label: "ลูกค้า" },
  { icon: FileText, label: "ใบงาน / ใบสั่งเลนส์", hasChild: true },
  { icon: History, label: "ประวัติลูกค้า", hasChild: true },
  { icon: Clock, label: "งานที่กำลังดำเนินการ", hasChild: true },
  { icon: BarChart3, label: "รายงาน", hasChild: true },
  { icon: Package, label: "สินค้า / เลนส์", hasChild: true },
  { icon: Settings, label: "ตั้งค่า", hasChild: true },
  { icon: UserCog, label: "ผู้ใช้งาน" },
];

const statusSteps = [
  { label: "รับออเดอร์แล้ว", time: "12/05/2567 14:32", state: "done" },
  { label: "รอเลนส์", time: "12/05/2567 15:10", state: "current" },
  { label: "กำลังประกอบ", state: "pending" },
  { label: "QC แล้ว", state: "pending" },
  { label: "พร้อมรับ", state: "pending" },
  { label: "ส่งมอบแล้ว", state: "pending" },
];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="px-5 py-3 border-b border-border">
        <h2 className="text-base font-semibold text-primary">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3">
      <label className="text-sm text-muted-foreground">{label}</label>
      <div>{children}</div>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 ${props.className ?? ""}`}
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
    >
      {children}
    </select>
  );
}

function RxTable({ rows, headers }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-secondary-foreground">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border">
              {row.map((c, j) => (
                <td key={j} className={`px-3 py-2 ${j === 0 ? "font-semibold text-primary" : "text-foreground"}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Index() {
  const [sidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0"} shrink-0 bg-sidebar text-sidebar-foreground flex flex-col transition-all`}>
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="rounded-lg bg-sidebar-primary p-2"><Glasses className="h-6 w-6 text-sidebar-primary-foreground" /></div>
          <div>
            <div className="font-bold tracking-wide">MARINA OPTICAL</div>
            <div className="text-xs text-sidebar-foreground/70">VISION CARE SYSTEM</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((it) => (
            <button
              key={it.label}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                it.active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent"
              }`}
            >
              <span className="flex items-center gap-3"><it.icon className="h-4 w-4" />{it.label}</span>
              {it.hasChild && <ChevronRight className="h-4 w-4 opacity-60" />}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-4">
          <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-sidebar-border/60 bg-sidebar-accent/40 px-3 py-3 text-sm hover:bg-sidebar-accent">
            <ScanBarcode className="h-5 w-5" /> สแกนบาร์โค้ด
          </button>
          <div className="mt-4 text-xs text-sidebar-foreground/60 text-center">
            <div className="font-semibold text-sidebar-foreground/80">MARINA OPTICAL</div>
            <div>© 2024 All Rights Reserved</div>
            <div>Version 1.0.0</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-md hover:bg-secondary"><Menu className="h-5 w-5" /></button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">ใบงานเลขที่</span>
              <span className="text-3xl font-bold text-primary">217</span>
              <button className="p-2 rounded-md hover:bg-secondary"><FileIcon className="h-4 w-4 text-primary" /></button>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-muted-foreground">วันที่</span>
              <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
                12/05/2567 <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-md hover:bg-secondary">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-semibold">A</div>
              <div className="text-right">
                <div className="text-sm font-semibold">Admin</div>
                <div className="text-xs text-muted-foreground">ผู้ดูแลระบบ</div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 p-6">
          <div className="space-y-6 min-w-0">
            {/* Customer info */}
            <SectionCard title="ข้อมูลลูกค้า">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <Field label="รหัสลูกค้า"><Input defaultValue="CUS-000152" /></Field>
                <Field label="อายุ">
                  <div className="grid grid-cols-[1fr_40px_60px_1fr] items-center gap-2">
                    <Input defaultValue="53" />
                    <span className="text-sm text-muted-foreground text-center">ปี</span>
                    <span className="text-sm text-muted-foreground">เพศ</span>
                    <Select defaultValue="ชาย"><option>ชาย</option><option>หญิง</option></Select>
                  </div>
                </Field>
                <Field label="ชื่อ-นามสกุล"><Input defaultValue="คุณวิเชียร เกิดสมบัติ" /></Field>
                <Field label="อาชีพ"><Input defaultValue="ธุรกิจส่วนตัว" /></Field>
                <Field label="เบอร์โทรศัพท์"><Input defaultValue="082-447-8801" /></Field>
                <Field label="ผู้ตรวจสายตา"><Input defaultValue="คุณกิตติพงศ์" /></Field>
                <Field label="ที่อยู่"><Input defaultValue="52/15 ม.3 ต.เสม็ด อ.เมือง จ.ชลบุรี 20000" /></Field>
                <Field label="ผู้รับงาน"><Input defaultValue="คุณมารินา" /></Field>
                <Field label="หมายเหตุ"><Input defaultValue="แพ้สารเคลือบบางชนิด / ต้องการเลนส์บาง" /></Field>
              </div>
            </SectionCard>

            {/* Prescription */}
            <SectionCard title="ค่าสายตา">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground">ค่าสายตาปัจจุบัน</h3>
                  <RxTable
                    headers={["ข้าง", "SPH", "CYL", "AX", "VA", "ADD"]}
                    rows={[
                      ["R (OD)", "+1.75", "-1.50", "150", "AX 175", "+2.50"],
                      ["L (OS)", "+1.75", "-1.75", "130", "AX 185", "+2.50"],
                    ]}
                  />
                  <div className="mt-4 grid grid-cols-[110px_1fr] items-center gap-3">
                    <label className="text-sm text-muted-foreground">ประเภทเลนส์</label>
                    <Select defaultValue="prog">
                      <option value="prog">PROGRESSIVE (Progressive Addition Lens)</option>
                      <option>SINGLE VISION</option>
                      <option>BIFOCAL</option>
                      <option>OFFICE LENS</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground">PD / การวัด</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      ["PD R", "30", "SHR", "27"],
                      ["PD L", "30", "SHL", "27"],
                      ["PD รวม", "60", "FH", "15"],
                    ].flatMap((row, i) => [
                      <div key={`a${i}`} className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground w-14">{row[0]}</label>
                        <Input defaultValue={row[1]} />
                        <span className="text-xs text-muted-foreground">มม.</span>
                      </div>,
                      <div key={`b${i}`} className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground w-14">{row[2]}</label>
                        <Input defaultValue={row[3]} />
                        <span className="text-xs text-muted-foreground">มม.</span>
                      </div>,
                    ])}
                    <div className="col-span-2 flex items-center gap-2">
                      <label className="text-sm text-muted-foreground w-40">ระยะอ่าน (Segment Height)</label>
                      <Input defaultValue="27" className="max-w-[120px]" />
                      <span className="text-xs text-muted-foreground">มม.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-3 text-foreground">ค่าสายตาเดิม (อ้างอิง)</h3>
                <RxTable
                  headers={["ข้าง", "SPH", "CYL", "AX", "VA", "ADD", "วันที่วัด"]}
                  rows={[
                    ["R (OD)", "+1.50", "-1.50", "150", "AX 175", "+2.25", "15/08/2566"],
                    ["L (OS)", "+1.50", "-1.75", "130", "AX 180", "+2.25", "15/08/2566"],
                  ]}
                />
              </div>
            </SectionCard>

            {/* Lens & frame + Pricing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SectionCard title="เลนส์และกรอบแว่น">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-3">เลนส์</h4>
                      <div className="space-y-3">
                        <Field label="ยี่ห้อเลนส์"><Select><option>RODENSTOCK</option><option>HOYA</option><option>ZEISS</option></Select></Field>
                        <Field label="รุ่นเลนส์"><Select><option>PROGRESSIVE Individual 2</option></Select></Field>
                        <Field label="ดัชนีหักเห (Index)"><Select defaultValue="1.60"><option>1.56</option><option>1.60</option><option>1.67</option><option>1.74</option></Select></Field>
                        <Field label="สารเคลือบเลนส์ (Coating)"><Select><option>Multicoat + Blue Light</option><option>Photochromic</option><option>Transition</option></Select></Field>
                        <Field label="สีเลนส์"><Select><option>Clear</option><option>Brown</option><option>Grey</option></Select></Field>
                        <Field label="หมายเหตุเลนส์"><Input defaultValue="ต้องการเลนส์บาง คุณภาพสูง" /></Field>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-3">กรอบแว่น</h4>
                      <div className="space-y-3">
                        <Field label="รุ่น"><Input defaultValue="RB 6501D" /></Field>
                        <Field label="สี"><Input defaultValue="Black" /></Field>
                        <Field label="ขนาด"><Input defaultValue="54-17-145" /></Field>
                        <Field label="วัสดุ"><Input defaultValue="Titanium" /></Field>
                      </div>
                      <div className="mt-4 rounded-lg border border-border bg-secondary/40 h-32 flex items-center justify-center text-muted-foreground">
                        <Glasses className="h-16 w-16 opacity-60" />
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="ราคาและการชำระเงิน">
                <div className="space-y-3">
                  {[
                    ["ราคากรอบแว่น", "2,500.00"],
                    ["ราคาเลนส์", "4,500.00"],
                    ["สารเคลือบ / อื่นๆ", "0.00"],
                  ].map(([l, v]) => (
                    <div key={l} className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                      <span className="text-sm text-muted-foreground">{l}</span>
                      <Input defaultValue={v} className="text-right" />
                      <span className="text-xs text-muted-foreground">บาท</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3 pt-2 border-t border-border">
                    <span className="text-sm font-semibold">รวมราคาสินค้า</span>
                    <span className="text-right font-semibold">7,000.00</span>
                    <span className="text-xs text-muted-foreground">บาท</span>
                  </div>
                  <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                    <span className="text-sm text-destructive">ส่วนลด</span>
                    <Input defaultValue="500.00" className="text-right text-destructive" />
                    <span className="text-xs text-muted-foreground">บาท</span>
                  </div>
                  <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3 py-2 px-3 -mx-3 rounded-lg bg-secondary">
                    <span className="text-base font-bold">ยอดรวมสุทธิ</span>
                    <span className="text-right text-xl font-bold text-primary">6,500.00</span>
                    <span className="text-xs text-muted-foreground">บาท</span>
                  </div>
                  <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                    <span className="text-sm text-muted-foreground">มัดจำ</span>
                    <Input defaultValue="3,000.00" className="text-right" />
                    <span className="text-xs text-muted-foreground">บาท</span>
                  </div>
                  <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                    <span className="text-sm text-muted-foreground">คงเหลือ</span>
                    <Input defaultValue="3,500.00" className="text-right" />
                    <span className="text-xs text-muted-foreground">บาท</span>
                  </div>
                  <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                    <span className="text-sm text-muted-foreground">วันที่นัดรับ</span>
                    <Input defaultValue="19/05/2567" className="text-right" />
                    <span className="text-xs text-muted-foreground"><Calendar className="h-4 w-4" /></span>
                  </div>
                  <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                    <span className="text-sm text-muted-foreground">ช่องทางชำระ</span>
                    <Select><option>เงินสด</option><option>โอน</option><option>บัตรเครดิต</option></Select>
                    <span />
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 font-medium shadow hover:opacity-90">
                <Save className="h-5 w-5" /> บันทึกใบงาน
              </button>
              <button className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg border border-primary text-primary px-5 py-3 font-medium hover:bg-secondary">
                <FilePlus className="h-5 w-5" /> สร้างใบงานใหม่
              </button>
              <button className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 font-medium hover:bg-secondary">
                <Printer className="h-5 w-5" /> พิมพ์ใบงาน
              </button>
              <button className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 font-medium hover:bg-secondary">
                <FileDown className="h-5 w-5" /> บันทึกเป็น PDF
              </button>
              <button className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 font-medium hover:bg-secondary">
                <Send className="h-5 w-5" /> ส่งให้ลูกค้า (Line / Email)
              </button>
              <button className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg border border-destructive text-destructive px-5 py-3 font-medium hover:bg-destructive/10">
                <Trash2 className="h-5 w-5" /> ยกเลิกใบงาน
              </button>
            </div>
          </div>

          {/* Right rail */}
          <aside className="space-y-6">
            <SectionCard title="สถานะงาน">
              <ol className="relative space-y-5">
                {statusSteps.map((s, i) => {
                  const isDone = s.state === "done";
                  const isCurrent = s.state === "current";
                  return (
                    <li key={s.label} className="relative pl-9">
                      {i < statusSteps.length - 1 && (
                        <span className="absolute left-3 top-6 bottom-[-1.25rem] w-px bg-border" />
                      )}
                      <span className={`absolute left-0 top-0 h-6 w-6 rounded-full flex items-center justify-center ${
                        isDone ? "bg-primary text-primary-foreground" :
                        isCurrent ? "bg-primary/15 text-primary ring-2 ring-primary" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                      </span>
                      <div className={`text-sm font-medium ${isDone || isCurrent ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                      {s.time && <div className="text-xs text-muted-foreground mt-0.5">{s.time}</div>}
                    </li>
                  );
                })}
              </ol>
            </SectionCard>

            <SectionCard title="เอกสาร / ไฟล์แนบ">
              <div className="space-y-2">
                {["สแกนใบสั่งซื้อ.pdf", "รูปกรอบแว่น.jpg", "ใบเสร็จมัดจำ.pdf"].map((f) => (
                  <div key={f} className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
                    <FileIcon className="h-4 w-4 text-primary" />
                    <span className="truncate">{f}</span>
                  </div>
                ))}
                <button className="w-full flex items-center justify-center gap-2 rounded-md border border-dashed border-primary text-primary px-3 py-2.5 text-sm font-medium hover:bg-secondary">
                  <Plus className="h-4 w-4" /> เพิ่มไฟล์
                </button>
              </div>
            </SectionCard>

            <SectionCard title="หมายเหตุ / ปัญหา">
              <textarea
                defaultValue={"- ลูกค้าต้องการเลนส์บาง\n- ใส่คอมพิวเตอร์เป็นประจำ"}
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
              <button className="mt-3 w-full flex items-center justify-center gap-2 rounded-md border border-dashed border-primary text-primary px-3 py-2.5 text-sm font-medium hover:bg-secondary">
                <Plus className="h-4 w-4" /> เพิ่มหมายเหตุ
              </button>
            </SectionCard>
          </aside>
        </div>
      </main>
    </div>
  );
}
