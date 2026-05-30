import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Circle, Plus, Save, Printer,
  FileDown, Trash2, Search, X, ChevronDown, Loader2, CheckCircle2, Edit3, Lock,
} from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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

interface RxRow { sph: string; cyl: string; ax: string; va: string; add: string }
interface RxOldRow extends RxRow { date: string }

// ── เพิ่ม SettingsItem & SettingsOptions (เหมือนหน้า new) ──────────────────
interface SettingsItem {
  id: number;
  name: string;
}
interface SettingsOptions {
  lensTypes: SettingsItem[];
  brands: SettingsItem[];
  models: SettingsItem[];
  indexes: SettingsItem[];
  coatings: SettingsItem[];
  colors: SettingsItem[];
}

const emptyRx = (): RxRow => ({ sph: "", cyl: "", ax: "", va: "", add: "" });
const emptyOldRx = (): RxOldRow => ({ sph: "", cyl: "", ax: "", va: "", add: "", date: "" });

const statusSteps = [
  { label: "รับออเดอร์แล้ว" },
  { label: "รอเลนส์" },
  { label: "กำลังประกอบ" },
  { label: "QC แล้ว" },
  { label: "พร้อมรับ" },
  { label: "ส่งมอบแล้ว" },
];

const STATUS_INDEX: Record<string, number> = {
  pending:      0,
  waiting_lens: 1,
  in_progress:  2,
  qc_done:      3,
  ready:        4,
  delivered:    5,
  cancelled:    5,
};

const INDEX_STATUS = [
  "pending",
  "waiting_lens",
  "in_progress",
  "qc_done",
  "ready",
  "delivered",
];

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
    <select {...props} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 disabled:cursor-not-allowed">
      {children}
    </select>
  );
}

function RxInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm text-center text-foreground focus:outline-none focus:border-ring focus:bg-background focus:ring-1 focus:ring-ring/40 placeholder:text-muted-foreground/40 disabled:opacity-50 disabled:cursor-not-allowed" />
  );
}

// ── SelectOrInput (copy จากหน้า new) ─────────────────────────────────────────
function SelectOrInput({
  value,
  onChange,
  options,
  placeholder = "— เลือก —",
  customPlaceholder = "พิมพ์รายละเอียด...",
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SettingsItem[];
  placeholder?: string;
  customPlaceholder?: string;
  disabled?: boolean;
}) {
  const isCustom = value !== "" && !options.some((o) => o.name === value);
  const [showInput, setShowInput] = useState(isCustom);

  // sync เมื่อ options โหลดมาทีหลัง หรือ value เปลี่ยน
  useEffect(() => {
    if (value !== "" && options.length > 0) {
      const matched = options.some((o) => o.name === value);
      if (!matched) setShowInput(true);
      else setShowInput(false);
    }
    if (value === "") setShowInput(false);
  }, [options, value]);

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (v === "__other__") {
      setShowInput(true);
      onChange("");
    } else {
      setShowInput(false);
      onChange(v);
    }
  }

  if (showInput) {
    return (
      <div className="flex gap-1.5">
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={customPlaceholder}
          disabled={disabled}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          title="กลับไปเลือกจากรายการ"
          onClick={() => {
            setShowInput(false);
            onChange("");
          }}
          disabled={disabled}
          className="flex-shrink-0 rounded-md border border-border px-2 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Select value={value} onChange={handleSelectChange} disabled={disabled}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.name}>
          {o.name}
        </option>
      ))}
      <option value="__other__">อื่นๆ (พิมพ์เอง)</option>
    </Select>
  );
}

