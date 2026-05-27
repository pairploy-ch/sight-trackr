import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, UserPlus, Save } from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";

export const Route = createFileRoute("/customers/new")({
  head: () => ({ meta: [{ title: "เพิ่มลูกค้าใหม่ — MARINA OPTICAL" }] }),
  component: NewCustomerPage,
});

function Row({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

function In(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
    />
  );
}

function NewCustomerPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => navigate({ to: "/customers" }), 900);
  }

  return (
    <AppShell title="เพิ่มลูกค้าใหม่" subtitle="ลงทะเบียนข้อมูลลูกค้าครั้งแรก">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/customers" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> กลับไปหน้ารายชื่อลูกค้า
          </Link>
          {saved && (
            <div className="text-sm rounded-md bg-chart-2/15 text-chart-2 px-3 py-1.5">
              บันทึกลูกค้าสำเร็จ กำลังกลับสู่หน้ารายชื่อ…
            </div>
          )}
        </div>

        <form onSubmit={submit} className="space-y-6">
          <SectionCard title="ข้อมูลส่วนตัว">
            <div className="grid md:grid-cols-2 gap-5">
              <Row label="ชื่อ" required><In required placeholder="วิเชียร" /></Row>
              <Row label="นามสกุล" required><In required placeholder="เกิดสมบัติ" /></Row>
              <Row label="อายุ"><In type="number" min={1} max={120} placeholder="53" /></Row>
              <Row label="เพศ">
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>ชาย</option><option>หญิง</option><option>ไม่ระบุ</option>
                </select>
              </Row>
              <Row label="เบอร์โทร" required><In required placeholder="082-447-8801" /></Row>
              <Row label="Line ID"><In placeholder="@vchian" /></Row>
              <div className="md:col-span-2">
                <Row label="ที่อยู่"><textarea rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="บ้านเลขที่ / ถนน / ตำบล / อำเภอ / จังหวัด" /></Row>
              </div>
              <div className="md:col-span-2">
                <Row label="หมายเหตุ / โรคประจำตัว"><textarea rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="เช่น เบาหวาน, แพ้นิกเกิล" /></Row>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="ข้อมูลเริ่มต้น">
            <div className="grid md:grid-cols-3 gap-5">
              <Row label="ช่องทางรู้จักร้าน">
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>เดินผ่าน</option><option>เพื่อนแนะนำ</option><option>Facebook</option><option>Line OA</option><option>Google</option>
                </select>
              </Row>
              <Row label="ผู้ตรวจสายตา"><In placeholder="คุณเอ" /></Row>
              <Row label="ผู้รับลูกค้า"><In placeholder="Admin" /></Row>
            </div>
          </SectionCard>

          <div className="flex flex-wrap justify-end gap-3">
            <Link to="/customers" className="rounded-md border border-border px-5 py-2.5 text-sm hover:bg-secondary">ยกเลิก</Link>
            <button type="submit" className="rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold flex items-center gap-2 hover:opacity-90">
              <Save className="h-4 w-4" /> บันทึกลูกค้า
            </button>
            <button type="button" className="rounded-md bg-chart-2 text-white px-5 py-2.5 text-sm font-semibold flex items-center gap-2 hover:opacity-90" onClick={() => navigate({ to: "/jobs/new" })}>
              <UserPlus className="h-4 w-4" /> บันทึก + สร้างใบงานต่อ
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}