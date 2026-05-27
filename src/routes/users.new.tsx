import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Save, Eye, EyeOff, CheckCircle2, ShieldCheck, User } from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";

export const Route = createFileRoute("/users/new")({
  head: () => ({ meta: [{ title: "เพิ่มพนักงาน — MARINA OPTICAL" }] }),
  component: NewUserPage,
});

// ─── Shared field components ──────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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

function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
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

function NewUserPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => navigate({ to: "/users" }), 1200);
  }

  return (
    <AppShell
      title={
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">พนักงาน</span>
        </div>
      }
      subtitle="เพิ่มบัญชีผู้ใช้งานในระบบ"
    >
      <form onSubmit={submit}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 p-6">

          {/* ── Main column ── */}
          <div className="space-y-6 min-w-0">

            {/* Saved notice */}
            {saved && (
              <div className="flex items-center gap-2 text-sm rounded-md bg-green-500/10 text-green-600 px-3 py-1.5 w-fit">
                <CheckCircle2 className="h-4 w-4" />
                บันทึกพนักงานสำเร็จ กำลังกลับสู่หน้ารายชื่อ…
              </div>
            )}

            {/* ── Account info ── */}
            <SectionCard title="ข้อมูลบัญชี">
              <div className="space-y-4">
                <Field label="ชื่อ-นามสกุล" required>
                  <Input
                    required
                    placeholder="เช่น คุณมารินา"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>

                <Field label="Email" required>
                  <Input
                    required
                    type="email"
                    placeholder="example@marinaoptical.com"
                  />
                </Field>

                <Field label="รหัสผ่าน" required>
                  <div className="relative">
                    <Input
                      required
                      type={showPw ? "text" : "password"}
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
                </Field>

                <Field label="ยืนยันรหัสผ่าน" required>
                  <div className="relative">
                    <Input
                      required
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
              </div>
            </SectionCard>

            {/* ── Actions ── */}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 font-medium shadow hover:opacity-90"
              >
                <Save className="h-5 w-5" /> บันทึกพนักงาน
              </button>
              <Link
                to="/users"
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 font-medium hover:bg-secondary transition-colors text-center"
              >
                ยกเลิก
              </Link>
            </div>
          </div>

          {/* ── Right rail ── */}
          <aside className="space-y-6">

            {/* Avatar preview */}
            {/* <SectionCard title="ตัวอย่างโปรไฟล์">
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {name.trim() ? name.trim().slice(-2) : <User className="h-9 w-9 opacity-30" />}
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">
                    {name.trim() || <span className="text-muted-foreground text-sm">ชื่อพนักงาน</span>}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 mt-1.5 rounded-full border px-2.5 py-1 text-xs font-medium
                    ${role === "admin"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-secondary text-muted-foreground border-border"
                    }`}>
                    {role === "admin" && <ShieldCheck className="h-3 w-3" />}
                    {role === "admin" ? "ผู้ดูแลระบบ (Admin)" : "พนักงาน (Staff)"}
                  </span>
                </div>
              </div>
            </SectionCard> */}

            {/* Role */}
            <SectionCard title="สิทธิ์การใช้งาน">
              <div className="space-y-3">
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "staff" | "admin")}
                >
                  <option value="staff">พนักงาน (Staff)</option>
                  <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                </Select>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {role === "admin"
                    ? "Admin สามารถจัดการพนักงาน ดูรายงาน และตั้งค่าระบบได้ทั้งหมด"
                    : "Staff สามารถจัดการลูกค้าและใบงานได้ แต่ไม่สามารถเข้าถึงการตั้งค่าระบบ"}
                </p>
              </div>
            </SectionCard>

          </aside>
        </div>
      </form>
    </AppShell>
  );
}