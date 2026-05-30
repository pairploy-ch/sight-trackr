import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Save, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { AppShell, SectionCard } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/users/new")({
  head: () => ({ meta: [{ title: "เพิ่มพนักงาน — MARINA OPTICAL" }] }),
  component: NewUserPage,
});

// ─── Shared field components ──────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-start gap-3">
      <label className="text-sm text-muted-foreground pt-2">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="space-y-1">
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
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

function NewUserPage() {
  const navigate = useNavigate();

  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [role, setRole]           = useState<"staff" | "admin">("staff");
  const [showPw, setShowPw]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())            e.name     = "กรุณากรอกชื่อ-นามสกุล";
    if (!email.trim())           e.email    = "กรุณากรอก Email";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "รูปแบบ Email ไม่ถูกต้อง";
    if (!password)               e.password = "กรุณากรอกรหัสผ่าน";
    else if (password.length < 6) e.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    if (!confirm)                e.confirm  = "กรุณายืนยันรหัสผ่าน";
    else if (confirm !== password) e.confirm = "รหัสผ่านไม่ตรงกัน";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);
    if (!validate()) return;

    setSaving(true);
    const { error } = await supabase.from("staff").insert({
      name:     name.trim(),
      email:    email.trim(),
      password,
      role,
    });

    if (error) {
      // Supabase unique violation code = "23505"
      if (error.code === "23505") {
        setErrors((prev) => ({ ...prev, email: "Email นี้มีในระบบแล้ว" }));
      } else {
        setGlobalError("บันทึกไม่สำเร็จ: " + error.message);
      }
      setSaving(false);
      return;
    }

    setSaved(true);
    setTimeout(() => navigate({ to: "/users" }), 1200);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AppShell
      title={
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">พนักงาน</span>
        </div>
      }
      subtitle="เพิ่มบัญชีผู้ใช้งานในระบบ"
    >
      <form onSubmit={submit} noValidate>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 p-6">

          {/* ── Main column ── */}
          <div className="space-y-6 min-w-0">

            {/* Success notice */}
            {saved && (
              <div className="flex items-center gap-2 text-sm rounded-md bg-green-500/10 text-green-600 px-3 py-1.5 w-fit">
                <CheckCircle2 className="h-4 w-4" />
                บันทึกพนักงานสำเร็จ กำลังกลับสู่หน้ารายชื่อ…
              </div>
            )}

            {/* Global error */}
            {globalError && (
              <div className="text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/40 px-3 py-2">
                {globalError}
              </div>
            )}

            {/* ── Account info ── */}
            <SectionCard title="ข้อมูลบัญชี">
              <div className="space-y-4">
                <Field label="ชื่อ-นามสกุล" required error={errors.name}>
                  <Input
                    placeholder="เช่น คุณมารินา"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>

                <Field label="Email" required error={errors.email}>
                  <Input
                    type="email"
                    placeholder="example@marinaoptical.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>

                <Field label="รหัสผ่าน" required error={errors.password}>
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <Field label="ยืนยันรหัสผ่าน" required error={errors.confirm}>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
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
                disabled={saving || saved}
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 font-medium shadow hover:opacity-90 disabled:opacity-50"
              >
                {saving
                  ? <Loader2 className="h-5 w-5 animate-spin" />
                  : <Save className="h-5 w-5" />}
                บันทึกพนักงาน
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
            <SectionCard title="สิทธิ์การใช้งาน">
              <div className="space-y-3">
                <Select value={role} onChange={(e) => setRole(e.target.value as "staff" | "admin")}>
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