import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Circle, Plus, Save, Printer,
  FileDown, Trash2, Search, X, ChevronDown, Loader2, CheckCircle2, ArrowLeft, Edit3, Lock,
} from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const Route = createFileRoute("/jobs/$id")({
  head: () => ({
    meta: [
      { title: "รายละเอียดใบงาน — MARINA OPTICAL" },
      { name: "description", content: "ใบสั่งเลนส์ดิจิทัล / Vision Record" },
    ],
  }),
  component: JobDetailPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface RxRow { sph: string; cyl: string; ax: string; va: string; add: string }
interface RxOldRow extends RxRow { date: string }

// ─── Mock job data ────────────────────────────────────────────────────────────

const MOCK_JOBS: Record<string, {
  jobId: string;
  createdAt: string;
  status: number; // 0–5 index into statusSteps
  customer: {
    id: string; name: string; phone: string; age: string;
    gender: string; occupation: string; address: string;
  };
  info: {
    examiner: string; staff: string; note: string;
  };
  rx: { od: RxRow; os: RxRow };
  rxOld: { od: RxOldRow; os: RxOldRow };
  pd: { pdR: string; pdL: string; pdTotal: string; shr: string; shl: string; fh: string; segH: string };
  lensType: string;
  lens: { brand: string; model: string; index: string; coating: string; color: string };
  frame: { model: string; color: string; size: string; material: string };
  price: {
    frame: string; lens: string; coating: string;
    discount: string; deposit: string;
    paymentMethod: string; pickupDate: string;
  };
}> = {
  "JOB-001042": {
    jobId: "JOB-001042",
    createdAt: "2025-05-20",
    status: 2,
    customer: {
      id: "CUS-000152",
      name: "คุณวิเชียร เกิดสมบัติ",
      phone: "082-447-8801",
      age: "53",
      gender: "ชาย",
      occupation: "ธุรกิจส่วนตัว",
      address: "52/15 ม.3 ต.เสม็ด อ.เมือง จ.ชลบุรี 20000",
    },
    info: { examiner: "ดร.สมชาย วิสัยทัศน์", staff: "น้องมิ้น", note: "ลูกค้าแพ้สารเคลือบ AR ยี่ห้อ X" },
    rx: {
      od: { sph: "-2.50", cyl: "-0.75", ax: "180", va: "6/6", add: "+2.00" },
      os: { sph: "-2.25", cyl: "-1.00", ax: "175", va: "6/6", add: "+2.00" },
    },
    rxOld: {
      od: { sph: "-2.25", cyl: "-0.50", ax: "180", va: "6/7.5", add: "+1.75", date: "2023-11-10" },
      os: { sph: "-2.00", cyl: "-0.75", ax: "170", va: "6/7.5", add: "+1.75", date: "2023-11-10" },
    },
    pd: { pdR: "32.0", pdL: "31.5", pdTotal: "63.5", shr: "22.0", shl: "22.0", fh: "30.0", segH: "18.0" },
    lensType: "PROGRESSIVE (Progressive Addition Lens)",
    lens: { brand: "RODENSTOCK", model: "PROGRESSIVE Individual 2", index: "1.67", coating: "Multicoat + Blue Light", color: "Clear" },
    frame: { model: "RB 6501D", color: "Matte Black", size: "54-17-145", material: "Titanium" },
    price: { frame: "4500", lens: "18000", coating: "1500", discount: "500", deposit: "10000", paymentMethod: "โอน", pickupDate: "2025-05-28" },
  },
  "JOB-001039": {
    jobId: "JOB-001039",
    createdAt: "2025-05-18",
    status: 4,
    customer: {
      id: "CUS-000148",
      name: "คุณสมหญิง ประดิษฐ์ดี",
      phone: "089-123-4567",
      age: "42",
      gender: "หญิง",
      occupation: "พยาบาล",
      address: "12 ถ.สุขุมวิท กรุงเทพฯ 10110",
    },
    info: { examiner: "ดร.วิภา สายตาดี", staff: "น้องแป้ง", note: "" },
    rx: {
      od: { sph: "-1.00", cyl: "-0.25", ax: "90", va: "6/6", add: "" },
      os: { sph: "-0.75", cyl: "0.00", ax: "0", va: "6/6", add: "" },
    },
    rxOld: {
      od: { sph: "-0.75", cyl: "0.00", ax: "0", va: "6/7.5", add: "", date: "2024-01-15" },
      os: { sph: "-0.50", cyl: "0.00", ax: "0", va: "6/7.5", add: "", date: "2024-01-15" },
    },
    pd: { pdR: "31.0", pdL: "31.0", pdTotal: "62.0", shr: "", shl: "", fh: "", segH: "" },
    lensType: "SINGLE VISION",
    lens: { brand: "HOYA", model: "Hilux 1.6 Eyas", index: "1.60", coating: "Multicoat + Blue Light", color: "Clear" },
    frame: { model: "Oakley OX3250", color: "Rose Gold", size: "52-16-140", material: "Stainless" },
    price: { frame: "6200", lens: "4800", coating: "800", discount: "0", deposit: "5000", paymentMethod: "บัตรเครดิต", pickupDate: "2025-05-24" },
  },
};

// ─── Status steps ─────────────────────────────────────────────────────────────

const statusSteps = [
  { label: "รับออเดอร์แล้ว" },
  { label: "รอเลนส์" },
  { label: "กำลังประกอบ" },
  { label: "QC แล้ว" },
  { label: "พร้อมรับ" },
  { label: "ส่งมอบแล้ว" },
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
      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-secondary/40 read-only:cursor-default ${props.className ?? ""}`}
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
      className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm text-center text-foreground focus:outline-none focus:border-ring focus:bg-background focus:ring-1 focus:ring-ring/40 placeholder:text-muted-foreground/40 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

function RxTableEditable({
  value, onChange, disabled,
}: {
  value: { od: RxRow; os: RxRow };
  onChange: (v: { od: RxRow; os: RxRow }) => void;
  disabled?: boolean;
}) {
  const cols: (keyof RxRow)[] = ["sph", "cyl", "ax", "va", "add"];
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-secondary-foreground">
          <tr>{["ข้าง", "SPH", "CYL", "AX", "VA", "ADD"].map((h) => (
            <th key={h} className="px-3 py-2 text-center font-medium first:text-left">{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {(["od", "os"] as const).map((eye) => (
            <tr key={eye} className="border-t border-border">
              <td className="px-3 py-1.5 font-semibold text-primary whitespace-nowrap">{eye === "od" ? "R (OD)" : "L (OS)"}</td>
              {cols.map((col) => (
                <td key={col} className="px-1 py-1">
                  <RxInput
                    disabled={disabled}
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

function RxTableOldEditable({
  value, onChange, disabled,
}: {
  value: { od: RxOldRow; os: RxOldRow };
  onChange: (v: { od: RxOldRow; os: RxOldRow }) => void;
  disabled?: boolean;
}) {
  const cols: (keyof RxOldRow)[] = ["sph", "cyl", "ax", "va", "add", "date"];
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-secondary-foreground">
          <tr>{["ข้าง", "SPH", "CYL", "AX", "VA", "ADD", "วันที่วัด"].map((h) => (
            <th key={h} className="px-3 py-2 text-center font-medium first:text-left">{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {(["od", "os"] as const).map((eye) => (
            <tr key={eye} className="border-t border-border">
              <td className="px-3 py-1.5 font-semibold text-primary whitespace-nowrap">{eye === "od" ? "R (OD)" : "L (OS)"}</td>
              {cols.map((col) => (
                <td key={col} className="px-1 py-1">
                  <RxInput
                    disabled={disabled}
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

function numOnly(v: string) {
  return v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ index }: { index: number }) {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  ];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors[index] ?? colors[0]}`}>
      {statusSteps[index]?.label}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function JobDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Load mock data (fallback to first job if id not found)
  const raw = MOCK_JOBS[id] ?? MOCK_JOBS["JOB-001042"];

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // ── Form state (cloned from raw) ───────────────────────────────────────────
  const [jobId]        = useState(raw.jobId);
  const [createdAt]    = useState(raw.createdAt);
  const [status, setStatus] = useState(raw.status);

  const [customer, setCustomer] = useState({ ...raw.customer });
  const [info, setInfo]         = useState({ ...raw.info });
  const [rx, setRx]             = useState({ od: { ...raw.rx.od }, os: { ...raw.rx.os } });
  const [rxOld, setRxOld]       = useState({ od: { ...raw.rxOld.od }, os: { ...raw.rxOld.os } });
  const [pd, setPd]             = useState({ ...raw.pd });
  const [lensType, setLensType] = useState(raw.lensType);
  const [lens, setLens]         = useState({ ...raw.lens });
  const [frame, setFrame]       = useState({ ...raw.frame });
  const [price, setPrice]       = useState({ ...raw.price });

  // ── Derived pricing ────────────────────────────────────────────────────────
  const frameN    = parseFloat(price.frame)    || 0;
  const lensN     = parseFloat(price.lens)     || 0;
  const coatingN  = parseFloat(price.coating)  || 0;
  const subtotal  = frameN + lensN + coatingN;
  const discountN = parseFloat(price.discount) || 0;
  const net       = Math.max(0, subtotal - discountN);
  const depositN  = parseFloat(price.deposit)  || 0;
  const remaining = Math.max(0, net - depositN);

  // ── Save (mock) ────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  }

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
        windowWidth: 1200,
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

      pdf.save(`ใบงาน-${jobId}-${customer.name.replace(/\s/g, "_")}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#print-root) { display: none !important; }
          #print-root { display: block !important; position: static !important; }
          .no-print { display: none !important; }
          @page { margin: 12mm; size: A4; }
        }
      `}</style>

      <AppShell
        title={
          <div className="flex items-center gap-3 no-print">
            <button
              onClick={() => navigate({ to: "/jobs" })}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> รายการใบงาน
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-semibold text-foreground">{jobId}</span>
            <StatusBadge index={status} />
          </div>
        }
        subtitle={`วันที่สร้าง: ${createdAt} — ใบสั่งเลนส์ดิจิทัล`}
      >
        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between gap-3 px-6 pt-4 pb-2 no-print">
          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-lg border border-primary text-primary px-4 py-2 text-sm font-medium hover:bg-primary/5"
              >
                <Edit3 className="h-4 w-4" /> แก้ไขใบงาน
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
                >
                  {saving
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> กำลังบันทึก…</>
                    : <><Save className="h-4 w-4" /> บันทึก</>}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  <X className="h-4 w-4" /> ยกเลิก
                </button>
              </>
            )}
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" /> บันทึกแล้ว
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              <Printer className="h-4 w-4" /> พิมพ์
            </button>
            <button
              onClick={handlePdf}
              disabled={pdfLoading}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pdfLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> กำลังสร้าง…</>
                : <><FileDown className="h-4 w-4" /> บันทึก PDF</>}
            </button>
          </div>
        </div>

        {/* ── Edit mode banner ── */}
        {editing && (
          <div className="mx-6 mb-2 flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm text-primary no-print">
            <Edit3 className="h-4 w-4 flex-shrink-0" />
            กำลังแก้ไขใบงาน — กดบันทึกเมื่อเสร็จสิ้น
          </div>
        )}
        {!editing && (
          <div className="mx-6 mb-2 flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-2.5 text-sm text-muted-foreground no-print">
            <Lock className="h-4 w-4 flex-shrink-0" />
            โหมดดูข้อมูล — กด "แก้ไขใบงาน" เพื่อแก้ไข
          </div>
        )}

        {/* ── Printable content ── */}
        <div id="print-root" ref={printRef}>
          {/* Print header */}
          <div className="hidden print:block px-6 py-4 border-b border-border mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">MARINA OPTICAL</h1>
                <p className="text-sm text-muted-foreground mt-0.5">ใบสั่งเลนส์ / Vision Record</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{jobId}</p>
                <p className="text-muted-foreground">วันที่: {createdAt}</p>
                <p className="text-muted-foreground">สถานะ: {statusSteps[status]?.label}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 p-6">
            <div className="space-y-6 min-w-0">

              {/* ── Customer Info ── */}
              <SectionCard title="ข้อมูลลูกค้า">
                <fieldset
                  disabled={!editing}
                  className="[&:disabled]:opacity-70 [&:disabled]:pointer-events-none transition-opacity duration-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <Field label="รหัสลูกค้า">
                      <Input value={customer.id} readOnly className="bg-secondary/40" />
                    </Field>
                    <Field label="อายุ">
                      <div className="grid grid-cols-[1fr_40px_60px_1fr] items-center gap-2">
                        <Input
                          value={customer.age}
                          onChange={(e) => setCustomer((p) => ({ ...p, age: numOnly(e.target.value) }))}
                          inputMode="numeric"
                        />
                        <span className="text-sm text-muted-foreground text-center">ปี</span>
                        <span className="text-sm text-muted-foreground">เพศ</span>
                        <Select value={customer.gender} onChange={(e) => setCustomer((p) => ({ ...p, gender: e.target.value }))}>
                          <option>ชาย</option>
                          <option>หญิง</option>
                        </Select>
                      </div>
                    </Field>
                    <Field label="ชื่อ-นามสกุล">
                      <Input value={customer.name} onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))} />
                    </Field>
                    <Field label="อาชีพ">
                      <Input value={customer.occupation} onChange={(e) => setCustomer((p) => ({ ...p, occupation: e.target.value }))} />
                    </Field>
                    <Field label="เบอร์โทรศัพท์">
                      <Input value={customer.phone} onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))} />
                    </Field>
                    <Field label="ผู้ตรวจสายตา">
                      <Input value={info.examiner} onChange={(e) => setInfo((p) => ({ ...p, examiner: e.target.value }))} />
                    </Field>
                    <Field label="ที่อยู่">
                      <Input value={customer.address} onChange={(e) => setCustomer((p) => ({ ...p, address: e.target.value }))} />
                    </Field>
                    <Field label="ผู้รับงาน">
                      <Input value={info.staff} onChange={(e) => setInfo((p) => ({ ...p, staff: e.target.value }))} />
                    </Field>
                    <Field label="หมายเหตุ">
                      <Input value={info.note} onChange={(e) => setInfo((p) => ({ ...p, note: e.target.value }))} placeholder="—" />
                    </Field>
                  </div>
                </fieldset>
              </SectionCard>

              {/* ── Rx ── */}
              <SectionCard title="ค่าสายตา">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-foreground">ค่าสายตาปัจจุบัน</h3>
                    <RxTableEditable value={rx} onChange={setRx} disabled={!editing} />
                    <div className="mt-4 grid grid-cols-[110px_1fr] items-center gap-3">
                      <label className="text-sm text-muted-foreground">ประเภทเลนส์</label>
                      <Select
                        value={lensType}
                        onChange={(e) => setLensType(e.target.value)}
                        disabled={!editing}
                      >
                        <option>PROGRESSIVE (Progressive Addition Lens)</option>
                        <option>SINGLE VISION</option>
                        <option>BIFOCAL</option>
                        <option>OFFICE LENS</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-foreground">PD / การวัด</h3>
                    <fieldset disabled={!editing} className="[&:disabled]:opacity-70 [&:disabled]:pointer-events-none">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {([
                          ["PD R", "pdR"], ["SHR", "shr"],
                          ["PD L", "pdL"], ["SHL", "shl"],
                          ["PD รวม", "pdTotal"], ["FH", "fh"],
                        ] as const).map(([label, key]) => (
                          <div key={key} className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground w-14 flex-shrink-0">{label}</label>
                            <Input
                              value={pd[key]}
                              onChange={(e) => setPd((p) => ({ ...p, [key]: numOnly(e.target.value) }))}
                              placeholder="0"
                              className="max-w-[80px]"
                            />
                            <span className="text-xs text-muted-foreground">มม.</span>
                          </div>
                        ))}
                        <div className="col-span-2 flex items-center gap-2">
                          <label className="text-sm text-muted-foreground w-40">Segment Height</label>
                          <Input
                            value={pd.segH}
                            onChange={(e) => setPd((p) => ({ ...p, segH: numOnly(e.target.value) }))}
                            placeholder="0"
                            className="max-w-[80px]"
                          />
                          <span className="text-xs text-muted-foreground">มม.</span>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3 text-foreground">ค่าสายตาเดิม (อ้างอิง)</h3>
                  <RxTableOldEditable value={rxOld} onChange={setRxOld} disabled={!editing} />
                </div>
              </SectionCard>

              {/* ── Lens + Frame + Price ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="เลนส์และกรอบแว่น">
                  <fieldset disabled={!editing} className="[&:disabled]:opacity-70 [&:disabled]:pointer-events-none">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-3">เลนส์</h4>
                        <div className="space-y-3">
                          <Field label="ยี่ห้อ">
                            <Select value={lens.brand} onChange={(e) => setLens((p) => ({ ...p, brand: e.target.value }))}>
                              <option>RODENSTOCK</option><option>HOYA</option><option>ZEISS</option>
                            </Select>
                          </Field>
                          <Field label="รุ่น">
                            <Input value={lens.model} onChange={(e) => setLens((p) => ({ ...p, model: e.target.value }))} />
                          </Field>
                          <Field label="Index">
                            <Select value={lens.index} onChange={(e) => setLens((p) => ({ ...p, index: e.target.value }))}>
                              <option>1.56</option><option>1.60</option><option>1.67</option><option>1.74</option>
                            </Select>
                          </Field>
                          <Field label="Coating">
                            <Select value={lens.coating} onChange={(e) => setLens((p) => ({ ...p, coating: e.target.value }))}>
                              <option>Multicoat + Blue Light</option><option>Photochromic</option><option>Transition</option>
                            </Select>
                          </Field>
                          <Field label="สี">
                            <Select value={lens.color} onChange={(e) => setLens((p) => ({ ...p, color: e.target.value }))}>
                              <option>Clear</option><option>Brown</option><option>Grey</option>
                            </Select>
                          </Field>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-3">กรอบแว่น</h4>
                        <div className="space-y-3">
                          <Field label="รุ่น"><Input value={frame.model} onChange={(e) => setFrame((p) => ({ ...p, model: e.target.value }))} /></Field>
                          <Field label="สี"><Input value={frame.color} onChange={(e) => setFrame((p) => ({ ...p, color: e.target.value }))} /></Field>
                          <Field label="ขนาด"><Input value={frame.size} onChange={(e) => setFrame((p) => ({ ...p, size: e.target.value }))} /></Field>
                          <Field label="วัสดุ"><Input value={frame.material} onChange={(e) => setFrame((p) => ({ ...p, material: e.target.value }))} /></Field>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </SectionCard>

                <SectionCard title="ราคาและการชำระเงิน">
                  <fieldset disabled={!editing} className="[&:disabled]:opacity-70 [&:disabled]:pointer-events-none">
                    <div className="space-y-3">
                      {([
                        ["ราคากรอบแว่น", "frame"],
                        ["ราคาเลนส์", "lens"],
                        ["สารเคลือบ / อื่นๆ", "coating"],
                      ] as const).map(([label, key]) => (
                        <div key={key} className="grid grid-cols-[1fr_160px_40px] items-center gap-3">
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

                      <div className="grid grid-cols-[1fr_160px_40px] items-center gap-3 pt-2 border-t border-border">
                        <span className="text-sm font-semibold">รวมราคาสินค้า</span>
                        <span className="text-right font-semibold tabular-nums">{subtotal.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">บาท</span>
                      </div>

                      <div className="grid grid-cols-[1fr_160px_40px] items-center gap-3">
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

                      <div className="grid grid-cols-[1fr_160px_40px] items-center gap-3 py-2 px-3 -mx-3 rounded-lg bg-secondary">
                        <span className="text-base font-bold">ยอดรวมสุทธิ</span>
                        <span className="text-right text-xl font-bold text-primary tabular-nums">{net.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">บาท</span>
                      </div>

                      <div className="grid grid-cols-[1fr_160px_40px] items-center gap-3">
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

                      <div className="grid grid-cols-[1fr_160px_40px] items-center gap-3">
                        <span className="text-sm text-muted-foreground">คงเหลือ</span>
                        <span className={`text-right font-semibold tabular-nums ${remaining > 0 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                          {remaining.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">บาท</span>
                      </div>

                      <div className="grid grid-cols-[1fr_160px_40px] items-center gap-3">
                        <span className="text-sm text-muted-foreground">วันที่นัดรับ</span>
                        <Input
                          type="date"
                          value={price.pickupDate}
                          onChange={(e) => setPrice((p) => ({ ...p, pickupDate: e.target.value }))}
                          className="text-right"
                        />
                        <span />
                      </div>

                      <div className="grid grid-cols-[1fr_160px_40px] items-center gap-3">
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
                  </fieldset>
                </SectionCard>
              </div>

              {/* ── Bottom actions (edit mode only) ── */}
              {/* {editing && (
                <div className="flex flex-wrap gap-3 no-print pb-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 font-medium shadow hover:opacity-90 disabled:opacity-60"
                  >
                    {saving
                      ? <><Loader2 className="h-5 w-5 animate-spin" /> กำลังบันทึก…</>
                      : <><Save className="h-5 w-5" /> บันทึกใบงาน</>}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg border border-destructive text-destructive px-5 py-3 font-medium hover:bg-destructive/10"
                  >
                    <X className="h-5 w-5" /> ยกเลิกการแก้ไข
                  </button>
                </div>
              )} */}
            </div>

            {/* ── Right rail ── */}
            <aside className="space-y-6">
              {/* Status stepper */}
              <SectionCard title="สถานะงาน">
                <ol className="relative space-y-5">
                  {statusSteps.map((s, i) => {
                    const isPast    = i < status;
                    const isCurrent = i === status;
                    return (
                      <li key={s.label} className="relative pl-9">
                        {i < statusSteps.length - 1 && (
                          <span className={`absolute left-3 top-6 bottom-[-1.25rem] w-px ${isPast || isCurrent ? "bg-primary/40" : "bg-border"}`} />
                        )}
                        <span className={`absolute left-0 top-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${isCurrent ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                            : isPast ? "bg-primary/20 text-primary"
                            : "bg-secondary text-muted-foreground"}`}
                        >
                          {isPast ? "✓" : i + 1}
                        </span>
                        <div className={`text-sm font-medium ${isCurrent ? "text-foreground" : isPast ? "text-primary/70" : "text-muted-foreground"}`}>
                          {s.label}
                        </div>
                        {isCurrent && <div className="text-xs text-primary mt-0.5">● ขั้นตอนปัจจุบัน</div>}
                      </li>
                    );
                  })}
                </ol>

                {/* Status change (edit mode only) */}
                {editing && (
                  <div className="mt-5 pt-4 border-t border-border">
                    <label className="text-xs text-muted-foreground mb-2 block">เปลี่ยนสถานะ</label>
                    <Select value={String(status)} onChange={(e) => setStatus(Number(e.target.value))}>
                      {statusSteps.map((s, i) => (
                        <option key={i} value={i}>{s.label}</option>
                      ))}
                    </Select>
                  </div>
                )}
              </SectionCard>

              {/* Job info summary */}
              <SectionCard title="สรุปใบงาน">
                <dl className="space-y-2 text-sm">
                  {[
                    ["เลขใบงาน", jobId],
                    ["วันที่สร้าง", createdAt],
                    ["วันนัดรับ", price.pickupDate || "—"],
                    ["ช่องทางชำระ", price.paymentMethod],
                    ["ยอดรวม", `${net.toFixed(2)} บาท`],
                    ["มัดจำ", `${depositN.toFixed(2)} บาท`],
                    ["คงเหลือ", `${remaining.toFixed(2)} บาท`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </SectionCard>

              {/* Notes */}
              <SectionCard title="หมายเหตุ / ปัญหา">
                <textarea
                  rows={5}
                  disabled={!editing}
                  placeholder="บันทึกข้อมูลเพิ่มเติมสำหรับใบงานนี้..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </SectionCard>
            </aside>
          </div>
        </div>
      </AppShell>
    </>
  );
}