import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Glasses, CheckCircle2, Circle, FileIcon, Plus, Save, Printer,
  FileDown, Send, Trash2, Search, UserPlus, X, ChevronDown, User,
} from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState, useRef } from "react";

export const Route = createFileRoute("/jobs/new")({
  head: () => ({
    meta: [
      { title: "สร้างใบงานใหม่ — MARINA OPTICAL" },
      { name: "description", content: "ใบสั่งเลนส์ดิจิทัล / New Vision Record" },
    ],
  }),
  component: NewJobPage,
});

// ─── Mock customer database ───────────────────────────────────────────────────

const CUSTOMER_DB = [
  { id: "CUS-000152", name: "คุณวิเชียร เกิดสมบัติ",  phone: "082-447-8801", age: 53, gender: "ชาย",  occupation: "ธุรกิจส่วนตัว", address: "52/15 ม.3 ต.เสม็ด อ.เมือง จ.ชลบุรี 20000" },
  { id: "CUS-000148", name: "คุณสมหญิง ประดิษฐ์ดี",   phone: "089-123-4567", age: 42, gender: "หญิง", occupation: "พยาบาล",        address: "12 ถ.สุขุมวิท กรุงเทพฯ 10110" },
  { id: "CUS-000139", name: "คุณประเสริฐ วงศ์ทอง",    phone: "091-234-5678", age: 61, gender: "ชาย",  occupation: "ข้าราชการ",      address: "8/2 ม.5 ต.หนองหาร อ.สันทราย จ.เชียงใหม่" },
  { id: "CUS-000127", name: "คุณนิภา สุขสวัสดิ์",     phone: "086-345-6789", age: 35, gender: "หญิง", occupation: "ครู",             address: "45 ซ.ลาดพร้าว 71 กรุงเทพฯ 10230" },
  { id: "CUS-000103", name: "คุณอานนท์ รุ่งเรือง",    phone: "083-456-7890", age: 48, gender: "ชาย",  occupation: "วิศวกร",          address: "22 ถ.พระราม 9 กรุงเทพฯ 10320" },
];

type Customer = typeof CUSTOMER_DB[number];

// ─── Status steps (empty for new) ─────────────────────────────────────────────

const statusSteps = [
  { label: "รับออเดอร์แล้ว", state: "current" },
  { label: "รอเลนส์",        state: "pending" },
  { label: "กำลังประกอบ",    state: "pending" },
  { label: "QC แล้ว",        state: "pending" },
  { label: "พร้อมรับ",       state: "pending" },
  { label: "ส่งมอบแล้ว",     state: "pending" },
];

// ─── Shared field components ──────────────────────────────────────────────────

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

// ─── Customer Search Section ───────────────────────────────────────────────────

