import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Printer, X } from "lucide-react";

export const Route = createFileRoute("/jobs/$id/print")({
  head: () => ({ meta: [{ title: "พิมพ์ใบงาน — MARINA OPTICAL" }] }),
  component: PrintPage,
});

// ─── Mock data (replace with real fetch by id) ────────────────────────────────

const MOCK_JOB = {
  id: 217,
  date: "12/05/2567",
  pickupDate: "19/05/2567",
  customer: { id: "CUS-000152", name: "คุณวิเชียร เกิดสมบัติ", phone: "082-447-8801", age: 53, gender: "ชาย", occupation: "ธุรกิจส่วนตัว", address: "52/15 ม.3 ต.เสม็ด อ.เมือง จ.ชลบุรี 20000", note: "แพ้สารเคลือบบางชนิด / ต้องการเลนส์บาง" },
  staff: { examiner: "คุณกิตติพงศ์", receiver: "คุณมาริน่า" },
  rx: {
    current: {
      od: { sph: "+1.75", cyl: "-1.50", ax: "150", va: "AX 175", add: "+2.50" },
      os: { sph: "+1.75", cyl: "-1.75", ax: "130", va: "AX 185", add: "+2.50" },
      lensType: "PROGRESSIVE (Progressive Addition Lens)",
    },
    pd: { pdR: "30", pdL: "30", pdTotal: "60", shr: "27", shl: "27", fh: "15", segHeight: "27" },
    old: {
      od: { sph: "+1.50", cyl: "-1.50", ax: "150", va: "AX 175", add: "+2.25", date: "15/08/2566" },
      os: { sph: "+1.50", cyl: "-1.75", ax: "130", va: "AX 180", add: "+2.25", date: "15/08/2566" },
    },
  },
  lens: { brand: "RODENSTOCK", model: "PROGRESSIVE Individual 2", index: "1.60", coating: "Multicoat + Blue Light", color: "Clear", note: "ต้องการเลนส์บาง คุณภาพสูง" },
  frame: { model: "RB 6501D", color: "Black", size: "54-17-145", material: "Titanium" },
  pricing: { frame: 2500, lens: 4500, other: 0, discount: 500, deposit: 3000 },
  status: "รอเลนส์",
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString("th-TH", { minimumFractionDigits: 2 }); }

// ─── Print Page ───────────────────────────────────────────────────────────────

function PrintPage() {
  const navigate = useNavigate();
  const j = MOCK_JOB;
  const total = j.pricing.frame + j.pricing.lens + j.pricing.other;
  const net = total - j.pricing.discount;
  const remaining = net - j.pricing.deposit;

  return (
    <>
      {/* ── Print styles ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          .print-page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
          @page { size: A4; margin: 10mm 12mm; }
        }
        @media screen {
          body { background: #e5e7eb; }
        }
      `}</style>

      {/* ── Screen toolbar ── */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-800">ตัวอย่างก่อนพิมพ์ — ใบงาน #{j.id}</span>
          <span className="text-sm text-gray-500">{j.customer.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: "/jobs/$id", params: { id: String(j.id) } })}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            <X className="h-4 w-4" /> ปิด
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-blue-700 text-white px-4 py-2 text-sm font-medium hover:bg-blue-800"
          >
            <Printer className="h-4 w-4" /> พิมพ์ / บันทึก PDF
          </button>
        </div>
      </div>

      {/* ── A4 page ── */}
      <div className="no-print pt-16 pb-8 flex justify-center">
        <JobDocument job={j} total={total} net={net} remaining={remaining} />
      </div>
      {/* Print renders without wrapper */}
      <div className="hidden print:block">
        <JobDocument job={j} total={total} net={net} remaining={remaining} />
      </div>
    </>
  );
}

// ─── The actual printable document ───────────────────────────────────────────

