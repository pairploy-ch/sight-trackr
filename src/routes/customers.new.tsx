import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, UserPlus, CheckCircle2 } from "lucide-react";
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
          <span className="text-2xl font-bold text-primary leading-none">เพิ่มลูกค้าใหม่</span>
        </div>
      }
      subtitle="ลงทะเบียนข้อมูลลูกค้าครั้งแรก"
    >
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Back + saved notice */}
        <div className="flex items-center justify-between">
          <Link
            to="/customers"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> กลับไปหน้ารายชื่อลูกค้า
          </Link>
          {saved && (
            <div className="flex items-center gap-2 text-sm rounded-md bg-green-500/10 text-green-600 px-3 py-1.5">
              <CheckCircle2 className="h-4 w-4" />
              บันทึกลูกค้าสำเร็จ กำลังกลับสู่หน้ารายชื่อ…
            </div>
          )}
        </div>

        <form onSubmit={submit} className="space-y-6">

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

          {/* ── Vision info (optional at registration) ── */}
          <SectionCard title="ข้อมูลสายตา (ถ้ามี)">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary text-secondary-foreground">
                    <tr>
                      {["ข้าง", "SPH", "CYL", "AX", "VA", "ADD"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {["R (OD)", "L (OS)"].map((side) => (
                      <tr key={side} className="border-t border-border">
                        <td className="px-3 py-2 font-semibold text-primary">{side}</td>
                        {["SPH", "CYL", "AX", "VA", "ADD"].map((col) => (
                          <td key={col} className="px-2 py-1.5">
                            <Input placeholder="—" className="text-center text-xs" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Field label="ประเภทเลนส์">
                <Select>
                  <option value="">— เลือกประเภทเลนส์ (ถ้ามี) —</option>
                  <option>PROGRESSIVE (Progressive Addition Lens)</option>
                  <option>SINGLE VISION</option>
                  <option>BIFOCAL</option>
                  <option>OFFICE LENS</option>
                </Select>
              </Field>
            </div>
          </SectionCard>

          {/* ── Staff info ── */}
          <SectionCard title="ข้อมูลเพิ่มเติม">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-4">
              <Field label="ช่องทางรู้จักร้าน">
                <Select>
                  <option>เดินผ่าน</option>
                  <option>เพื่อนแนะนำ</option>
                  <option>Facebook</option>
                  <option>Line OA</option>
                  <option>Google</option>
                  <option>อื่นๆ</option>
                </Select>
              </Field>
              <Field label="ผู้ตรวจสายตา">
                <Input placeholder="เช่น คุณกิตติพงศ์" />
              </Field>
              <Field label="ผู้รับลูกค้า">
                <Input placeholder="เช่น Admin" />
              </Field>
            </div>
          </SectionCard>

          {/* ── Actions ── */}
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Link
              to="/customers"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Save className="h-4 w-4" /> บันทึกลูกค้า
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/jobs/new" })}
              className="rounded-lg bg-chart-2 text-white px-5 py-2.5 text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <UserPlus className="h-4 w-4" /> บันทึก + สร้างใบงานต่อ
            </button>
          </div>

        </form>
      </div>
    </AppShell>
  );
}