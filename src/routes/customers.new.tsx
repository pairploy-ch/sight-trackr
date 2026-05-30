import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Save, UserPlus, CheckCircle2, Loader2 } from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/customers/new")({
  head: () => ({ meta: [{ title: "เพิ่มลูกค้าใหม่ — MARINA OPTICAL" }] }),
  component: NewCustomerPage,
});

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-center gap-3">
      <label className="text-sm text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
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

function generateId() {
  // สร้าง id แบบ C001, C002, ... โดยใช้ timestamp
  return "C" + Date.now().toString().slice(-6);
}

function NewCustomerPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");

  const [form, setForm] = useState({
    name:          "",
    phone:         "",
    age:           "",
    gender:        "ไม่ระบุ",
    occupation:    "",
    line_id:       "",
    email:         "",
    address:       "",
    medical_notes: "",
    staff:         "",
  });

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent, redirect: "list" | "jobs") {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("กรุณากรอกชื่อและเบอร์โทรศัพท์");
      return;
    }

    setSaving(true);
    setError("");

    const { data, error: err } = await supabase
      .from("customers")
      .insert({
        id:            generateId(),
        name:          form.name.trim(),
        phone:         form.phone.trim(),
        age:           form.age ? Number(form.age) : null,
        gender:        form.gender,
        occupation:    form.occupation || null,
        line_id:       form.line_id || null,
        email:         form.email || null,
        address:       form.address || null,
        medical_notes: form.medical_notes || null,
        staff:         form.staff || null,
        last_visit:    new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    setSaving(false);

    if (err) {
      setError("เกิดข้อผิดพลาด: " + err.message);
      return;
    }

    setSaved(true);
    setTimeout(() => {
      if (redirect === "jobs") {
        navigate({ to: "/jobs/new", search: { customerId: data.id } });
      } else {
        navigate({ to: "/customers" });
      }
    }, 1000);
  }

  return (
    <AppShell
      title={
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">ลูกค้า</span>
        </div>
      }
      subtitle="ลงทะเบียนข้อมูลลูกค้าครั้งแรก"
    >
      <form onSubmit={(e) => handleSubmit(e, "list")}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 p-6">
          <div className="space-y-6 min-w-0">

            {saved && (
              <div className="flex items-center gap-2 text-sm rounded-md bg-green-500/10 text-green-600 px-3 py-1.5 w-fit">
                <CheckCircle2 className="h-4 w-4" />
                บันทึกลูกค้าสำเร็จ กำลังกลับสู่หน้ารายชื่อ…
              </div>
            )}

            {error && (
              <div className="text-sm rounded-md bg-destructive/10 text-destructive px-3 py-1.5 w-fit">
                {error}
              </div>
            )}

            <SectionCard title="ข้อมูลส่วนตัว">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                  <Field label="ชื่อ-นามสกุล" required>
                    <Input
                      required
                      placeholder="คุณวิเชียร เกิดสมบัติ"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </Field>
                  <Field label="เบอร์โทรศัพท์" required>
                    <Input
                      required
                      placeholder="082-447-8801"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </Field>
                  <Field label="อายุ / เพศ">
                    <div className="grid grid-cols-[80px_32px_50px_1fr] items-center gap-2">
                      <Input
                        placeholder="53"
                        type="number"
                        min={1}
                        max={120}
                        value={form.age}
                        onChange={(e) => set("age", e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground text-center">ปี</span>
                      <span className="text-sm text-muted-foreground">เพศ</span>
                      <Select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                        <option>ชาย</option>
                        <option>หญิง</option>
                        <option>ไม่ระบุ</option>
                      </Select>
                    </div>
                  </Field>
                  <Field label="อาชีพ">
                    <Input
                      placeholder="เช่น ธุรกิจส่วนตัว, พนักงานบริษัท"
                      value={form.occupation}
                      onChange={(e) => set("occupation", e.target.value)}
                    />
                  </Field>
                  <Field label="Line ID">
                    <Input
                      placeholder="@lineID"
                      value={form.line_id}
                      onChange={(e) => set("line_id", e.target.value)}
                    />
                  </Field>
                  <Field label="อีเมล">
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="ที่อยู่">
                  <textarea
                    rows={2}
                    placeholder="บ้านเลขที่ / ถนน / ตำบล / อำเภอ / จังหวัด / รหัสไปรษณีย์"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                  />
                </Field>
                <Field label="หมายเหตุ / โรคประจำตัว">
                  <textarea
                    rows={2}
                    placeholder="เช่น แพ้สารเคลือบบางชนิด, เบาหวาน, ต้องการเลนส์บาง"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none"
                    value={form.medical_notes}
                    onChange={(e) => set("medical_notes", e.target.value)}
                  />
                </Field>
              </div>
            </SectionCard>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 font-medium shadow hover:opacity-90 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                บันทึกลูกค้า
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, "jobs")}
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg bg-chart-2 text-white px-5 py-3 font-medium hover:opacity-90 disabled:opacity-60"
              >
                <UserPlus className="h-5 w-5" /> บันทึก + สร้างใบงานต่อ
              </button>
              <Link
                to="/customers"
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 font-medium hover:bg-secondary transition-colors text-center"
              >
                ยกเลิก
              </Link>
            </div>
          </div>

          <aside className="space-y-6">
            <SectionCard title="พนักงาน">
              <div className="space-y-3">
                <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                  <label className="text-sm text-muted-foreground">ผู้รับลูกค้า</label>
                  <Input
                    placeholder="เช่น Admin"
                    value={form.staff}
                    onChange={(e) => set("staff", e.target.value)}
                  />
                </div>
              </div>
            </SectionCard>
          </aside>
        </div>
      </form>
    </AppShell>
  );
}