function RxTableEditable({ value, onChange, disabled }: { value: { od: RxRow; os: RxRow }; onChange: (v: { od: RxRow; os: RxRow }) => void; disabled?: boolean }) {
  const cols: (keyof RxRow)[] = ["sph", "cyl", "ax", "va", "add"];
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-secondary-foreground">
          <tr>{["ข้าง","SPH","CYL","AX","VA","ADD"].map((h) => <th key={h} className="px-3 py-2 text-center font-medium first:text-left">{h}</th>)}</tr>
        </thead>
        <tbody>
          {(["od","os"] as const).map((eye) => (
            <tr key={eye} className="border-t border-border">
              <td className="px-3 py-1.5 font-semibold text-primary whitespace-nowrap">{eye === "od" ? "R (OD)" : "L (OS)"}</td>
              {cols.map((col) => (
                <td key={col} className="px-1 py-1">
                  <RxInput disabled={disabled} value={value[eye][col]} onChange={(e) => onChange({ ...value, [eye]: { ...value[eye], [col]: e.target.value } })} placeholder="—" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RxTableOldEditable({ value, onChange, disabled }: { value: { od: RxOldRow; os: RxOldRow }; onChange: (v: { od: RxOldRow; os: RxOldRow }) => void; disabled?: boolean }) {
  const cols: (keyof RxOldRow)[] = ["sph", "cyl", "ax", "va", "add", "date"];
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-secondary-foreground">
          <tr>{["ข้าง","SPH","CYL","AX","VA","ADD","วันที่วัด"].map((h) => <th key={h} className="px-3 py-2 text-center font-medium first:text-left">{h}</th>)}</tr>
        </thead>
        <tbody>
          {(["od","os"] as const).map((eye) => (
            <tr key={eye} className="border-t border-border">
              <td className="px-3 py-1.5 font-semibold text-primary whitespace-nowrap">{eye === "od" ? "R (OD)" : "L (OS)"}</td>
              {cols.map((col) => (
                <td key={col} className="px-1 py-1">
                  <RxInput disabled={disabled} value={value[eye][col]} onChange={(e) => onChange({ ...value, [eye]: { ...value[eye], [col]: e.target.value } })} placeholder="—" />
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

function StatusBadge({ index }: { index: number }) {
  const colors = [
    "bg-blue-100 text-blue-700","bg-yellow-100 text-yellow-700",
    "bg-orange-100 text-orange-700","bg-purple-100 text-purple-700",
    "bg-green-100 text-green-700","bg-gray-100 text-gray-700",
  ];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors[index] ?? colors[0]}`}>
      {statusSteps[index]?.label}
    </span>
  );
}

function JobDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // ── Settings options (เหมือนหน้า new) ─────────────────────────────────────
  const [opts, setOpts] = useState<SettingsOptions>({
    lensTypes: [],
    brands: [],
    models: [],
    indexes: [],
    coatings: [],
    colors: [],
  });
  const [optsLoading, setOptsLoading] = useState(true);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [visitId, setVisitId]   = useState<number | null>(null);
  const [rxId, setRxId]         = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState("");
  const [status, setStatus]     = useState(0);

  const [customer, setCustomer] = useState({ id: "", name: "", phone: "", age: "", gender: "ชาย", occupation: "", address: "" });
  const [info, setInfo]         = useState({ examiner: "", staff: "", note: "" });
  const [rx, setRx]             = useState<{ od: RxRow; os: RxRow }>({ od: emptyRx(), os: emptyRx() });
  const [rxOld, setRxOld]       = useState<{ od: RxOldRow; os: RxOldRow }>({ od: emptyOldRx(), os: emptyOldRx() });
  const [pd, setPd]             = useState({ pdR: "", pdL: "", pdTotal: "", shr: "", shl: "", fh: "", segH: "" });
  const [lensType, setLensType] = useState("");
  const [lens, setLens]         = useState({ brand: "", model: "", index: "", coating: "", color: "" });
  const [frame, setFrame]       = useState({ model: "", color: "", size: "", material: "" });
  const [price, setPrice]       = useState({ frame: "", lens: "", coating: "", discount: "", deposit: "", paymentMethod: "เงินสด", pickupDate: "" });
  const [jobNote, setJobNote]   = useState("");

  // ── Fetch settings (เหมือนหน้า new) ───────────────────────────────────────
  useEffect(() => {
    async function fetchSettings() {
      const [lensTypes, brands, models, indexes, coatings, colors] = await Promise.all([
        supabase.from("lens_types").select("id, name").order("id"),
        supabase.from("lens_brands").select("id, name").order("id"),
        supabase.from("lens_models").select("id, name").order("id"),
        supabase.from("lens_indexes").select("id, name").order("id"),
        supabase.from("lens_coatings").select("id, name").order("id"),
        supabase.from("lens_colors").select("id, name").order("id"),
      ]);
      setOpts({
        lensTypes: lensTypes.data ?? [],
        brands: brands.data ?? [],
        models: models.data ?? [],
        indexes: indexes.data ?? [],
        coatings: coatings.data ?? [],
        colors: colors.data ?? [],
      });
      setOptsLoading(false);
    }
    fetchSettings();
  }, []);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: visit, error } = await supabase
        .from("visits")
        .select("*, customers(*)")
        .eq("job_no", Number(id))
        .maybeSingle();

      if (error || !visit) { setNotFound(true); setLoading(false); return; }

      const c = visit.customers as any;
      setVisitId(visit.id);
      setCreatedAt(visit.date ?? "");
      setStatus(STATUS_INDEX[visit.status] ?? 0);

      setCustomer({
        id:         c?.id ?? "",
        name:       c?.name ?? "",
        phone:      c?.phone ?? "",
        age:        String(c?.age ?? ""),
        gender:     c?.gender ?? "ชาย",
        occupation: c?.occupation ?? "",
        address:    c?.address ?? "",
      });

      setInfo({
        examiner: visit.examiner ?? "",
        staff:    visit.staff ?? "",
        note:     visit.note ?? "",
      });

      setLensType(visit.lens_type ?? "");
      setLens({
        brand:   visit.lens_brand   ?? "",
        model:   visit.lens_model   ?? "",
        index:   visit.lens_index   ?? "",
        coating: visit.lens_coating ?? "",
        color:   visit.lens_color   ?? "",
      });
      setFrame({
        model:    visit.frame_model    ?? "",
        color:    visit.frame_color    ?? "",
        size:     visit.frame_size     ?? "",
        material: visit.frame_material ?? "",
      });
      setPd({
        pdR:     String(visit.pd_r      ?? ""),
        pdL:     String(visit.pd_l      ?? ""),
        pdTotal: String(visit.pd_total  ?? ""),
        shr:     String(visit.shr       ?? ""),
        shl:     String(visit.shl       ?? ""),
        fh:      String(visit.fh        ?? ""),
        segH:    String(visit.seg_height ?? ""),
      });
      setPrice({
        frame:         String(visit.price     ?? ""),
        lens:          "",
        coating:       "",
        discount:      String(visit.discount  ?? ""),
        deposit:       String(visit.deposit   ?? ""),
        paymentMethod: visit.payment_method   ?? "เงินสด",
        pickupDate:    visit.pickup           ?? "",
      });
      setJobNote(visit.note ?? "");

      const { data: rxData } = await supabase
        .from("rx_history")
        .select("*")
        .eq("customer_id", c?.id)
        .order("date", { ascending: false })
        .limit(2);

      if (rxData && rxData.length > 0) {
        const cur = rxData[0];
        setRxId(cur.id);
        setRx({
          od: { sph: String(cur.sph_r ?? ""), cyl: String(cur.cyl_r ?? ""), ax: String(cur.ax_r ?? ""), va: cur.va_r ?? "", add: String(cur.add_r ?? "") },
          os: { sph: String(cur.sph_l ?? ""), cyl: String(cur.cyl_l ?? ""), ax: String(cur.ax_l ?? ""), va: cur.va_l ?? "", add: String(cur.add_l ?? "") },
        });
      }
      if (rxData && rxData.length > 1) {
        const old = rxData[1];
        setRxOld({
          od: { sph: String(old.sph_r ?? ""), cyl: String(old.cyl_r ?? ""), ax: String(old.ax_r ?? ""), va: old.va_r ?? "", add: String(old.add_r ?? ""), date: old.date ?? "" },
          os: { sph: String(old.sph_l ?? ""), cyl: String(old.cyl_l ?? ""), ax: String(old.ax_l ?? ""), va: old.va_l ?? "", add: String(old.add_l ?? ""), date: old.date ?? "" },
        });
      }

      setLoading(false);
    }
    load();
  }, [id]);

  // ── Pricing ────────────────────────────────────────────────────────────────
  const frameN    = parseFloat(price.frame)    || 0;
  const lensN     = parseFloat(price.lens)     || 0;
  const coatingN  = parseFloat(price.coating)  || 0;
  const subtotal  = frameN + lensN + coatingN;
  const discountN = parseFloat(price.discount) || 0;
  const net       = Math.max(0, subtotal - discountN);
  const depositN  = parseFloat(price.deposit)  || 0;
  const remaining = Math.max(0, net - depositN);

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!visitId) return;
    setSaving(true);

    await supabase.from("visits").update({
      status:         INDEX_STATUS[status] ?? "pending",
      pickup:         price.pickupDate || null,
      price:          net,
      discount:       discountN,
      deposit:        depositN,
      payment_method: price.paymentMethod,
      lens_type:      lensType || null,
      lens_brand:     lens.brand || null,
      lens_model:     lens.model || null,
      lens_index:     lens.index || null,
      lens_coating:   lens.coating || null,
      lens_color:     lens.color || null,
      frame_model:    frame.model || null,
      frame_color:    frame.color || null,
      frame_size:     frame.size || null,
      frame_material: frame.material || null,
      pd_r:           pd.pdR     ? parseFloat(pd.pdR)     : null,
      pd_l:           pd.pdL     ? parseFloat(pd.pdL)     : null,
      pd_total:       pd.pdTotal ? parseFloat(pd.pdTotal) : null,
      shr:            pd.shr     ? parseFloat(pd.shr)     : null,
      shl:            pd.shl     ? parseFloat(pd.shl)     : null,
      fh:             pd.fh      ? parseFloat(pd.fh)      : null,
      seg_height:     pd.segH    ? parseFloat(pd.segH)    : null,
      examiner:       info.examiner || null,
      staff:          info.staff    || null,
      note:           jobNote       || null,
    }).eq("id", visitId);

    if (rxId) {
      await supabase.from("rx_history").update({
        sph_r: rx.od.sph ? parseFloat(rx.od.sph) : null,
        cyl_r: rx.od.cyl ? parseFloat(rx.od.cyl) : null,
        ax_r:  rx.od.ax  ? parseFloat(rx.od.ax)  : null,
        add_r: rx.od.add ? parseFloat(rx.od.add) : null,
        va_r:  rx.od.va  || null,
        sph_l: rx.os.sph ? parseFloat(rx.os.sph) : null,
        cyl_l: rx.os.cyl ? parseFloat(rx.os.cyl) : null,
        ax_l:  rx.os.ax  ? parseFloat(rx.os.ax)  : null,
        add_l: rx.os.add ? parseFloat(rx.os.add) : null,
        va_l:  rx.os.va  || null,
      }).eq("id", rxId);
    }

    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  }

  // ── Loading / Not found ────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppShell title="ใบงาน">
        <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> กำลังโหลด...
        </div>
      </AppShell>
    );
  }

  if (notFound) {
    return (
      <AppShell title="ไม่พบใบงาน">
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
          <p>ไม่พบใบงานหมายเลข #{id}</p>
          <button onClick={() => navigate({ to: "/customers" })} className="text-sm text-primary underline">กลับหน้าลูกค้า</button>
        </div>
      </AppShell>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-root, #print-root * { visibility: visible; }
          #print-root { position: absolute; inset: 0; }
          .no-print { display: none !important; }
          @page { margin: 12mm; size: A4; }
        }
      `}</style>

      <AppShell
        title={
          <div className="flex items-center gap-3 no-print">
            <span className="text-sm font-semibold text-foreground">ใบงาน #{id}</span>
            <StatusBadge index={status} />
          </div>
        }
        subtitle={`วันที่สร้าง: ${createdAt} — ใบสั่งเลนส์ดิจิทัล`}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-6 pt-4 pb-2 no-print">
          <div className="flex items-center gap-2">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 rounded-lg border border-primary text-primary px-4 py-2 text-sm font-medium hover:bg-primary/5">
                <Edit3 className="h-4 w-4" /> แก้ไขใบงาน
              </button>
            ) : (
              <>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> กำลังบันทึก…</> : <><Save className="h-4 w-4" /> บันทึก</>}
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
                  <X className="h-4 w-4" /> ยกเลิก
                </button>
              </>
            )}
            {saved && <span className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> บันทึกแล้ว</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
              <Printer className="h-4 w-4" /> พิมพ์
            </button>
          </div>
        </div>

        {editing ? (
          <div className="mx-6 mb-2 flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm text-primary no-print">
            <Edit3 className="h-4 w-4 flex-shrink-0" /> กำลังแก้ไขใบงาน — กดบันทึกเมื่อเสร็จสิ้น
          </div>
        ) : (
          <div className="mx-6 mb-2 flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-2.5 text-sm text-muted-foreground no-print">
            <Lock className="h-4 w-4 flex-shrink-0" /> โหมดดูข้อมูล — กด "แก้ไขใบงาน" เพื่อแก้ไข
          </div>
        )}

        <div id="print-root" ref={printRef}>
          <div className="hidden print:block px-6 py-4 border-b border-border mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">MARINA OPTICAL</h1>
                <p className="text-sm text-muted-foreground mt-0.5">ใบสั่งเลนส์ / Vision Record</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">ใบงาน #{id}</p>
                <p className="text-muted-foreground">วันที่: {createdAt}</p>
                <p className="text-muted-foreground">สถานะ: {statusSteps[status]?.label}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 p-6">
            <div className="space-y-6 min-w-0">

              {/* Customer Info */}
              <SectionCard title="ข้อมูลลูกค้า">
                <fieldset disabled={!editing} className="[&:disabled]:opacity-70 [&:disabled]:pointer-events-none transition-opacity duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <Field label="รหัสลูกค้า"><Input value={customer.id} readOnly className="bg-secondary/40" /></Field>
                    <Field label="อายุ">
                      <div className="grid grid-cols-[1fr_40px_60px_1fr] items-center gap-2">
                        <Input value={customer.age} onChange={(e) => setCustomer((p) => ({ ...p, age: numOnly(e.target.value) }))} inputMode="numeric" />
                        <span className="text-sm text-muted-foreground text-center">ปี</span>
                        <span className="text-sm text-muted-foreground">เพศ</span>
                        <Select value={customer.gender} onChange={(e) => setCustomer((p) => ({ ...p, gender: e.target.value }))}><option>ชาย</option><option>หญิง</option></Select>
                      </div>
                    </Field>
                    <Field label="ชื่อ-นามสกุล"><Input value={customer.name} onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))} /></Field>
                    <Field label="อาชีพ"><Input value={customer.occupation} onChange={(e) => setCustomer((p) => ({ ...p, occupation: e.target.value }))} /></Field>
                    <Field label="เบอร์โทรศัพท์"><Input value={customer.phone} onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))} /></Field>
                    <Field label="ผู้ตรวจสายตา"><Input value={info.examiner} onChange={(e) => setInfo((p) => ({ ...p, examiner: e.target.value }))} /></Field>
                    <Field label="ที่อยู่"><Input value={customer.address} onChange={(e) => setCustomer((p) => ({ ...p, address: e.target.value }))} /></Field>
                    <Field label="ผู้รับงาน"><Input value={info.staff} onChange={(e) => setInfo((p) => ({ ...p, staff: e.target.value }))} /></Field>
                  </div>
                </fieldset>
              </SectionCard>

              {/* Rx */}
              <SectionCard title="ค่าสายตา">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">ค่าสายตาปัจจุบัน</h3>
                    <RxTableEditable value={rx} onChange={setRx} disabled={!editing} />
                    <div className="mt-4 grid grid-cols-[110px_1fr] items-center gap-3">
                      <label className="text-sm text-muted-foreground">ประเภทเลนส์</label>
                      {/* ── เปลี่ยนจาก Select ธรรมดา → SelectOrInput ── */}
                      <SelectOrInput
                        value={lensType}
                        onChange={setLensType}
                        options={opts.lensTypes}
                        placeholder="— เลือกประเภทเลนส์ —"
                        customPlaceholder="เช่น PROGRESSIVE..."
                        disabled={!editing || optsLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3">PD / การวัด</h3>
                    <fieldset disabled={!editing} className="[&:disabled]:opacity-70 [&:disabled]:pointer-events-none">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {([["PD R","pdR"],["SHR","shr"],["PD L","pdL"],["SHL","shl"],["PD รวม","pdTotal"],["FH","fh"]] as const).map(([label, key]) => (
                          <div key={key} className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground w-14 flex-shrink-0">{label}</label>
                            <Input value={pd[key]} onChange={(e) => setPd((p) => ({ ...p, [key]: numOnly(e.target.value) }))} placeholder="0" className="max-w-[80px]" />
                            <span className="text-xs text-muted-foreground">มม.</span>
                          </div>
                        ))}
                        <div className="col-span-2 flex items-center gap-2">
                          <label className="text-sm text-muted-foreground w-40">Segment Height</label>
                          <Input value={pd.segH} onChange={(e) => setPd((p) => ({ ...p, segH: numOnly(e.target.value) }))} placeholder="0" className="max-w-[80px]" />
                          <span className="text-xs text-muted-foreground">มม.</span>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3">ค่าสายตาเดิม (อ้างอิง)</h3>
                  <RxTableOldEditable value={rxOld} onChange={setRxOld} disabled={!editing} />
                </div>
              </SectionCard>

              {/* Lens + Frame + Price */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="เลนส์และกรอบแว่น">
                  {/* ── ลบ fieldset wrapper ออก เพราะ SelectOrInput จัดการ disabled เอง ── */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-3">เลนส์</h4>
                      <div className="space-y-3">
                        <Field label="ยี่ห้อ">
                          {/* ── เปลี่ยนจาก Select → SelectOrInput ── */}
                          <SelectOrInput
                            value={lens.brand}
                            onChange={(v) => setLens((p) => ({ ...p, brand: v }))}
                            options={opts.brands}
                            customPlaceholder="เช่น HOYA..."
                            disabled={!editing || optsLoading}
                          />
                        </Field>
                        <Field label="รุ่น">
                          <SelectOrInput
                            value={lens.model}
                            onChange={(v) => setLens((p) => ({ ...p, model: v }))}
                            options={opts.models}
                            customPlaceholder="เช่น Individual 2..."
                            disabled={!editing || optsLoading}
                          />
                        </Field>
                        <Field label="Index">
                          <SelectOrInput
                            value={lens.index}
                            onChange={(v) => setLens((p) => ({ ...p, index: v }))}
                            options={opts.indexes}
                            customPlaceholder="เช่น 1.70..."
                            disabled={!editing || optsLoading}
                          />
                        </Field>
                        <Field label="Coating">
                          <SelectOrInput
                            value={lens.coating}
                            onChange={(v) => setLens((p) => ({ ...p, coating: v }))}
                            options={opts.coatings}
                            customPlaceholder="เช่น UV400..."
                            disabled={!editing || optsLoading}
                          />
                        </Field>
                        <Field label="สี">
                          <SelectOrInput
                            value={lens.color}
                            onChange={(v) => setLens((p) => ({ ...p, color: v }))}
                            options={opts.colors}
                            customPlaceholder="เช่น Blue..."
                            disabled={!editing || optsLoading}
                          />
                        </Field>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-3">กรอบแว่น</h4>
                      {/* กรอบแว่นใช้ Input ธรรมดาเหมือนเดิม แต่ต้องจัดการ disabled ผ่าน prop */}
                      <div className="space-y-3">
                        <Field label="รุ่น"><Input value={frame.model} onChange={(e) => setFrame((p) => ({ ...p, model: e.target.value }))} disabled={!editing} /></Field>
                        <Field label="สี"><Input value={frame.color} onChange={(e) => setFrame((p) => ({ ...p, color: e.target.value }))} disabled={!editing} /></Field>
                        <Field label="ขนาด"><Input value={frame.size} onChange={(e) => setFrame((p) => ({ ...p, size: e.target.value }))} disabled={!editing} /></Field>
                        <Field label="วัสดุ"><Input value={frame.material} onChange={(e) => setFrame((p) => ({ ...p, material: e.target.value }))} disabled={!editing} /></Field>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="ราคาและการชำระเงิน">
                  <fieldset disabled={!editing} className="[&:disabled]:opacity-70 [&:disabled]:pointer-events-none">
                    <div className="space-y-3">
                      {([["ราคากรอบแว่น","frame"],["ราคาเลนส์","lens"],["สารเคลือบ / อื่นๆ","coating"]] as const).map(([label, key]) => (
                        <div key={key} className="grid grid-cols-[1fr_160px_40px] items-center gap-3">
                          <span className="text-sm text-muted-foreground">{label}</span>
                          <Input value={price[key]} onChange={(e) => setPrice((p) => ({ ...p, [key]: numOnly(e.target.value) }))} placeholder="0.00" className="text-right" inputMode="decimal" />
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
                        <Input value={price.discount} onChange={(e) => setPrice((p) => ({ ...p, discount: numOnly(e.target.value) }))} placeholder="0.00" className="text-right text-destructive" inputMode="decimal" />
                        <span className="text-xs text-muted-foreground">บาท</span>
                      </div>
                      <div className="grid grid-cols-[1fr_160px_40px] items-center gap-3 py-2 px-3 -mx-3 rounded-lg bg-secondary">
                        <span className="text-base font-bold">ยอดรวมสุทธิ</span>
                        <span className="text-right text-xl font-bold text-primary tabular-nums">{net.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">บาท</span>
                      </div>
                      <div className="grid grid-cols-[1fr_160px_40px] items-center gap-3">
                        <span className="text-sm text-muted-foreground">มัดจำ</span>
                        <Input value={price.deposit} onChange={(e) => setPrice((p) => ({ ...p, deposit: numOnly(e.target.value) }))} placeholder="0.00" className="text-right" inputMode="decimal" />
                        <span className="text-xs text-muted-foreground">บาท</span>
                      </div>
                      <div className="grid grid-cols-[1fr_160px_40px] items-center gap-3">
                        <span className="text-sm text-muted-foreground">คงเหลือ</span>
                        <span className={`text-right font-semibold tabular-nums ${remaining > 0 ? "text-destructive" : "text-green-600"}`}>{remaining.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">บาท</span>
                      </div>
                      <div className="grid grid-cols-[1fr_160px_40px] items-center gap-3">
                        <span className="text-sm text-muted-foreground">วันที่นัดรับ</span>
                        <Input type="date" value={price.pickupDate} onChange={(e) => setPrice((p) => ({ ...p, pickupDate: e.target.value }))} className="text-right" />
                        <span />
                      </div>
                      <div className="grid grid-cols-[1fr_160px_40px] items-center gap-3">
                        <span className="text-sm text-muted-foreground">ช่องทางชำระ</span>
                        <Select value={price.paymentMethod} onChange={(e) => setPrice((p) => ({ ...p, paymentMethod: e.target.value }))}><option>เงินสด</option><option>โอน</option><option>บัตรเครดิต</option></Select>
                        <span />
                      </div>
                    </div>
                  </fieldset>
                </SectionCard>
              </div>
            </div>

            {/* Right rail */}
            <aside className="space-y-6">
              <SectionCard title="สถานะงาน">
                <ol className="relative space-y-5">
                  {statusSteps.map((s, i) => {
                    const isPast = i < status;
                    const isCurrent = i === status;
                    return (
                      <li key={s.label} className="relative pl-9">
                        {i < statusSteps.length - 1 && <span className={`absolute left-3 top-6 bottom-[-1.25rem] w-px ${isPast || isCurrent ? "bg-primary/40" : "bg-border"}`} />}
                        <span className={`absolute left-0 top-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : isPast ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                          {isPast ? "✓" : i + 1}
                        </span>
                        <div className={`text-sm font-medium ${isCurrent ? "text-foreground" : isPast ? "text-primary/70" : "text-muted-foreground"}`}>{s.label}</div>
                        {isCurrent && <div className="text-xs text-primary mt-0.5">● ขั้นตอนปัจจุบัน</div>}
                      </li>
                    );
                  })}
                </ol>
                {editing && (
                  <div className="mt-5 pt-4 border-t border-border">
                    <label className="text-xs text-muted-foreground mb-2 block">เปลี่ยนสถานะ</label>
                    <Select value={String(status)} onChange={(e) => setStatus(Number(e.target.value))}>
                      {statusSteps.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
                    </Select>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="สรุปใบงาน">
                <dl className="space-y-2 text-sm">
                  {[
                    ["เลขใบงาน",    `#${id}`],
                    ["วันที่สร้าง", createdAt],
                    ["วันนัดรับ",   price.pickupDate || "—"],
                    ["ช่องทางชำระ", price.paymentMethod],
                    ["ยอดรวม",      `${net.toFixed(2)} บาท`],
                    ["มัดจำ",       `${depositN.toFixed(2)} บาท`],
                    ["คงเหลือ",     `${remaining.toFixed(2)} บาท`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </SectionCard>

              <SectionCard title="หมายเหตุ / ปัญหา">
                <textarea
                  rows={5}
                  disabled={!editing}
                  value={jobNote}
                  onChange={(e) => setJobNote(e.target.value)}
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