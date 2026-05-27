import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState } from "react";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, X, Save, Search, ShieldCheck, User,
} from "lucide-react";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [{ title: "พนักงาน — MARINA OPTICAL" }],
  }),
  component: UsersPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface Staff {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "staff";
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_STAFF: Staff[] = [
  { id: 1, name: "คุณมารินา",      email: "marina@marinaoptical.com",   password: "marina1234",  role: "admin" },
  { id: 2, name: "คุณกิตติพงศ์",  email: "kitti@marinaoptical.com",    password: "kitti5678",   role: "staff" },
  { id: 3, name: "คุณสมศรี",       email: "somsri@marinaoptical.com",   password: "somsri9012",  role: "staff" },
];

// ─── Shared components ────────────────────────────────────────────────────────

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

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function StaffModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<Staff> | null;
  onSave: (s: Omit<Staff, "id"> & { id?: number }) => void;
  onClose: () => void;
}) {
  const isEdit = !!initial?.id;
  const [name, setName]         = useState(initial?.name     ?? "");
  const [email, setEmail]       = useState(initial?.email    ?? "");
  const [password, setPassword] = useState(initial?.password ?? "");
  const [role, setRole]         = useState<Staff["role"]>(initial?.role ?? "staff");
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())     e.name     = "กรุณากรอกชื่อ";
    if (!email.trim())    e.email    = "กรุณากรอก Email";
    if (!password.trim()) e.password = "กรุณากรอกรหัสผ่าน";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({ id: initial?.id, name, email, password, role });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">
            {isEdit ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
          </h2>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-secondary text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Avatar preview */}
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {name ? name.slice(-2) : <User className="h-7 w-7 opacity-40" />}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">ชื่อ-นามสกุล</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="คุณ..."
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@marinaoptical.com"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">รหัสผ่าน</label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">สิทธิ์การใช้งาน</label>
            <Select value={role} onChange={(e) => setRole(e.target.value as Staff["role"])}>
              <option value="staff">พนักงาน (Staff)</option>
              <option value="admin">ผู้ดูแลระบบ (Admin)</option>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            <Save className="h-4 w-4" /> บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function UsersPage() {
  const [staff, setStaff]         = useState<Staff[]>(INITIAL_STAFF);
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState<Partial<Staff> | null | false>(false);
  const [showPwId, setShowPwId]   = useState<number | null>(null);
  const [deleteId, setDeleteId]   = useState<number | null>(null);

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSave(data: Omit<Staff, "id"> & { id?: number }) {
    if (data.id) {
      setStaff((prev) => prev.map((s) => (s.id === data.id ? { ...s, ...data } as Staff : s)));
    } else {
      const newId = Math.max(0, ...staff.map((s) => s.id)) + 1;
      setStaff((prev) => [...prev, { ...data, id: newId } as Staff]);
    }
    setModal(false);
  }

  function handleDelete(id: number) {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    setDeleteId(null);
  }

  return (
    <AppShell title="พนักงาน" subtitle="จัดการบัญชีผู้ใช้งานในระบบ">
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-secondary/50 px-5 py-4">
            <p className="text-xs text-muted-foreground">พนักงานทั้งหมด</p>
            <p className="mt-1 text-2xl font-bold text-primary">{staff.length}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">คน</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/50 px-5 py-4">
            <p className="text-xs text-muted-foreground">ผู้ดูแลระบบ</p>
            <p className="mt-1 text-2xl font-bold text-primary">{staff.filter((s) => s.role === "admin").length}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Admin</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/50 px-5 py-4">
            <p className="text-xs text-muted-foreground">พนักงานทั่วไป</p>
            <p className="mt-1 text-2xl font-bold text-primary">{staff.filter((s) => s.role === "staff").length}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Staff</p>
          </div>
        </div>

        {/* Table */}
        <SectionCard title="รายชื่อพนักงาน">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อหรือ Email..."
                className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <button
              onClick={() => setModal({})}
              className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" /> เพิ่มพนักงาน
            </button>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/70 text-secondary-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ชื่อ-นามสกุล</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">รหัสผ่าน</th>
                  <th className="px-4 py-3 text-left font-medium">สิทธิ์</th>
                  <th className="px-4 py-3 text-left font-medium w-24">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      ไม่พบรายการ
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => (
                    <tr key={s.id} className={`border-t border-border hover:bg-secondary/40 transition-colors ${i % 2 !== 0 ? "bg-secondary/20" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                            {s.name.slice(-2)}
                          </div>
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {showPwId === s.id ? s.password : "•".repeat(Math.min(s.password.length, 10))}
                          </span>
                          <button
                            onClick={() => setShowPwId(showPwId === s.id ? null : s.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {showPwId === s.id
                              ? <EyeOff className="h-3.5 w-3.5" />
                              : <Eye className="h-3.5 w-3.5" />
                            }
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium
                          ${s.role === "admin"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-secondary text-muted-foreground border-border"
                          }`}>
                          {s.role === "admin" && <ShieldCheck className="h-3 w-3" />}
                          {s.role === "admin" ? "Admin" : "Staff"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setModal(s)}
                            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-secondary flex items-center gap-1"
                          >
                            <Pencil className="h-3 w-3" /> แก้ไข
                          </button>
                          <button
                            onClick={() => setDeleteId(s.id)}
                            className="rounded-md border border-destructive/40 text-destructive px-2 py-1 text-xs hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* Add / Edit modal */}
      {modal !== false && (
        <StaffModal
          initial={modal}
          onSave={handleSave}
          onClose={() => setModal(false)}
        />
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-xl mx-4 p-6 space-y-4">
            <h2 className="font-semibold text-foreground">ยืนยันการลบ</h2>
            <p className="text-sm text-muted-foreground">
              ต้องการลบ <span className="font-medium text-foreground">{staff.find((s) => s.id === deleteId)?.name}</span> ออกจากระบบ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 rounded-lg bg-destructive text-destructive-foreground px-4 py-2 text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}