function CustomerSearchSection({
  onSelect,
}: {
  onSelect: (c: Customer | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const found = CUSTOMER_DB.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.id.toLowerCase().includes(q),
    );
    setResults(found);
    setSearched(true);
    setShowNewForm(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  function handleSelect(c: Customer) {
    setSelected(c);
    onSelect(c);
    setResults([]);
    setSearched(false);
    setQuery("");
  }

  function handleClear() {
    setSelected(null);
    onSelect(null);
    setQuery("");
    setResults([]);
    setSearched(false);
    setShowNewForm(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // ── Selected customer card ──
  if (selected) {
    return (
      <div className="flex items-start justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {selected.name.slice(2, 4)}
          </div>
          <div>
            <p className="font-semibold text-foreground">{selected.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selected.id} · {selected.phone} · อายุ {selected.age} ปี · {selected.occupation}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{selected.address}</p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex-shrink-0 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary flex items-center gap-1"
        >
          <X className="h-3 w-3" /> เปลี่ยน
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ค้นหาด้วย ชื่อ, เบอร์โทร, รหัสลูกค้า…"
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <button
          onClick={handleSearch}
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          <Search className="h-4 w-4" /> ค้นหา
        </button>
        <button
          onClick={() => { setShowNewForm(true); setResults([]); setSearched(false); }}
          className="flex items-center gap-2 rounded-lg border border-dashed border-primary text-primary px-4 py-2 text-sm font-medium hover:bg-primary/5"
        >
          <UserPlus className="h-4 w-4" /> ลูกค้าใหม่
        </button>
      </div>

      {/* Search results */}
      {searched && results.length === 0 && !showNewForm && (
        <div className="rounded-xl border border-border bg-secondary/30 px-5 py-6 text-center">
          <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">ไม่พบลูกค้าในระบบ</p>
          <button
            onClick={() => setShowNewForm(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-primary text-primary px-4 py-2 text-sm font-medium hover:bg-primary/5"
          >
            <UserPlus className="h-4 w-4" /> เพิ่มลูกค้าใหม่
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          {results.map((c, i) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c)}
              className={`w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-secondary transition-colors
                ${i > 0 ? "border-t border-border" : ""}`}
            >
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                {c.name.slice(2, 4)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.id} · {c.phone} · อายุ {c.age} ปี</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg] flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Inline new customer form */}
      {showNewForm && (
        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/3 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> ข้อมูลลูกค้าใหม่
            </p>
            <button onClick={() => setShowNewForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <Field label="ชื่อ-นามสกุล"><Input placeholder="คุณ..." /></Field>
            <Field label="เบอร์โทรศัพท์"><Input placeholder="08X-XXX-XXXX" /></Field>
            <Field label="อายุ">
              <div className="grid grid-cols-[1fr_40px_60px_1fr] items-center gap-2">
                <Input placeholder="35" />
                <span className="text-sm text-muted-foreground text-center">ปี</span>
                <span className="text-sm text-muted-foreground">เพศ</span>
                <Select><option>ชาย</option><option>หญิง</option></Select>
              </div>
            </Field>
            <Field label="อาชีพ"><Input placeholder="เช่น ข้าราชการ, พนักงาน..." /></Field>
            <Field label="ที่อยู่"><Input placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด" /></Field>
            <Field label="หมายเหตุ"><Input placeholder="แพ้สารเคลือบ, ต้องการเลนส์พิเศษ..." /></Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowNewForm(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              ยกเลิก
            </button>
            <button
              onClick={() => {
                // In production: save to DB and get back new customer
                const mock: Customer = {
                  id: "CUS-NEW",
                  name: "ลูกค้าใหม่",
                  phone: "-",
                  age: 0,
                  gender: "ชาย",
                  occupation: "-",
                  address: "-",
                };
                handleSelect(mock);
              }}
              className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" /> บันทึกและใช้งาน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function NewJobPage() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);

  return (
    <AppShell
      title={
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">สร้างใบงานใหม่</span>
          <span className="text-2xl font-bold text-primary leading-none">#ใหม่</span>
          <span className="text-sm text-muted-foreground ml-3">วันที่ {new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
        </div>
      }
      subtitle="ใบสั่งเลนส์ดิจิทัล — New Vision Record"
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 p-6">
        <div className="space-y-6 min-w-0">

          {/* ── Customer search ── */}
          <SectionCard title="ค้นหา / เลือกลูกค้า">
            <CustomerSearchSection onSelect={setCustomer} />
          </SectionCard>

          {/* ── Customer detail (filled after select, or blank for new) ── */}
          <SectionCard title="ข้อมูลลูกค้า">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <Field label="รหัสลูกค้า"><Input defaultValue={customer?.id ?? ""} placeholder="CUS-XXXXXX (ระบบสร้างอัตโนมัติ)" readOnly={!!customer?.id && customer.id !== "CUS-NEW"} /></Field>
              <Field label="อายุ">
                <div className="grid grid-cols-[1fr_40px_60px_1fr] items-center gap-2">
                  <Input defaultValue={customer?.age ? String(customer.age) : ""} placeholder="0" />
                  <span className="text-sm text-muted-foreground text-center">ปี</span>
                  <span className="text-sm text-muted-foreground">เพศ</span>
                  <Select defaultValue={customer?.gender ?? "ชาย"}>
                    <option>ชาย</option><option>หญิง</option>
                  </Select>
                </div>
              </Field>
              <Field label="ชื่อ-นามสกุล"><Input key={customer?.name} defaultValue={customer?.name ?? ""} placeholder="คุณ..." /></Field>
              <Field label="อาชีพ"><Input key={customer?.occupation} defaultValue={customer?.occupation ?? ""} placeholder="เช่น พนักงาน, ธุรกิจส่วนตัว..." /></Field>
              <Field label="เบอร์โทรศัพท์"><Input key={customer?.phone} defaultValue={customer?.phone ?? ""} placeholder="08X-XXX-XXXX" /></Field>
              <Field label="ผู้ตรวจสายตา"><Input placeholder="ชื่อผู้ตรวจ" /></Field>
              <Field label="ที่อยู่"><Input key={customer?.address} defaultValue={customer?.address ?? ""} placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด" /></Field>
              <Field label="ผู้รับงาน"><Input placeholder="ชื่อพนักงาน" /></Field>
              <Field label="หมายเหตุ"><Input placeholder="แพ้สารเคลือบ, ต้องการพิเศษ..." /></Field>
            </div>
          </SectionCard>

          {/* ── Prescription ── */}
          <SectionCard title="ค่าสายตา">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold mb-3 text-foreground">ค่าสายตาปัจจุบัน</h3>
                <RxTable
                  headers={["ข้าง", "SPH", "CYL", "AX", "VA", "ADD"]}
                  rows={[
                    ["R (OD)", "", "", "", "", ""],
                    ["L (OS)", "", "", "", "", ""],
                  ]}
                />
                <div className="mt-4 grid grid-cols-[110px_1fr] items-center gap-3">
                  <label className="text-sm text-muted-foreground">ประเภทเลนส์</label>
                  <Select>
                    <option value="">— เลือกประเภทเลนส์ —</option>
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
                    ["PD R", "", "SHR", ""],
                    ["PD L", "", "SHL", ""],
                    ["PD รวม", "", "FH", ""],
                  ].flatMap((row, i) => [
                    <div key={`a${i}`} className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground w-14">{row[0]}</label>
                      <Input defaultValue={row[1]} placeholder="0" />
                      <span className="text-xs text-muted-foreground">มม.</span>
                    </div>,
                    <div key={`b${i}`} className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground w-14">{row[2]}</label>
                      <Input defaultValue={row[3]} placeholder="0" />
                      <span className="text-xs text-muted-foreground">มม.</span>
                    </div>,
                  ])}
                  <div className="col-span-2 flex items-center gap-2">
                    <label className="text-sm text-muted-foreground w-40">ระยะอ่าน (Segment Height)</label>
                    <Input placeholder="0" className="max-w-[120px]" />
                    <span className="text-xs text-muted-foreground">มม.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3 text-foreground">ค่าสายตาเดิม (อ้างอิง — ถ้ามี)</h3>
              <RxTable
                headers={["ข้าง", "SPH", "CYL", "AX", "VA", "ADD", "วันที่วัด"]}
                rows={[
                  ["R (OD)", "", "", "", "", "", ""],
                  ["L (OS)", "", "", "", "", "", ""],
                ]}
              />
            </div>
          </SectionCard>

          {/* ── Lens & frame + Pricing ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="เลนส์และกรอบแว่น">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-3">เลนส์</h4>
                  <div className="space-y-3">
                    <Field label="ยี่ห้อเลนส์">
                      <Select><option value="">— เลือก —</option><option>RODENSTOCK</option><option>HOYA</option><option>ZEISS</option></Select>
                    </Field>
                    <Field label="รุ่นเลนส์">
                      <Select><option value="">— เลือก —</option><option>PROGRESSIVE Individual 2</option></Select>
                    </Field>
                    <Field label="Index">
                      <Select><option value="">— เลือก —</option><option>1.56</option><option>1.60</option><option>1.67</option><option>1.74</option></Select>
                    </Field>
                    <Field label="Coating">
                      <Select><option value="">— เลือก —</option><option>Multicoat + Blue Light</option><option>Photochromic</option><option>Transition</option></Select>
                    </Field>
                    <Field label="สีเลนส์">
                      <Select><option value="">— เลือก —</option><option>Clear</option><option>Brown</option><option>Grey</option></Select>
                    </Field>
                    <Field label="หมายเหตุ"><Input placeholder="ข้อมูลเพิ่มเติม..." /></Field>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3">กรอบแว่น</h4>
                  <div className="space-y-3">
                    <Field label="รุ่น"><Input placeholder="เช่น RB 6501D" /></Field>
                    <Field label="สี"><Input placeholder="เช่น Black" /></Field>
                    <Field label="ขนาด"><Input placeholder="54-17-145" /></Field>
                    <Field label="วัสดุ"><Input placeholder="เช่น Titanium" /></Field>
                  </div>
                  <div className="mt-4 rounded-lg border border-border border-dashed bg-secondary/40 h-32 flex items-center justify-center text-muted-foreground">
                    <Glasses className="h-16 w-16 opacity-30" />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="ราคาและการชำระเงิน">
              <div className="space-y-3">
                {[
                  ["ราคากรอบแว่น", "0.00"],
                  ["ราคาเลนส์", "0.00"],
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
                  <span className="text-right font-semibold">0.00</span>
                  <span className="text-xs text-muted-foreground">บาท</span>
                </div>
                <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                  <span className="text-sm text-destructive">ส่วนลด</span>
                  <Input defaultValue="0.00" className="text-right text-destructive" />
                  <span className="text-xs text-muted-foreground">บาท</span>
                </div>
                <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3 py-2 px-3 -mx-3 rounded-lg bg-secondary">
                  <span className="text-base font-bold">ยอดรวมสุทธิ</span>
                  <span className="text-right text-xl font-bold text-primary">0.00</span>
                  <span className="text-xs text-muted-foreground">บาท</span>
                </div>
                <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                  <span className="text-sm text-muted-foreground">มัดจำ</span>
                  <Input defaultValue="0.00" className="text-right" />
                  <span className="text-xs text-muted-foreground">บาท</span>
                </div>
                <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                  <span className="text-sm text-muted-foreground">คงเหลือ</span>
                  <Input defaultValue="0.00" className="text-right" />
                  <span className="text-xs text-muted-foreground">บาท</span>
                </div>
                <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                  <span className="text-sm text-muted-foreground">วันที่นัดรับ</span>
                  <Input type="date" className="text-right" />
                  <span />
                </div>
                <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                  <span className="text-sm text-muted-foreground">ช่องทางชำระ</span>
                  <Select><option>เงินสด</option><option>โอน</option><option>บัตรเครดิต</option></Select>
                  <span />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-wrap gap-3">
            <button className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 font-medium shadow hover:opacity-90">
              <Save className="h-5 w-5" /> บันทึกใบงาน
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
            <button
              onClick={() => navigate({ to: "/jobs" })}
              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg border border-destructive text-destructive px-5 py-3 font-medium hover:bg-destructive/10"
            >
              <Trash2 className="h-5 w-5" /> ยกเลิก
            </button>
          </div>
        </div>

        {/* ── Right rail ── */}
        <aside className="space-y-6">
          <SectionCard title="สถานะงาน">
            <ol className="relative space-y-5">
              {statusSteps.map((s, i) => {
                const isCurrent = s.state === "current";
                return (
                  <li key={s.label} className="relative pl-9">
                    {i < statusSteps.length - 1 && (
                      <span className="absolute left-3 top-6 bottom-[-1.25rem] w-px bg-border" />
                    )}
                    <span className={`absolute left-0 top-0 h-6 w-6 rounded-full flex items-center justify-center ${
                      isCurrent
                        ? "bg-primary/15 text-primary ring-2 ring-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      <Circle className="h-3 w-3" />
                    </span>
                    <div className={`text-sm font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.label}
                    </div>
                    {isCurrent && (
                      <div className="text-xs text-muted-foreground mt-0.5">รอบันทึกใบงาน</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </SectionCard>

          <SectionCard title="เอกสาร / ไฟล์แนบ">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">ยังไม่มีไฟล์แนบ — บันทึกใบงานก่อนเพื่อแนบไฟล์</p>
              <button className="w-full flex items-center justify-center gap-2 rounded-md border border-dashed border-border text-muted-foreground px-3 py-2.5 text-sm font-medium opacity-50 cursor-not-allowed">
                <Plus className="h-4 w-4" /> เพิ่มไฟล์
              </button>
            </div>
          </SectionCard>

          <SectionCard title="หมายเหตุ / ปัญหา">
            <textarea
              rows={5}
              placeholder="บันทึกข้อมูลเพิ่มเติมสำหรับใบงานนี้..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </SectionCard>
        </aside>
      </div>
    </AppShell>
  );
}