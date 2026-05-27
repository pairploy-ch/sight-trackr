import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Circle, Plus, Save, Printer,
  FileDown, Trash2, Search, UserPlus, X, ChevronDown, User, Loader2, CheckCircle2,
} from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

interface RxRow { sph: string; cyl: string; ax: string; va: string; add: string }
interface RxOldRow extends RxRow { date: string }

const emptyRx = (): RxRow => ({ sph: "", cyl: "", ax: "", va: "", add: "" });
const emptyOldRx = (): RxOldRow => ({ sph: "", cyl: "", ax: "", va: "", add: "", date: "" });

const statusSteps = [
  { label: "รับออเดอร์แล้ว", state: "current" },
  { label: "รอเลนส์",        state: "pending" },
  { label: "กำลังประกอบ",    state: "pending" },
  { label: "QC แล้ว",        state: "pending" },
  { label: "พร้อมรับ",       state: "pending" },
  { label: "ส่งมอบแล้ว",     state: "pending" },
];

// ─── Shared components ────────────────────────────────────────────────────────

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
      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 disabled:cursor-not-allowed ${props.className ?? ""}`}
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </select>
  );
}

function RxInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm text-center text-foreground focus:outline-none focus:border-ring focus:bg-background focus:ring-1 focus:ring-ring/40 placeholder:text-muted-foreground/40"
    />
  );
}

function RxTableEditable({ value, onChange }: { value: { od: RxRow; os: RxRow }; onChange: (v: { od: RxRow; os: RxRow }) => void }) {
  const cols: (keyof RxRow)[] = ["sph", "cyl", "ax", "va", "add"];
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-secondary-foreground">
          <tr>{["ข้าง", "SPH", "CYL", "AX", "VA", "ADD"].map((h) => <th key={h} className="px-3 py-2 text-center font-medium first:text-left">{h}</th>)}</tr>
        </thead>
        <tbody>
          {(["od", "os"] as const).map((eye) => (
            <tr key={eye} className="border-t border-border">
              <td className="px-3 py-1.5 font-semibold text-primary whitespace-nowrap">{eye === "od" ? "R (OD)" : "L (OS)"}</td>
              {cols.map((col) => (
                <td key={col} className="px-1 py-1">
                  <RxInput
                    value={value[eye][col]}
                    onChange={(e) => onChange({ ...value, [eye]: { ...value[eye], [col]: e.target.value } })}
                    placeholder="—"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RxTableOldEditable({ value, onChange }: { value: { od: RxOldRow; os: RxOldRow }; onChange: (v: { od: RxOldRow; os: RxOldRow }) => void }) {
  const cols: (keyof RxOldRow)[] = ["sph", "cyl", "ax", "va", "add", "date"];
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-secondary-foreground">
          <tr>{["ข้าง", "SPH", "CYL", "AX", "VA", "ADD", "วันที่วัด"].map((h) => <th key={h} className="px-3 py-2 text-center font-medium first:text-left">{h}</th>)}</tr>
        </thead>
        <tbody>
          {(["od", "os"] as const).map((eye) => (
            <tr key={eye} className="border-t border-border">
              <td className="px-3 py-1.5 font-semibold text-primary whitespace-nowrap">{eye === "od" ? "R (OD)" : "L (OS)"}</td>
              {cols.map((col) => (
                <td key={col} className="px-1 py-1">
                  <RxInput
                    value={value[eye][col]}
                    onChange={(e) => onChange({ ...value, [eye]: { ...value[eye], [col]: e.target.value } })}
                    placeholder="—"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Customer Search ──────────────────────────────────────────────────────────

function CustomerSearchSection({ onSelect }: { onSelect: (c: Customer | null) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    const q = query.trim().toLowerCase();
    if (!q) return;
    setResults(CUSTOMER_DB.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.id.toLowerCase().includes(q)));
    setSearched(true);
    setShowNewForm(false);
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

  if (selected) {
    return (
      <div className="flex items-start justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {selected.name.slice(2, 4)}
          </div>
          <div>
            <p className="font-semibold text-foreground">{selected.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{selected.id} · {selected.phone} · อายุ {selected.age} ปี · {selected.occupation}</p>
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
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
              className={`w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-secondary transition-colors ${i > 0 ? "border-t border-border" : ""}`}
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
              onClick={() => handleSelect({ id: "CUS-NEW", name: "ลูกค้าใหม่", phone: "-", age: 0, gender: "ชาย", occupation: "-", address: "-" })}
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

// ─── Helper: allow only numeric input (digits + one decimal point) ─────────────
function numOnly(v: string) {
  return v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

// ─── Main page ────────────────────────────────────────────────────────────────

function NewJobPage() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [rx, setRx] = useState<{ od: RxRow; os: RxRow }>({ od: emptyRx(), os: emptyRx() });
  const [rxOld, setRxOld] = useState<{ od: RxOldRow; os: RxOldRow }>({ od: emptyOldRx(), os: emptyOldRx() });
  const [pdfLoading, setPdfLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Customer info (controlled, populated from search) ──────────────────────
  const [info, setInfo] = useState({
    id: "", name: "", age: "", gender: "ชาย",
    phone: "", occupation: "", address: "",
    examiner: "", staff: "", note: "",
  });

  useEffect(() => {
    if (customer) {
      setInfo((prev) => ({
        ...prev,
        id: customer.id,
        name: customer.name,
        age: String(customer.age),
        gender: customer.gender,
        phone: customer.phone,
        occupation: customer.occupation,
        address: customer.address,
      }));
    } else {
      setInfo({ id: "", name: "", age: "", gender: "ชาย", phone: "", occupation: "", address: "", examiner: "", staff: "", note: "" });
    }
  }, [customer]);

  // ── File attachments ───────────────────────────────────────────────────────
  const [attachments, setAttachments] = useState<File[]>([]);

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    e.target.value = "";
  }

  function handleFileRemove(i: number) {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  }

  // ── Pricing (controlled + auto-calculated) ─────────────────────────────────
  const [price, setPrice] = useState({
    frame: "", lens: "", coating: "", discount: "", deposit: "",
    paymentMethod: "เงินสด", pickupDate: "",
  });

  const frameN    = parseFloat(price.frame)    || 0;
  const lensN     = parseFloat(price.lens)     || 0;
  const coatingN  = parseFloat(price.coating)  || 0;
  const subtotal  = frameN + lensN + coatingN;
  const discountN = parseFloat(price.discount) || 0;
  const net       = Math.max(0, subtotal - discountN);
  const depositN  = parseFloat(price.deposit)  || 0;
  const remaining = Math.max(0, net - depositN);

  // ── Print ──────────────────────────────────────────────────────────────────
  function handlePrint() {
    window.print();
  }

  // ── Export PDF ─────────────────────────────────────────────────────────────
  async function handlePdf() {
    if (!printRef.current) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH  = (canvas.height * pageW) / canvas.width;

      let y = 0;
      while (y < imgH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -y, pageW, imgH);
        y += pageH;
      }

      const filename = customer
        ? `ใบงาน-${customer.name.replace(/\s/g, "_")}.pdf`
        : `ใบงานใหม่-${new Date().toLocaleDateString("th-TH").replace(/\//g, "-")}.pdf`;
      pdf.save(filename);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#print-root) { display: none !important; }
          #print-root { display: block !important; }
          .no-print { display: none !important; }
          @page { margin: 12mm; size: A4; }
        }
      `}</style>

      <AppShell
        title={<div className="flex items-center gap-3"><span className="text-sm text-muted-foreground">สร้างใบงานใหม่</span></div>}
        subtitle="ใบสั่งเลนส์ดิจิทัล — New Vision Record"
      >
        <div id="print-root" ref={printRef}>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 p-6">
            <div className="space-y-6 min-w-0">

              {/* ── Customer Search (no-print) ── */}
              <div className="no-print">
                <SectionCard title="ค้นหา / เลือกลูกค้า">
                  <CustomerSearchSection onSelect={setCustomer} />
                </SectionCard>
              </div>

              {/* ── Customer Info — disabled until a customer is selected ── */}
              <SectionCard title="ข้อมูลลูกค้า">
                {!customer && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
                    <Search className="h-4 w-4 flex-shrink-0" />
                    กรุณาค้นหาและเลือกลูกค้าด้านบนก่อน
                  </div>
                )}
                <fieldset
                  disabled={!customer}
                  className="[&:disabled]:opacity-40 [&:disabled]:pointer-events-none transition-opacity duration-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <Field label="รหัสลูกค้า">
                      <Input
                        value={info.id}
                        onChange={(e) => setInfo((p) => ({ ...p, id: e.target.value }))}
                        placeholder="CUS-XXXXXX (ระบบสร้างอัตโนมัติ)"
                        readOnly={!!customer?.id && customer.id !== "CUS-NEW"}
                      />
                    </Field>
                    <Field label="อายุ">
                      <div className="grid grid-cols-[1fr_40px_60px_1fr] items-center gap-2">
                        <Input
                          value={info.age}
                          onChange={(e) => setInfo((p) => ({ ...p, age: numOnly(e.target.value) }))}
                          placeholder="0"
                          inputMode="numeric"
                        />
                        <span className="text-sm text-muted-foreground text-center">ปี</span>
                        <span className="text-sm text-muted-foreground">เพศ</span>
                        <Select value={info.gender} onChange={(e) => setInfo((p) => ({ ...p, gender: e.target.value }))}>
                          <option>ชาย</option>
                          <option>หญิง</option>
                        </Select>
                      </div>
                    </Field>
                    <Field label="ชื่อ-นามสกุล">
                      <Input
                        value={info.name}
                        onChange={(e) => setInfo((p) => ({ ...p, name: e.target.value }))}
                        placeholder="คุณ..."
                      />
                    </Field>
                    <Field label="อาชีพ">
                      <Input
                        value={info.occupation}
                        onChange={(e) => setInfo((p) => ({ ...p, occupation: e.target.value }))}
                        placeholder="เช่น พนักงาน, ธุรกิจส่วนตัว..."
                      />
                    </Field>
                    <Field label="เบอร์โทรศัพท์">
                      <Input
                        value={info.phone}
                        onChange={(e) => setInfo((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="08X-XXX-XXXX"
                      />
                    </Field>
                    <Field label="ผู้ตรวจสายตา">
                      <Input
                        value={info.examiner}
                        onChange={(e) => setInfo((p) => ({ ...p, examiner: e.target.value }))}
                        placeholder="ชื่อผู้ตรวจ"
                      />
                    </Field>
                    <Field label="ที่อยู่">
                      <Input
                        value={info.address}
                        onChange={(e) => setInfo((p) => ({ ...p, address: e.target.value }))}
                        placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด"
                      />
                    </Field>
                    <Field label="ผู้รับงาน">
                      <Input
                        value={info.staff}
                        onChange={(e) => setInfo((p) => ({ ...p, staff: e.target.value }))}
                        placeholder="ชื่อพนักงาน"
                      />
                    </Field>
                    <Field label="หมายเหตุ">
                      <Input
                        value={info.note}
                        onChange={(e) => setInfo((p) => ({ ...p, note: e.target.value }))}
                        placeholder="แพ้สารเคลือบ, ต้องการพิเศษ..."
                      />
                    </Field>
                  </div>
                </fieldset>
              </SectionCard>

              {/* ── Rx ── */}
              <SectionCard title="ค่าสายตา">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-foreground">ค่าสายตาปัจจุบัน</h3>
                    <RxTableEditable value={rx} onChange={setRx} />
                    <div className="mt-4 grid grid-cols-[110px_1fr] items-center gap-3">
                      <label className="text-sm text-muted-foreground">ประเภทเลนส์</label>
                      <Select>
                        <option value="">— เลือกประเภทเลนส์ —</option>
                        <option>PROGRESSIVE (Progressive Addition Lens)</option>
                        <option>SINGLE VISION</option>
                        <option>BIFOCAL</option>
                        <option>OFFICE LENS</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-foreground">PD / การวัด</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      {[["PD R", "SHR"], ["PD L", "SHL"], ["PD รวม", "FH"]].flatMap(([left, right], i) => [
                        <div key={`a${i}`} className="flex items-center gap-2">
                          <label className="text-sm text-muted-foreground w-14">{left}</label>
                          <Input placeholder="0" /><span className="text-xs text-muted-foreground">มม.</span>
                        </div>,
                        <div key={`b${i}`} className="flex items-center gap-2">
                          <label className="text-sm text-muted-foreground w-14">{right}</label>
                          <Input placeholder="0" /><span className="text-xs text-muted-foreground">มม.</span>
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
                  <RxTableOldEditable value={rxOld} onChange={setRxOld} />
                </div>
              </SectionCard>

              {/* ── Lens + Price ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="เลนส์และกรอบแว่น">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-3">เลนส์</h4>
                      <div className="space-y-3">
                        <Field label="ยี่ห้อเลนส์">
                          <Select>
                            <option value="">— เลือก —</option>
                            <option>RODENSTOCK</option><option>HOYA</option><option>ZEISS</option>
                          </Select>
                        </Field>
                        <Field label="รุ่นเลนส์">
                          <Select>
                            <option value="">— เลือก —</option>
                            <option>PROGRESSIVE Individual 2</option>
                          </Select>
                        </Field>
                        <Field label="Index">
                          <Select>
                            <option value="">— เลือก —</option>
                            <option>1.56</option><option>1.60</option><option>1.67</option><option>1.74</option>
                          </Select>
                        </Field>
                        <Field label="Coating">
                          <Select>
                            <option value="">— เลือก —</option>
                            <option>Multicoat + Blue Light</option><option>Photochromic</option><option>Transition</option>
                          </Select>
                        </Field>
                        <Field label="สีเลนส์">
                          <Select>
                            <option value="">— เลือก —</option>
                            <option>Clear</option><option>Brown</option><option>Grey</option>
                          </Select>
                        </Field>
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
                    </div>
                  </div>
                </SectionCard>

                {/* ── Pricing — numbers only, auto-calculated ── */}
                <SectionCard title="ราคาและการชำระเงิน">
                  <div className="space-y-3">
                    {([
                      ["ราคากรอบแว่น", "frame"],
                      ["ราคาเลนส์",    "lens"],
                      ["สารเคลือบ / อื่นๆ", "coating"],
                    ] as const).map(([label, key]) => (
                      <div key={key} className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <Input
                          value={price[key]}
                          onChange={(e) => setPrice((p) => ({ ...p, [key]: numOnly(e.target.value) }))}
                          placeholder="0.00"
                          className="text-right"
                          inputMode="decimal"
                        />
                        <span className="text-xs text-muted-foreground">บาท</span>
                      </div>
                    ))}

                    {/* Subtotal (read-only) */}
                    <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3 pt-2 border-t border-border">
                      <span className="text-sm font-semibold">รวมราคาสินค้า</span>
                      <span className="text-right font-semibold tabular-nums">{subtotal.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">บาท</span>
                    </div>

                    {/* Discount */}
                    <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                      <span className="text-sm text-destructive">ส่วนลด</span>
                      <Input
                        value={price.discount}
                        onChange={(e) => setPrice((p) => ({ ...p, discount: numOnly(e.target.value) }))}
                        placeholder="0.00"
                        className="text-right text-destructive"
                        inputMode="decimal"
                      />
                      <span className="text-xs text-muted-foreground">บาท</span>
                    </div>

                    {/* Net total (read-only) */}
                    <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3 py-2 px-3 -mx-3 rounded-lg bg-secondary">
                      <span className="text-base font-bold">ยอดรวมสุทธิ</span>
                      <span className="text-right text-xl font-bold text-primary tabular-nums">{net.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">บาท</span>
                    </div>

                    {/* Deposit */}
                    <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                      <span className="text-sm text-muted-foreground">มัดจำ</span>
                      <Input
                        value={price.deposit}
                        onChange={(e) => setPrice((p) => ({ ...p, deposit: numOnly(e.target.value) }))}
                        placeholder="0.00"
                        className="text-right"
                        inputMode="decimal"
                      />
                      <span className="text-xs text-muted-foreground">บาท</span>
                    </div>

                    {/* Remaining (read-only, colored) */}
                    <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                      <span className="text-sm text-muted-foreground">คงเหลือ</span>
                      <span className={`text-right font-semibold tabular-nums ${remaining > 0 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                        {remaining.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">บาท</span>
                    </div>

                    {/* Pickup date */}
                    <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                      <span className="text-sm text-muted-foreground">วันที่นัดรับ</span>
                      <Input
                        type="date"
                        value={price.pickupDate}
                        onChange={(e) => setPrice((p) => ({ ...p, pickupDate: e.target.value }))}
                        className="text-right"
                      />
                      <span />
                    </div>

                    {/* Payment method */}
                    <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                      <span className="text-sm text-muted-foreground">ช่องทางชำระ</span>
                      <Select
                        value={price.paymentMethod}
                        onChange={(e) => setPrice((p) => ({ ...p, paymentMethod: e.target.value }))}
                      >
                        <option>เงินสด</option>
                        <option>โอน</option>
                        <option>บัตรเครดิต</option>
                      </Select>
                      <span />
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* ── Actions ── */}
              <div className="flex flex-wrap gap-3 no-print">
                <button className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 font-medium shadow hover:opacity-90">
                  <Save className="h-5 w-5" /> บันทึกใบงาน
                </button>
<button
  disabled
  className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
>
  <Printer className="h-5 w-5" /> พิมพ์ใบงาน
</button>

<button
  disabled
  className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
>
  <FileDown className="h-5 w-5" /> บันทึกเป็น PDF
</button>
                <button
                 
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
                        <span className={`absolute left-0 top-0 h-6 w-6 rounded-full flex items-center justify-center ${isCurrent ? "bg-primary/15 text-primary ring-2 ring-primary" : "bg-secondary text-muted-foreground"}`}>
                          <Circle className="h-3 w-3" />
                        </span>
                        <div className={`text-sm font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                          {s.label}
                        </div>
                        {isCurrent && <div className="text-xs text-muted-foreground mt-0.5">รอบันทึกใบงาน</div>}
                      </li>
                    );
                  })}
                </ol>
              </SectionCard>

              {/* ── File attachments — always enabled ── */}
              <SectionCard title="เอกสาร / ไฟล์แนบ">
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileAdd}
                  />

                  {attachments.length === 0 ? (
                    <p className="text-xs text-muted-foreground">ยังไม่มีไฟล์แนบ</p>
                  ) : (
                    <ul className="space-y-1.5 mb-2">
                      {attachments.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-1.5 text-xs"
                        >
                          <FileDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="flex-1 truncate text-foreground">{f.name}</span>
                          <button
                            onClick={() => handleFileRemove(i)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 rounded-md border border-dashed border-border text-muted-foreground px-3 py-2.5 text-sm font-medium hover:bg-secondary hover:text-foreground transition-colors"
                  >
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
        </div>
      </AppShell>
    </>
  );
}