import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Circle,
  Plus,
  Save,
  Printer,
  FileDown,
  Trash2,
  Search,
  UserPlus,
  X,
  ChevronDown,
  User,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/jobs/new")({
  head: () => ({
    meta: [
      { title: "สร้างใบงานใหม่ — MARINA OPTICAL" },
      { name: "description", content: "ใบสั่งเลนส์ดิจิทัล / New Vision Record" },
    ],
  }),
  component: NewJobPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  occupation: string;
  address: string;
}

interface RxRow {
  sph: string;
  cyl: string;
  ax: string;
  va: string;
  add: string;
}
interface RxOldRow extends RxRow {
  date: string;
}
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
  { label: "รับออเดอร์แล้ว", state: "current" },
  { label: "รอเลนส์", state: "pending" },
  { label: "กำลังประกอบ", state: "pending" },
  { label: "QC แล้ว", state: "pending" },
  { label: "พร้อมรับ", state: "pending" },
  { label: "ส่งมอบแล้ว", state: "pending" },
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

// ─── SelectOrInput ────────────────────────────────────────────────────────────
// dropdown ปกติ — เลือก "อื่นๆ" แล้วพิมพ์เองได้

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
  // ถ้า value ไม่ตรงกับ option ใดเลย (และไม่ว่าง) ถือว่าเป็น custom
  const isCustom = value !== "" && !options.some((o) => o.name === value);
  const [showInput, setShowInput] = useState(isCustom);

  // sync กับ options ที่โหลดมาทีหลัง
  useEffect(() => {
    if (value !== "" && options.length > 0) {
      const matched = options.some((o) => o.name === value);
      if (!matched) setShowInput(true);
    }
  }, [options]);

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
          className="flex-shrink-0 rounded-md border border-border px-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
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

