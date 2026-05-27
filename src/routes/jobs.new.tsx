import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Printer } from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";
import { customers } from "@/data/mock";

export const Route = createFileRoute("/jobs/new")({
  head: () => ({ meta: [{ title: "สร้างใบงานใหม่ — MARINA OPTICAL" }] }),
  component: NewJobPage,
});

function In(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 ${props.className ?? ""}`}
    />
  );
}
function Sel(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />;
}
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return <span className="text-xs font-medium text-muted-foreground">{children}{required && <span className="text-destructive"> *</span>}</span>;
}

function NewJobPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const nextNo = Math.max(...customers.map((c) => c.jobNo)) + 1;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => navigate({ to: "/jobs" }), 900);
  }

  return (
    <AppShell title={`สร้างใบงานใหม่ #${nextNo}`} subtitle="ใบสั่งเลนส์ดิจิทัล">
      <form onSubmit={submit} className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> กลับไปบอร์ดงาน
          </Link>
          {saved && (
            <div className="text-sm rounded-md bg-chart-2/15 text-chart-2 px-3 py-1.5">บันทึกใบงานสำเร็จ</div>
          )}
        </div>

        <SectionCard title="ข้อมูลลูกค้า">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-1"><Label>เลขที่ใบงาน</Label><In defaultValue={`#${nextNo}`} readOnly className="bg-secondary" /></div>
            <div className="space-y-1"><Label>วันที่</Label><In type="date" defaultValue={new Date().toISOString().slice(0,10)} /></div>
            <div className="md:col-span-2 space-y-1">
              <Label required>เลือกลูกค้า</Label>
              <Sel required>
                <option value="">— เลือกจากรายชื่อ หรือเพิ่มลูกค้าใหม่ —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone}) · {c.id}</option>
                ))}
              </Sel>
            </div>
            <div className="space-y-1"><Label>ผู้ตรวจสายตา</Label><In placeholder="คุณเอ" /></div>
            <div className="space-y-1"><Label>ผู้รับงาน</Label><In placeholder="Admin" /></div>
            <div className="md:col-span-2 space-y-1"><Label>หมายเหตุ</Label><In placeholder="ความต้องการของลูกค้า" /></div>
          </div>
        </SectionCard>

        <SectionCard title="ค่าสายตา (Prescription)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground bg-secondary">
                  <th className="text-left p-2 w-12">ข้าง</th>
                  <th className="p-2">SPH</th><th className="p-2">CYL</th><th className="p-2">AX</th>
                  <th className="p-2">VA</th><th className="p-2">ADD</th><th className="p-2">PD</th>
                </tr>
              </thead>
              <tbody>
                {(["R","L"] as const).map((side) => (
                  <tr key={side} className="border-t border-border">
                    <td className="p-2 font-semibold text-primary">{side}</td>
                    {["sph","cyl","ax","va","add","pd"].map((k) => (
                      <td key={k} className="p-1.5"><In placeholder="-" /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid md:grid-cols-4 gap-4 mt-5">
            <div className="space-y-1"><Label>Total PD</Label><In placeholder="64" /></div>
            <div className="space-y-1"><Label>SH / Segment Height</Label><In placeholder="18" /></div>
            <div className="space-y-1"><Label>FH / Fitting Height</Label><In placeholder="22" /></div>
            <div className="space-y-1">
              <Label>ประเภทเลนส์</Label>
              <Sel><option>Single Vision</option><option>Progressive</option><option>Bifocal</option><option>Office Lens</option></Sel>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="เลนส์ และ กรอบ">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>ยี่ห้อเลนส์</Label>
              <Sel><option>RODENSTOCK</option><option>HOYA</option><option>ZEISS</option><option>Marina</option></Sel>
            </div>
            <div className="space-y-1"><Label>รุ่นเลนส์</Label><In placeholder="Progressive Individual 2" /></div>
            <div className="space-y-1"><Label>Index</Label>
              <Sel><option>1.56</option><option>1.60</option><option>1.67</option><option>1.74</option></Sel>
            </div>
            <div className="space-y-1"><Label>Coating</Label>
              <Sel><option>Multicoat</option><option>Multicoat + Blue Light</option><option>Photochromic</option><option>Polarized</option></Sel>
            </div>
            <div className="space-y-1"><Label>ยี่ห้อ / รุ่นกรอบ</Label><In placeholder="Ray-Ban RB 6501D" /></div>
            <div className="space-y-1"><Label>วัสดุกรอบ</Label>
              <Sel><option>Titanium</option><option>Acetate</option><option>TR90</option><option>Metal</option></Sel>
            </div>
            <div className="space-y-1"><Label>สี</Label><In placeholder="Black" /></div>
            <div className="space-y-1"><Label>ขนาด (Eye-Bridge-Temple)</Label><In placeholder="52-18-140" /></div>
            <div className="space-y-1"><Label>หมายเลขกรอบ</Label><In placeholder="SN-2024-217" /></div>
          </div>
        </SectionCard>

        <SectionCard title="ราคา และ การชำระ">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-1"><Label>ราคากรอบ</Label><In type="number" placeholder="2500" /></div>
            <div className="space-y-1"><Label>ราคาเลนส์</Label><In type="number" placeholder="4500" /></div>
            <div className="space-y-1"><Label>ส่วนลด</Label><In type="number" placeholder="500" /></div>
            <div className="space-y-1"><Label>มัดจำ</Label><In type="number" placeholder="3000" /></div>
            <div className="space-y-1"><Label>วันนัดรับ</Label><In type="date" /></div>
            <div className="space-y-1"><Label>วิธีชำระ</Label>
              <Sel><option>เงินสด</option><option>โอน</option><option>บัตรเครดิต</option><option>QR PromptPay</option></Sel>
            </div>
            <div className="space-y-1"><Label>สถานะเริ่มต้น</Label>
              <Sel><option value="received">รับออเดอร์แล้ว</option><option value="waiting_lens">รอเลนส์</option></Sel>
            </div>
          </div>
        </SectionCard>

        <div className="flex flex-wrap justify-end gap-3">
          <Link to="/jobs" className="rounded-md border border-border px-5 py-2.5 text-sm hover:bg-secondary">ยกเลิก</Link>
          <button type="button" className="rounded-md border border-border px-5 py-2.5 text-sm flex items-center gap-2 hover:bg-secondary">
            <Printer className="h-4 w-4" /> พิมพ์ใบงาน
          </button>
          <button type="submit" className="rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold flex items-center gap-2 hover:opacity-90">
            <Save className="h-4 w-4" /> บันทึกใบงาน
          </button>
        </div>
      </form>
    </AppShell>
  );
}