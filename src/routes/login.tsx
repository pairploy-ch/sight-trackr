import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Glasses, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase"; 

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ — MARINA OPTICAL" },
      { name: "description", content: "เข้าสู่ระบบสำหรับพนักงานร้านแว่น" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd]     = useState("");
  const [show, setShow]   = useState(false);
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !pwd.trim()) {
      setErr("กรุณากรอก Email และรหัสผ่าน");
      return;
    }

    setLoading(true);
    setErr("");

const { data, error } = await supabase
  .from("staff")
  .select("id, name, email, role")
  .eq("email", email.trim())
  .eq("password", pwd)
  .maybeSingle();

    setLoading(false);

    if (error) {
      setErr("เกิดข้อผิดพลาด กรุณาลองใหม่");
      return;
    }
    if (!data) {
      setErr("Email หรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    // เก็บ session ไว้ใน localStorage
    localStorage.setItem("staff", JSON.stringify(data));
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold tracking-wider text-lg">MARINA OPTICAL</div>
            <div className="text-xs text-sidebar-foreground/70">VISION CARE SYSTEM</div>
          </div>
        </div>
        <div className="space-y-4 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            ระบบจัดการลูกค้า<br />MARINA OPTICAL
          </h1>
          <p className="text-sidebar-foreground/80 leading-relaxed">
            จัดเก็บประวัติค่าสายตา ใบงาน เลนส์ และกรอบแว่น
            พร้อมติดตามสถานะการผลิตได้ทุกขั้นตอน
          </p>
        </div>
        <div className="text-xs text-sidebar-foreground/60">
          © 2024 MARINA OPTICAL · Version 1.0.0
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-primary p-2">
              <Glasses className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="font-bold tracking-wider">MARINA OPTICAL</div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">เข้าสู่ระบบ</h2>
            <p className="text-sm text-muted-foreground mt-1">เฉพาะพนักงานที่ได้รับสิทธิ์เท่านั้น</p>
          </div>

          {err && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-sm px-3 py-2">
              {err}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="example@marinaoptical.com"
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}