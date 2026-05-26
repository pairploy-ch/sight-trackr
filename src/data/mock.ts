export type CustomerStatus =
  | "received"
  | "waiting_lens"
  | "assembling"
  | "qc"
  | "ready"
  | "delivered"
  | "claim";

export const STATUS_LABEL: Record<CustomerStatus, string> = {
  received: "รับออเดอร์แล้ว",
  waiting_lens: "รอเลนส์",
  assembling: "กำลังประกอบ",
  qc: "QC แล้ว",
  ready: "พร้อมรับ",
  delivered: "ส่งมอบแล้ว",
  claim: "เคลม / แก้ไขงาน",
};

export const STATUS_ORDER: CustomerStatus[] = [
  "received", "waiting_lens", "assembling", "qc", "ready", "delivered",
];

export interface Customer {
  id: string;
  jobNo: number;
  name: string;
  phone: string;
  age: number;
  status: CustomerStatus;
  lastVisit: string;
  total: number;
  paid: number;
  pickup: string;
  lens: string;
  frame: string;
}

export const customers: Customer[] = [
  { id: "CUS-000152", jobNo: 217, name: "คุณวิเชียร เกิดสมบัติ", phone: "082-447-8801", age: 53, status: "waiting_lens", lastVisit: "12/05/2567", total: 6500, paid: 3000, pickup: "19/05/2567", lens: "RODENSTOCK Progressive 1.60", frame: "RB 6501D / Black" },
  { id: "CUS-000151", jobNo: 216, name: "คุณสมหญิง ใจดี", phone: "089-123-4567", age: 41, status: "assembling", lastVisit: "11/05/2567", total: 4200, paid: 2000, pickup: "17/05/2567", lens: "HOYA Single 1.67", frame: "Oakley OX8156 / Matte" },
  { id: "CUS-000150", jobNo: 215, name: "คุณภาณุพงศ์ มงคล", phone: "061-998-2210", age: 28, status: "qc", lastVisit: "10/05/2567", total: 3800, paid: 3800, pickup: "16/05/2567", lens: "ZEISS Single 1.60", frame: "Marina M-204 / Gold" },
  { id: "CUS-000149", jobNo: 214, name: "คุณกัลยา ศรีสุข", phone: "094-665-1102", age: 62, status: "ready", lastVisit: "09/05/2567", total: 8900, paid: 8900, pickup: "15/05/2567", lens: "RODENSTOCK Progressive 1.67", frame: "Lindberg n.o.w 6520" },
  { id: "CUS-000148", jobNo: 213, name: "คุณอนันต์ ทองดี", phone: "081-220-7788", age: 36, status: "delivered", lastVisit: "08/05/2567", total: 5200, paid: 5200, pickup: "14/05/2567", lens: "HOYA Office 1.60", frame: "Ray-Ban RX5387 / Tort" },
  { id: "CUS-000147", jobNo: 212, name: "คุณมานี รักดี", phone: "092-117-3344", age: 47, status: "received", lastVisit: "08/05/2567", total: 7100, paid: 3000, pickup: "20/05/2567", lens: "Marina HD Progressive 1.74", frame: "Marina Titanium M-118" },
  { id: "CUS-000146", jobNo: 211, name: "คุณสมชาย ขยันงาน", phone: "086-554-9933", age: 55, status: "claim", lastVisit: "07/05/2567", total: 6800, paid: 6800, pickup: "13/05/2567", lens: "ZEISS Progressive 1.60", frame: "Oakley OX3217" },
  { id: "CUS-000145", jobNo: 210, name: "คุณพิมพ์ใจ บุญส่ง", phone: "098-441-2208", age: 39, status: "ready", lastVisit: "06/05/2567", total: 4400, paid: 2200, pickup: "12/05/2567", lens: "HOYA Single 1.56", frame: "Marina M-330 / Pink" },
];

export const STATUS_COLOR: Record<CustomerStatus, string> = {
  received: "bg-secondary text-secondary-foreground",
  waiting_lens: "bg-chart-4/20 text-chart-4",
  assembling: "bg-primary/15 text-primary",
  qc: "bg-accent text-accent-foreground",
  ready: "bg-chart-2/20 text-chart-2",
  delivered: "bg-muted text-muted-foreground",
  claim: "bg-destructive/15 text-destructive",
};

export interface RxRecord {
  date: string;
  sphR: string; cylR: string; axR: string; addR: string;
  sphL: string; cylL: string; axL: string; addL: string;
  notes?: string;
}

export interface VisitRecord {
  date: string;
  jobNo: number;
  lens: string;
  frame: string;
  price: number;
  issue?: string;
  files?: string[];
}

export const rxHistory: Record<string, RxRecord[]> = {
  "CUS-000152": [
    { date: "12/05/2567", sphR: "+1.75", cylR: "-1.50", axR: "150", addR: "+2.50", sphL: "+1.75", cylL: "-1.75", axL: "130", addL: "+2.50", notes: "ปัจจุบัน" },
    { date: "15/08/2566", sphR: "+1.50", cylR: "-1.50", axR: "150", addR: "+2.25", sphL: "+1.50", cylL: "-1.75", axL: "130", addL: "+2.25" },
    { date: "20/03/2565", sphR: "+1.25", cylR: "-1.25", axR: "150", addR: "+2.00", sphL: "+1.25", cylL: "-1.50", axL: "130", addL: "+2.00" },
  ],
};

export const visitHistory: Record<string, VisitRecord[]> = {
  "CUS-000152": [
    { date: "12/05/2567", jobNo: 217, lens: "RODENSTOCK Progressive 1.60 + Multicoat", frame: "RB 6501D / Black / Titanium", price: 6500, issue: "ต้องการเลนส์บาง คุณภาพสูง", files: ["สแกนใบสั่งซื้อ.pdf", "รูปกรอบแว่น.jpg"] },
    { date: "15/08/2566", jobNo: 184, lens: "HOYA Progressive 1.60", frame: "Marina M-220 / Black", price: 5200, issue: "ใส่แล้วเวียนหัวเล็กน้อย — ปรับ Segment Height", files: ["ใบงาน-184.pdf"] },
    { date: "20/03/2565", jobNo: 152, lens: "ZEISS Single Vision 1.56", frame: "Ray-Ban RB5228", price: 3800, files: ["ใบงาน-152.pdf"] },
  ],
};