import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, X, Save, Search,
  ShieldCheck, User, Mail, KeyRound, ChevronRight, Loader2,
} from "lucide-react";

export const Route = createFileRoute("/users/")({
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
  created_at?: string;
}

// ─── Shared components ────────────────────────────────────────────────────────

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 ${props.className ?? ""}`}
    />
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border p-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-sm font-medium text-foreground break-all">{value}</div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function UsersPage() {
  const [staff, setStaff]           = useState<Staff[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState<number | null>(null);
  const [isEditing, setIsEditing]   = useState(false);
  const [editData, setEditData]     = useState<Staff | null>(null);
  const [showPw, setShowPw]         = useState(false);
  const [showEditPw, setShowEditPw] = useState(false);
  const [deleteId, setDeleteId]     = useState<number | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      setError("โหลดข้อมูลไม่สำเร็จ: " + error.message);
    } else {
      setStaff(data ?? []);
      if (data && data.length > 0) setSelected(data[0].id);
    }
    setLoading(false);
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const cur = staff.find((s) => s.id === selected) ?? null;

  // ── Edit ───────────────────────────────────────────────────────────────────

  function startEdit() {
    if (!cur) return;
    setEditData({ ...cur });
    setErrors({});
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditData(null);
    setErrors({});
  }

  function validate(d: Staff) {
    const e: Record<string, string> = {};
    if (!d.name.trim())     e.name     = "กรุณากรอกชื่อ";
    if (!d.email.trim())    e.email    = "กรุณากรอก Email";
    if (!d.password.trim()) e.password = "กรุณากรอกรหัสผ่าน";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function saveEdit() {
    if (!editData || !validate(editData)) return;
    setSaving(true);
    const { error } = await supabase
      .from("staff")
      .update({
        name:     editData.name,
        email:    editData.email,
        password: editData.password,
        role:     editData.role,
      })
      .eq("id", editData.id);

    if (error) {
      setErrors({ _global: "บันทึกไม่สำเร็จ: " + error.message });
    } else {
      setStaff((prev) => prev.map((s) => (s.id === editData.id ? editData : s)));
      setIsEditing(false);
      setEditData(null);
    }
    setSaving(false);
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete(id: number) {
    setDeleting(true);
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) {
      setError("ลบไม่สำเร็จ: " + error.message);
    } else {
      const remaining = staff.filter((s) => s.id !== id);
      setStaff(remaining);
      if (selected === id) setSelected(remaining.length > 0 ? remaining[0].id : null);
    }
    setDeleting(false);
    setDeleteId(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AppShell title="พนักงาน" subtitle="จัดการบัญชีผู้ใช้งานในระบบ">
      {/* Global error banner */}
      {error && (
        <div className="mx-6 mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="ml-3 hover:opacity-70"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 p-6">

        {/* ── Left: Staff list ── */}
        <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col max-h-[calc(100vh-140px)]">
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อหรือ Email..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <Link
              to="/users/new"
              className="w-full flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> เพิ่มพนักงาน
            </Link>
          </div>

          <div className="overflow-y-auto divide-y divide-border">
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลด...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">ไม่พบรายการ</div>
            ) : (
              filtered.map((s) => {
                const active = s.id === selected;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setSelected(s.id); cancelEdit(); setShowPw(false); }}
                    className={`w-full text-left p-4 hover:bg-secondary/60 transition ${active ? "bg-secondary" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {s.name.slice(-2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground truncate text-sm">{s.name}</span>
                          <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 transition ${active ? "text-primary" : "text-muted-foreground/40"}`} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">{s.email}</div>
                      </div>
                    </div>
                    <div className="mt-2 pl-12">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium
                        ${s.role === "admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-secondary text-muted-foreground border-border"
                        }`}>
                        {s.role === "admin" && <ShieldCheck className="h-3 w-3" />}
                        {s.role === "admin" ? "Admin" : "Staff"}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Detail panel ── */}
        {loading ? null : cur ? (
          <div className="space-y-6 min-w-0">
            <SectionCard
              title={isEditing ? "แก้ไขข้อมูลพนักงาน" : cur.name}
              action={
                isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="flex items-center gap-1.5 text-sm rounded-md border border-border px-3 py-1.5 hover:bg-secondary disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" /> ยกเลิก
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="flex items-center gap-1.5 text-sm rounded-md bg-primary text-primary-foreground px-3 py-1.5 hover:opacity-90 disabled:opacity-50"
                    >
                      {saving
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Save className="h-3.5 w-3.5" />}
                      บันทึก
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={startEdit}
                      className="flex items-center gap-1.5 text-sm rounded-md border border-border px-3 py-1.5 hover:bg-secondary"
                    >
                      <Pencil className="h-3.5 w-3.5" /> แก้ไข
                    </button>
                    <button
                      onClick={() => setDeleteId(cur.id)}
                      className="flex items-center gap-1.5 text-sm rounded-md border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> ลบ
                    </button>
                  </div>
                )
              }
            >
              {isEditing && editData ? (
                <div className="space-y-4">
                  {errors._global && (
                    <p className="text-xs text-destructive rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2">
                      {errors._global}
                    </p>
                  )}
                  <div className="flex justify-center mb-2">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {editData.name ? editData.name.slice(-2) : <User className="h-7 w-7 opacity-40" />}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">ชื่อ-นามสกุล</label>
                      <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} placeholder="คุณ..." />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Email</label>
                      <Input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} placeholder="example@marinaoptical.com" />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">รหัสผ่าน</label>
                      <div className="relative">
                        <Input
                          type={showEditPw ? "text" : "password"}
                          value={editData.password}
                          onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                          placeholder="••••••••"
                          className="pr-10"
                        />
                        <button type="button" onClick={() => setShowEditPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showEditPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">สิทธิ์การใช้งาน</label>
                      <select
                        value={editData.role}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value as Staff["role"] })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                      >
                        <option value="staff">พนักงาน (Staff)</option>
                        <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                      {cur.name.slice(-2)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-lg">{cur.name}</div>
                      <span className={`inline-flex items-center gap-1.5 mt-1 rounded-full border px-2.5 py-1 text-xs font-medium
                        ${cur.role === "admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-secondary text-muted-foreground border-border"
                        }`}>
                        {cur.role === "admin" && <ShieldCheck className="h-3 w-3" />}
                        {cur.role === "admin" ? "ผู้ดูแลระบบ (Admin)" : "พนักงาน (Staff)"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={cur.email} />
                    <DetailRow
                      icon={<KeyRound className="h-4 w-4" />}
                      label="รหัสผ่าน"
                      value={
                        <div className="flex items-center gap-2">
                          <span className="font-mono">
                            {showPw ? cur.password : "•".repeat(Math.min(cur.password.length, 10))}
                          </span>
                          <button onClick={() => setShowPw((p) => !p)} className="text-muted-foreground hover:text-foreground">
                            {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      }
                    />
                    <DetailRow icon={<User className="h-4 w-4" />} label="สิทธิ์การใช้งาน" value={cur.role === "admin" ? "ผู้ดูแลระบบ" : "พนักงาน"} />
                  </div>
                </>
              )}
            </SectionCard>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            เลือกพนักงานเพื่อดูข้อมูล
          </div>
        )}
      </div>

      {/* ── Delete confirm ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-xl mx-4 p-6 space-y-4">
            <h2 className="font-semibold text-foreground">ยืนยันการลบ</h2>
            <p className="text-sm text-muted-foreground">
              ต้องการลบ{" "}
              <span className="font-medium text-foreground">
                {staff.find((s) => s.id === deleteId)?.name}
              </span>{" "}
              ออกจากระบบ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 rounded-lg bg-destructive text-destructive-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Trash2 className="h-4 w-4" />}
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}