function JobDocument({ job: j, total, net, remaining }: { job: typeof MOCK_JOB; total: number; net: number; remaining: number }) {
  return (
    <div className="print-page bg-white w-[210mm] min-h-[297mm] shadow-lg mx-auto p-[12mm] text-[11px] text-gray-800 font-['Kanit',sans-serif]">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4 pb-3 border-b-2 border-blue-800">
        <div>
          <div className="text-xl font-bold text-blue-800 leading-tight">MARINA OPTICAL</div>
          <div className="text-[9px] text-gray-500 tracking-wide">VISION CARE SYSTEM</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-800">ใบงาน #{j.id}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">วันที่สั่ง: {j.date}</div>
          <div className="text-[10px] text-gray-500">วันนัดรับ: {j.pickupDate}</div>
          <div className="mt-1 inline-block bg-amber-100 text-amber-800 border border-amber-300 rounded px-2 py-0.5 text-[9px] font-semibold">{j.status}</div>
        </div>
      </div>

      {/* ── Customer info ── */}
      <div className="mb-4">
        <SectionHeader>ข้อมูลลูกค้า</SectionHeader>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
          <Row label="รหัสลูกค้า" value={j.customer.id} />
          <Row label="อายุ / เพศ" value={`${j.customer.age} ปี / ${j.customer.gender}`} />
          <Row label="ชื่อ-นามสกุล" value={j.customer.name} bold />
          <Row label="อาชีพ" value={j.customer.occupation} />
          <Row label="เบอร์โทรศัพท์" value={j.customer.phone} />
          <Row label="ผู้ตรวจสายตา" value={j.staff.examiner} />
          <Row label="ที่อยู่" value={j.customer.address} />
          <Row label="ผู้รับงาน" value={j.staff.receiver} />
          {j.customer.note && <div className="col-span-2"><Row label="หมายเหตุ" value={j.customer.note} /></div>}
        </div>
      </div>

      {/* ── Rx ── */}
      <div className="mb-4">
        <SectionHeader>ค่าสายตา</SectionHeader>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* current */}
          <div>
            <div className="text-[10px] font-semibold text-gray-600 mb-1">ค่าสายตาปัจจุบัน</div>
            <table className="w-full border-collapse text-center text-[10px]">
              <thead>
                <tr className="bg-gray-100">
                  {["ข้าง","SPH","CYL","AX","VA","ADD"].map(h => <th key={h} className="border border-gray-300 px-1.5 py-1 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {(["od","os"] as const).map(eye => (
                  <tr key={eye}>
                    <td className="border border-gray-300 px-1.5 py-1 font-bold text-blue-700">{eye==="od"?"R (OD)":"L (OS)"}</td>
                    {["sph","cyl","ax","va","add"].map(col => (
                      <td key={col} className="border border-gray-300 px-1.5 py-1">{(j.rx.current[eye] as any)[col] || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-1.5 flex gap-2 text-[10px]">
              <span className="text-gray-500">ประเภท:</span>
              <span className="font-medium">{j.rx.current.lensType}</span>
            </div>
          </div>

          {/* PD */}
          <div>
            <div className="text-[10px] font-semibold text-gray-600 mb-1">PD / การวัด</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                ["PD R", j.rx.pd.pdR, "SHR", j.rx.pd.shr],
                ["PD L", j.rx.pd.pdL, "SHL", j.rx.pd.shl],
                ["PD รวม", j.rx.pd.pdTotal, "FH", j.rx.pd.fh],
              ].map(([la, va, lb, vb]) => (
                <>
                  <div className="flex gap-1"><span className="text-gray-500 w-12">{la}</span><span className="font-medium">{va} มม.</span></div>
                  <div className="flex gap-1"><span className="text-gray-500 w-12">{lb}</span><span className="font-medium">{vb} มม.</span></div>
                </>
              ))}
              <div className="col-span-2 flex gap-1 mt-0.5">
                <span className="text-gray-500">ระยะอ่าน (Seg.):</span>
                <span className="font-medium">{j.rx.pd.segHeight} มม.</span>
              </div>
            </div>

            {/* old rx */}
            <div className="mt-2">
              <div className="text-[10px] font-semibold text-gray-600 mb-1">ค่าสายตาเดิม (อ้างอิง)</div>
              <table className="w-full border-collapse text-center text-[10px]">
                <thead>
                  <tr className="bg-gray-50">
                    {["ข้าง","SPH","CYL","AX","ADD","วันที่วัด"].map(h => <th key={h} className="border border-gray-200 px-1 py-0.5 font-medium text-gray-500">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(["od","os"] as const).map(eye => (
                    <tr key={eye} className="text-gray-500">
                      <td className="border border-gray-200 px-1 py-0.5 font-bold text-blue-600">{eye==="od"?"R":"L"}</td>
                      {["sph","cyl","ax","add","date"].map(col => (
                        <td key={col} className="border border-gray-200 px-1 py-0.5">{(j.rx.old[eye] as any)[col] || "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lens & frame ── */}
      <div className="mb-4">
        <SectionHeader>เลนส์และกรอบแว่น</SectionHeader>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
          <div>
            <div className="text-[10px] font-semibold text-gray-600 mb-1">เลนส์</div>
            <Row label="ยี่ห้อ" value={j.lens.brand} />
            <Row label="รุ่น" value={j.lens.model} />
            <Row label="Index" value={j.lens.index} />
            <Row label="Coating" value={j.lens.coating} />
            <Row label="สีเลนส์" value={j.lens.color} />
            {j.lens.note && <Row label="หมายเหตุ" value={j.lens.note} />}
          </div>
          <div>
            <div className="text-[10px] font-semibold text-gray-600 mb-1">กรอบแว่น</div>
            <Row label="รุ่น" value={j.frame.model} />
            <Row label="สี" value={j.frame.color} />
            <Row label="ขนาด" value={j.frame.size} />
            <Row label="วัสดุ" value={j.frame.material} />
          </div>
        </div>
      </div>

      {/* ── Pricing ── */}
      <div className="mb-6">
        <SectionHeader>ราคาและการชำระเงิน</SectionHeader>
        <div className="mt-2 max-w-xs ml-auto">
          <PriceRow label="ราคากรอบแว่น" value={fmt(j.pricing.frame)} />
          <PriceRow label="ราคาเลนส์" value={fmt(j.pricing.lens)} />
          <PriceRow label="สารเคลือบ / อื่นๆ" value={fmt(j.pricing.other)} />
          <div className="border-t border-gray-300 my-1" />
          <PriceRow label="รวมราคาสินค้า" value={fmt(total)} bold />
          <PriceRow label="ส่วนลด" value={`(${fmt(j.pricing.discount)})`} red />
          <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded px-3 py-1.5 my-1">
            <span className="font-bold text-[12px]">ยอดรวมสุทธิ</span>
            <span className="font-bold text-[14px] text-blue-800">{fmt(net)} บาท</span>
          </div>
          <div className="border-t border-gray-300 my-1" />
          <PriceRow label="มัดจำ" value={fmt(j.pricing.deposit)} />
          <PriceRow label={`คงเหลือ (รับวันที่ ${j.pickupDate})`} value={fmt(remaining)} red={remaining > 0} bold />
        </div>
      </div>

      {/* ── Signatures ── */}
      <div className="grid grid-cols-3 gap-4 mt-auto pt-4 border-t border-gray-200">
        {["ผู้สั่งซื้อ / ลูกค้า", "ผู้รับงาน", "ผู้ตรวจสายตา"].map((label) => (
          <div key={label} className="text-center">
            <div className="border-b border-dashed border-gray-400 h-10 mb-1" />
            <div className="text-[9px] text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="mt-4 pt-2 border-t border-gray-100 flex justify-between text-[9px] text-gray-400">
        <span>MARINA OPTICAL — Vision Care System</span>
        <span>พิมพ์: {new Date().toLocaleDateString("th-TH", { dateStyle: "medium" })}</span>
      </div>
    </div>
  );
}

// ─── Mini components ──────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-[11px] text-blue-800">{children}</span>
      <div className="flex-1 h-px bg-blue-200" />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex gap-1.5 leading-relaxed">
      <span className="text-gray-500 w-24 flex-shrink-0">{label}:</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}

function PriceRow({ label, value, bold, red }: { label: string; value: string; bold?: boolean; red?: boolean }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className={`${bold ? "font-semibold" : "text-gray-600"}`}>{label}</span>
      <span className={`${bold ? "font-semibold" : ""} ${red ? "text-red-600" : ""}`}>{value} บาท</span>
    </div>
  );
}