import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Save, UserPlus, CheckCircle2 } from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";

export const Route = createFileRoute("/customers/new")({
  head: () => ({ meta: [{ title: "เพิ่มลูกค้าใหม่ — MARINA OPTICAL" }] }),
  component: NewCustomerPage,
});

// ─── Shared field components (same pattern as jobs/new) ───────────────────────

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

// ─── Main page ────────────────────────────────────────────────────────────────

function NewCustomerPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => navigate({ to: "/customers" }), 1200);
  }

  return (
    <AppShell
      title={
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">ลูกค้า</span>
          {/* <span className="text-2xl font-bold text-primary leading-none">เพิ่มลูกค้าใหม่</span> */}
        </div>
      }
      subtitle="ลงทะเบียนข้อมูลลูกค้าครั้งแรก"
    >
      <form onSubmit={submit}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 p-6">
          {/* ── Main column ── */}
          <div className="space-y-6 min-w-0">

            {/* Saved notice */}
            {saved && (
              <div className="flex items-center gap-2 text-sm rounded-md bg-green-500/10 text-green-600 px-3 py-1.5 w-fit">
                <CheckCircle2 className="h-4 w-4" />
                บันทึกลูกค้าสำเร็จ กำลังกลับสู่หน้ารายชื่อ…
              </div>
            )}

            {/* ── Personal info ── */}
            <SectionCard title="ข้อมูลส่วนตัว">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                  <Field label="ชื่อ-นามสกุล" required>
                    <Input required placeholder="คุณวิเชียร เกิดสมบัติ" />
                  </Field>
                  <Field label="เบอร์โทรศัพท์" required>
                    <Input required placeholder="082-447-8801" />
                  </Field>
                  <Field label="อายุ / เพศ">
                    <div className="grid grid-cols-[80px_32px_50px_1fr] items-center gap-2">
                      <Input placeholder="53" type="number" min={1} max={120} />
                      <span className="text-sm text-muted-foreground text-center">ปี</span>
                      <span className="text-sm text-muted-foreground">เพศ</span>
                      <Select>
                        <option>ชาย</option>
                        <option>หญิง</option>
                        <option>ไม่ระบุ</option>
                      </Select>
                    </div>
                  </Field>
                  <Field label="อาชีพ">
                    <Input placeholder="เช่น ธุรกิจส่วนตัว, พนักงานบริษัท" />
                  </Field>
                  <Field label="Line ID">
                    <Input placeholder="@lineID" />
                  </Field>
                  <Field label="อีเมล">
                    <Input type="email" placeholder="example@email.com" />
                  </Field>
                </div>
                <Field label="ที่อยู่">
                  <textarea
                    rows={2}
                    placeholder="บ้านเลขที่ / ถนน / ตำบล / อำเภอ / จังหวัด / รหัสไปรษณีย์"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none"
                  />
                </Field>
                <Field label="หมายเหตุ / โรคประจำตัว">
                  <textarea
                    rows={2}
                    placeholder="เช่น แพ้สารเคลือบบางชนิด, เบาหวาน, ต้องการเลนส์บาง"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none"
                  />
                </Field>
              </div>
            </SectionCard>

            {/* ── Actions ── */}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 font-medium shadow hover:opacity-90"
              >
                <Save className="h-5 w-5" /> บันทึกลูกค้า
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/jobs/new" })}
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg bg-chart-2 text-white px-5 py-3 font-medium hover:opacity-90"
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

          {/* ── Right rail ── */}
          <aside className="space-y-6">
            {/* <SectionCard title="ช่องทางที่รู้จักร้าน">
              <div className="space-y-3">
                <Select>
                  <option value="">— เลือกช่องทาง —</option>
                  <option>เดินผ่าน</option>
                  <option>เพื่อนแนะนำ</option>
                  <option>Facebook</option>
                  <option>Line OA</option>
                  <option>Google</option>
                  <option>อื่นๆ</option>
                </Select>
              </div>
            </SectionCard> */}

            <SectionCard title="พนักงาน">
              <div className="space-y-3">
                <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                  <label className="text-sm text-muted-foreground">ผู้รับลูกค้า</label>
                  <Input placeholder="เช่น Admin" />
                </div>
              </div>
            </SectionCard>
          </aside>
        </div>
      </form>
    </AppShell>
  );
}