function RxTableEditable({
  value,
  onChange,
}: {
  value: { od: RxRow; os: RxRow };
  onChange: (v: { od: RxRow; os: RxRow }) => void;
}) {
  const cols: (keyof RxRow)[] = ["sph", "cyl", "ax", "va", "add"];
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-secondary-foreground">
          <tr>
            {["ข้าง", "SPH", "CYL", "AX", "VA", "ADD"].map((h) => (
              <th key={h} className="px-3 py-2 text-center font-medium first:text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(["od", "os"] as const).map((eye) => (
            <tr key={eye} className="border-t border-border">
              <td className="px-3 py-1.5 font-semibold text-primary whitespace-nowrap">
                {eye === "od" ? "R (OD)" : "L (OS)"}
              </td>
              {cols.map((col) => (
                <td key={col} className="px-1 py-1">
                  <RxInput
                    value={value[eye][col]}
                    onChange={(e) =>
                      onChange({ ...value, [eye]: { ...value[eye], [col]: e.target.value } })
                    }
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
  value,
  onChange,
}: {
  value: { od: RxOldRow; os: RxOldRow };
  onChange: (v: { od: RxOldRow; os: RxOldRow }) => void;
}) {
  const cols: (keyof RxOldRow)[] = ["sph", "cyl", "ax", "va", "add", "date"];
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-secondary-foreground">
          <tr>
            {["ข้าง", "SPH", "CYL", "AX", "VA", "ADD", "วันที่วัด"].map((h) => (
              <th key={h} className="px-3 py-2 text-center font-medium first:text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(["od", "os"] as const).map((eye) => (
            <tr key={eye} className="border-t border-border">
              <td className="px-3 py-1.5 font-semibold text-primary whitespace-nowrap">
                {eye === "od" ? "R (OD)" : "L (OS)"}
              </td>
              {cols.map((col) => (
                <td key={col} className="px-1 py-1">
                  <RxInput
                    value={value[eye][col]}
                    onChange={(e) =>
                      onChange({ ...value, [eye]: { ...value[eye], [col]: e.target.value } })
                    }
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
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "ชาย",
    occupation: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    const { data } = await supabase
      .from("customers")
      .select("id, name, phone, age, gender, occupation, address")
      .or(`name.ilike.%${q}%,phone.ilike.%${q}%,id.ilike.%${q}%`);
    setResults(data ?? []);
    setSearched(true);
    setLoading(false);
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

  async function handleSaveNew() {
    if (!newForm.name.trim() || !newForm.phone.trim()) return;
    setSaving(true);
    const id = "C" + Date.now().toString().slice(-6);
    const { data, error } = await supabase
      .from("customers")
      .insert({
        id,
        name: newForm.name.trim(),
        phone: newForm.phone.trim(),
        age: newForm.age ? Number(newForm.age) : null,
        gender: newForm.gender,
        occupation: newForm.occupation || null,
        address: newForm.address || null,
        last_visit: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();
    setSaving(false);
    if (!error && data) handleSelect(data);
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
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="ค้นหาด้วย ชื่อ, เบอร์โทร, รหัสลูกค้า…"
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}{" "}
          ค้นหา
        </button>
        <button
          onClick={() => {
            setShowNewForm(true);
            setResults([]);
            setSearched(false);
          }}
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
                <p className="text-xs text-muted-foreground">
                  {c.id} · {c.phone} · อายุ {c.age} ปี
                </p>
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
            <button
              onClick={() => setShowNewForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <Field label="ชื่อ-นามสกุล">
              <Input
                value={newForm.name}
                onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="คุณ..."
              />
            </Field>
            <Field label="เบอร์โทรศัพท์">
              <Input
                value={newForm.phone}
                onChange={(e) => setNewForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="08X-XXX-XXXX"
              />
            </Field>
            <Field label="อายุ">
              <div className="grid grid-cols-[1fr_40px_60px_1fr] items-center gap-2">
                <Input
                  placeholder="35"
                  value={newForm.age}
                  onChange={(e) => setNewForm((p) => ({ ...p, age: e.target.value }))}
                />
                <span className="text-sm text-muted-foreground text-center">ปี</span>
                <span className="text-sm text-muted-foreground">เพศ</span>
                <Select
                  value={newForm.gender}
                  onChange={(e) => setNewForm((p) => ({ ...p, gender: e.target.value }))}
                >
                  <option>ชาย</option>
                  <option>หญิง</option>
                </Select>
              </div>
            </Field>
            <Field label="อาชีพ">
              <Input
                value={newForm.occupation}
                onChange={(e) => setNewForm((p) => ({ ...p, occupation: e.target.value }))}
                placeholder="เช่น ข้าราชการ..."
              />
            </Field>
            <Field label="ที่อยู่">
              <Input
                value={newForm.address}
                onChange={(e) => setNewForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="บ้านเลขที่ ถนน ตำบล..."
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowNewForm(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSaveNew}
              disabled={saving}
              className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}{" "}
              บันทึกและใช้งาน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function numOnly(v: string) {
  return v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

// ─── Main page ────────────────────────────────────────────────────────────────

function NewJobPage() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [rx, setRx] = useState<{ od: RxRow; os: RxRow }>({ od: emptyRx(), os: emptyRx() });
  const [rxOld, setRxOld] = useState<{ od: RxOldRow; os: RxOldRow }>({
    od: emptyOldRx(),
    os: emptyOldRx(),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [info, setInfo] = useState({
    id: "",
    name: "",
    age: "",
    gender: "ชาย",
    phone: "",
    occupation: "",
    address: "",
    examiner: "",
    staff: "",
    note: "",
  });

  const [lensFrame, setLensFrame] = useState({
    lensType: "",
    lensBrand: "",
    lensModel: "",
    lensIndex: "",
    lensCoating: "",
    lensColor: "",
    frameModel: "",
    frameColor: "",
    frameSize: "",
    frameMaterial: "",
  });

  const [pd, setPd] = useState({
    pdR: "",
    pdL: "",
    pdTotal: "",
    shr: "",
    shl: "",
    fh: "",
    segHeight: "",
  });

  const [price, setPrice] = useState({
    frame: "",
    lens: "",
    coating: "",
    discount: "",
    deposit: "",
    paymentMethod: "เงินสด",
    pickupDate: "",
  });

  const [jobNote, setJobNote] = useState("");

  // ── ดึงข้อมูล settings ────────────────────────────────────────────────────
  const [opts, setOpts] = useState<SettingsOptions>({
    lensTypes: [],
    brands: [],
    models: [],
    indexes: [],
    coatings: [],
    colors: [],
  });
  const [optsLoading, setOptsLoading] = useState(true);

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

  useEffect(() => {
    if (customer) {
      setInfo((prev) => ({
        ...prev,
        id: customer.id,
        name: customer.name,
        age: String(customer.age ?? ""),
        gender: customer.gender ?? "ชาย",
        phone: customer.phone,
        occupation: customer.occupation ?? "",
        address: customer.address ?? "",
      }));
    } else {
      setInfo({
        id: "",
        name: "",
        age: "",
        gender: "ชาย",
        phone: "",
        occupation: "",
        address: "",
        examiner: "",
        staff: "",
        note: "",
      });
    }
  }, [customer]);

  const frameN = parseFloat(price.frame) || 0;
  const lensN = parseFloat(price.lens) || 0;
  const coatingN = parseFloat(price.coating) || 0;
  const subtotal = frameN + lensN + coatingN;
  const discountN = parseFloat(price.discount) || 0;
  const net = Math.max(0, subtotal - discountN);
  const depositN = parseFloat(price.deposit) || 0;
  const remaining = Math.max(0, net - depositN);

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    e.target.value = "";
  }

  async function handleSave() {
    if (!customer) {
      setError("กรุณาเลือกลูกค้าก่อน");
      return;
    }
    setSaving(true);
    setError("");

    // 1. หา job_no ล่าสุด
    const { data: lastJob } = await supabase
      .from("visits")
      .select("job_no")
      .order("job_no", { ascending: false })
      .limit(1)
      .maybeSingle();
    const jobNo = (lastJob?.job_no ?? 0) + 1;

    // 2. Insert visit
    const { error: visitErr } = await supabase.from("visits").insert({
      customer_id: customer.id,
      job_no: jobNo,
      date: new Date().toISOString().slice(0, 10),
      lens: lensFrame.lensModel || null,
      frame: lensFrame.frameModel || null,
      pickup: price.pickupDate || null,
      price: net,
      paid: depositN,
      discount: discountN,
      deposit: depositN,
      payment_method: price.paymentMethod,
      status: "pending",
      lens_type: lensFrame.lensType || null,
      lens_brand: lensFrame.lensBrand || null,
      lens_model: lensFrame.lensModel || null,
      lens_index: lensFrame.lensIndex || null,
      lens_coating: lensFrame.lensCoating || null,
      lens_color: lensFrame.lensColor || null,
      frame_model: lensFrame.frameModel || null,
      frame_color: lensFrame.frameColor || null,
      frame_size: lensFrame.frameSize || null,
      frame_material: lensFrame.frameMaterial || null,
      pd_r: pd.pdR ? parseFloat(pd.pdR) : null,
      pd_l: pd.pdL ? parseFloat(pd.pdL) : null,
      pd_total: pd.pdTotal ? parseFloat(pd.pdTotal) : null,
      shr: pd.shr ? parseFloat(pd.shr) : null,
      shl: pd.shl ? parseFloat(pd.shl) : null,
      fh: pd.fh ? parseFloat(pd.fh) : null,
      seg_height: pd.segHeight ? parseFloat(pd.segHeight) : null,
      examiner: info.examiner || null,
      staff: info.staff || null,
      note: jobNote || null,
      issue: null,
      files: attachments.map((f) => f.name),
    });

    if (visitErr) {
      setError("บันทึกใบงานล้มเหลว: " + visitErr.message);
      setSaving(false);
      return;
    }

    // 3. Insert rx_history
    const today = new Date().toISOString().slice(0, 10);
    const { error: rxErr } = await supabase.from("rx_history").insert({
      customer_id: customer.id,
      date: today,
      sph_r: rx.od.sph ? parseFloat(rx.od.sph) : null,
      cyl_r: rx.od.cyl ? parseFloat(rx.od.cyl) : null,
      ax_r: rx.od.ax ? parseFloat(rx.od.ax) : null,
      add_r: rx.od.add ? parseFloat(rx.od.add) : null,
      va_r: rx.od.va || null,
      sph_l: rx.os.sph ? parseFloat(rx.os.sph) : null,
      cyl_l: rx.os.cyl ? parseFloat(rx.os.cyl) : null,
      ax_l: rx.os.ax ? parseFloat(rx.os.ax) : null,
      add_l: rx.os.add ? parseFloat(rx.os.add) : null,
      va_l: rx.os.va || null,
      notes: info.note || null,
    });

    if (rxErr) {
      setError("บันทึกค่าสายตาล้มเหลว: " + rxErr.message);
      setSaving(false);
      return;
    }

    // 4. Update last_visit ของ customer
    await supabase
      .from("customers")
      .update({
        last_visit: today,
        total: net,
        paid: depositN,
      })
      .eq("id", customer.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate({ to: "/customers" }), 1500);
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
        title={<span className="text-sm text-muted-foreground">สร้างใบงานใหม่</span>}
        subtitle="ใบสั่งเลนส์ดิจิทัล — New Vision Record"
      >
        <div id="print-root">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 p-6">
            <div className="space-y-6 min-w-0">
              {saved && (
                <div className="flex items-center gap-2 text-sm rounded-md bg-green-500/10 text-green-600 px-3 py-1.5 w-fit">
                  <CheckCircle2 className="h-4 w-4" /> บันทึกใบงานสำเร็จ กำลังกลับหน้าลูกค้า…
                </div>
              )}
              {error && (
                <div className="text-sm rounded-md bg-destructive/10 text-destructive px-3 py-1.5">
                  {error}
                </div>
              )}

              {/* Customer Search */}
              <div className="no-print">
                <SectionCard title="ค้นหา / เลือกลูกค้า">
                  <CustomerSearchSection onSelect={setCustomer} />
                </SectionCard>
              </div>

              {/* Customer Info */}
              <SectionCard title="ข้อมูลลูกค้า">
                {!customer && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
                    <Search className="h-4 w-4 flex-shrink-0" /> กรุณาค้นหาและเลือกลูกค้าด้านบนก่อน
                  </div>
                )}
                <fieldset
                  disabled={!customer}
                  className="[&:disabled]:opacity-40 [&:disabled]:pointer-events-none transition-opacity duration-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <Field label="รหัสลูกค้า">
                      <Input value={info.id} readOnly placeholder="CUS-XXXXXX" />
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
                        <Select
                          value={info.gender}
                          onChange={(e) => setInfo((p) => ({ ...p, gender: e.target.value }))}
                        >
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
                        placeholder="เช่น พนักงาน..."
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
                        placeholder="บ้านเลขที่ ถนน..."
                      />
                    </Field>
                    <Field label="ผู้รับงาน">
                      <Input
                        value={info.staff}
                        onChange={(e) => setInfo((p) => ({ ...p, staff: e.target.value }))}
                        placeholder="ชื่อพนักงาน"
                      />
                    </Field>
                  </div>
                </fieldset>
              </SectionCard>

              {/* Rx */}
              <SectionCard title="ค่าสายตา">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">ค่าสายตาปัจจุบัน</h3>
                    <RxTableEditable value={rx} onChange={setRx} />
                    <div className="mt-4 grid grid-cols-[110px_1fr] items-center gap-3">
                      <label className="text-sm text-muted-foreground">ประเภทเลนส์</label>
                      <SelectOrInput
                        value={lensFrame.lensType}
                        onChange={(v) => setLensFrame((p) => ({ ...p, lensType: v }))}
                        options={opts.lensTypes}
                        placeholder="— เลือกประเภทเลนส์ —"
                        customPlaceholder="เช่น PROGRESSIVE..."
                        disabled={optsLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3">PD / การวัด</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      {(
                        [
                          ["PD R", "pdR"],
                          ["SHR", "shr"],
                          ["PD L", "pdL"],
                          ["SHL", "shl"],
                          ["PD รวม", "pdTotal"],
                          ["FH", "fh"],
                        ] as const
                      ).map(([label, key]) => (
                        <div key={key} className="flex items-center gap-2">
                          <label className="text-sm text-muted-foreground w-14">{label}</label>
                          <Input
                            placeholder="0"
                            value={pd[key]}
                            onChange={(e) =>
                              setPd((p) => ({ ...p, [key]: numOnly(e.target.value) }))
                            }
                          />
                          <span className="text-xs text-muted-foreground">มม.</span>
                        </div>
                      ))}
                      <div className="col-span-2 flex items-center gap-2">
                        <label className="text-sm text-muted-foreground w-40">
                          ระยะอ่าน (Seg Height)
                        </label>
                        <Input
                          placeholder="0"
                          className="max-w-[120px]"
                          value={pd.segHeight}
                          onChange={(e) =>
                            setPd((p) => ({ ...p, segHeight: numOnly(e.target.value) }))
                          }
                        />
                        <span className="text-xs text-muted-foreground">มม.</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3">ค่าสายตาเดิม (อ้างอิง — ถ้ามี)</h3>
                  <RxTableOldEditable value={rxOld} onChange={setRxOld} />
                </div>
              </SectionCard>

              {/* Lens + Price */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="เลนส์และกรอบแว่น">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-3">เลนส์</h4>
                      <div className="space-y-3">
                        <Field label="ยี่ห้อเลนส์">
                          <SelectOrInput
                            value={lensFrame.lensBrand}
                            onChange={(v) => setLensFrame((p) => ({ ...p, lensBrand: v }))}
                            options={opts.brands}
                            customPlaceholder="เช่น HOYA..."
                            disabled={optsLoading}
                          />
                        </Field>
                        <Field label="รุ่นเลนส์">
                          <SelectOrInput
                            value={lensFrame.lensModel}
                            onChange={(v) => setLensFrame((p) => ({ ...p, lensModel: v }))}
                            options={opts.models}
                            customPlaceholder="เช่น Individual 2..."
                            disabled={optsLoading}
                          />
                        </Field>
                        <Field label="Index">
                          <SelectOrInput
                            value={lensFrame.lensIndex}
                            onChange={(v) => setLensFrame((p) => ({ ...p, lensIndex: v }))}
                            options={opts.indexes}
                            customPlaceholder="เช่น 1.70..."
                            disabled={optsLoading}
                          />
                        </Field>
                        <Field label="Coating">
                          <SelectOrInput
                            value={lensFrame.lensCoating}
                            onChange={(v) => setLensFrame((p) => ({ ...p, lensCoating: v }))}
                            options={opts.coatings}
                            customPlaceholder="เช่น UV400..."
                            disabled={optsLoading}
                          />
                        </Field>
                        <Field label="สีเลนส์">
                          <SelectOrInput
                            value={lensFrame.lensColor}
                            onChange={(v) => setLensFrame((p) => ({ ...p, lensColor: v }))}
                            options={opts.colors}
                            customPlaceholder="เช่น Blue..."
                            disabled={optsLoading}
                          />
                        </Field>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-3">กรอบแว่น</h4>
                      <div className="space-y-3">
                        <Field label="รุ่น">
                          <Input
                            value={lensFrame.frameModel}
                            onChange={(e) =>
                              setLensFrame((p) => ({ ...p, frameModel: e.target.value }))
                            }
                            placeholder="เช่น RB 6501D"
                          />
                        </Field>
                        <Field label="สี">
                          <Input
                            value={lensFrame.frameColor}
                            onChange={(e) =>
                              setLensFrame((p) => ({ ...p, frameColor: e.target.value }))
                            }
                            placeholder="เช่น Black"
                          />
                        </Field>
                        <Field label="ขนาด">
                          <Input
                            value={lensFrame.frameSize}
                            onChange={(e) =>
                              setLensFrame((p) => ({ ...p, frameSize: e.target.value }))
                            }
                            placeholder="54-17-145"
                          />
                        </Field>
                        <Field label="วัสดุ">
                          <Input
                            value={lensFrame.frameMaterial}
                            onChange={(e) =>
                              setLensFrame((p) => ({ ...p, frameMaterial: e.target.value }))
                            }
                            placeholder="เช่น Titanium"
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="ราคาและการชำระเงิน">
                  <div className="space-y-3">
                    {(
                      [
                        ["ราคากรอบแว่น", "frame"],
                        ["ราคาเลนส์", "lens"],
                        ["สารเคลือบ / อื่นๆ", "coating"],
                      ] as const
                    ).map(([label, key]) => (
                      <div key={key} className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <Input
                          value={price[key]}
                          onChange={(e) =>
                            setPrice((p) => ({ ...p, [key]: numOnly(e.target.value) }))
                          }
                          placeholder="0.00"
                          className="text-right"
                          inputMode="decimal"
                        />
                        <span className="text-xs text-muted-foreground">บาท</span>
                      </div>
                    ))}
                    <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3 pt-2 border-t border-border">
                      <span className="text-sm font-semibold">รวมราคาสินค้า</span>
                      <span className="text-right font-semibold tabular-nums">
                        {subtotal.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">บาท</span>
                    </div>
                    <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                      <span className="text-sm text-destructive">ส่วนลด</span>
                      <Input
                        value={price.discount}
                        onChange={(e) =>
                          setPrice((p) => ({ ...p, discount: numOnly(e.target.value) }))
                        }
                        placeholder="0.00"
                        className="text-right text-destructive"
                        inputMode="decimal"
                      />
                      <span className="text-xs text-muted-foreground">บาท</span>
                    </div>
                    <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3 py-2 px-3 -mx-3 rounded-lg bg-secondary">
                      <span className="text-base font-bold">ยอดรวมสุทธิ</span>
                      <span className="text-right text-xl font-bold text-primary tabular-nums">
                        {net.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">บาท</span>
                    </div>
                    <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                      <span className="text-sm text-muted-foreground">มัดจำ</span>
                      <Input
                        value={price.deposit}
                        onChange={(e) =>
                          setPrice((p) => ({ ...p, deposit: numOnly(e.target.value) }))
                        }
                        placeholder="0.00"
                        className="text-right"
                        inputMode="decimal"
                      />
                      <span className="text-xs text-muted-foreground">บาท</span>
                    </div>
                    <div className="grid grid-cols-[1fr_180px_40px] items-center gap-3">
                      <span className="text-sm text-muted-foreground">คงเหลือ</span>
                      <span
                        className={`text-right font-semibold tabular-nums ${remaining > 0 ? "text-destructive" : "text-green-600"}`}
                      >
                        {remaining.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">บาท</span>
                    </div>
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

              {/* Actions */}
              <div className="flex flex-wrap gap-3 no-print">
                <button
                  onClick={handleSave}
                  disabled={saving || !customer}
                  className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 font-medium shadow hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}{" "}
                  บันทึกใบงาน
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 font-medium hover:bg-secondary"
                >
                  <Printer className="h-5 w-5" /> พิมพ์ใบงาน
                </button>
                <button
                  onClick={() => navigate({ to: "/customers" })}
                  className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg border border-destructive text-destructive px-5 py-3 font-medium hover:bg-destructive/10"
                >
                  <Trash2 className="h-5 w-5" /> ยกเลิก
                </button>
              </div>
            </div>

            {/* Right rail */}
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
                        <span
                          className={`absolute left-0 top-0 h-6 w-6 rounded-full flex items-center justify-center ${isCurrent ? "bg-primary/15 text-primary ring-2 ring-primary" : "bg-secondary text-muted-foreground"}`}
                        >
                          <Circle className="h-3 w-3" />
                        </span>
                        <div
                          className={`text-sm font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}
                        >
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
                            onClick={() => setAttachments((p) => p.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-destructive"
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
                  value={jobNote}
                  onChange={(e) => setJobNote(e.target.value)}
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