import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, Users, BarChart3, Settings, UserCog,
  ChevronRight, Plus, LogOut,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "หน้าหลัก", to: "/" as const },
  { icon: Users, label: "ลูกค้า", to: "/customers" as const },
  { icon: BarChart3, label: "รายงาน", to: "/reports" as const, hasChild: true },
  { icon: Settings, label: "ตั้งค่า", to: "/settings" as const, hasChild: true },
  { icon: UserCog, label: "ผู้ใช้งาน", to: "/users" as const },
];

function getStaff() {
  try {
    return JSON.parse(localStorage.getItem("staff") ?? "{}");
  } catch {
    return {};
  }
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const staff = getStaff();

  function handleLogout() {
    localStorage.removeItem("staff");
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <div>
            <div className="font-bold tracking-wide">MARINA OPTICAL</div>
            <div className="text-xs text-sidebar-foreground/70">VISION CARE SYSTEM</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((it) => {
            const active =
              it.to === "/"
                ? pathname === "/"
                : pathname.startsWith(it.to);
            return (
              <Link
                key={it.label}
                to={it.to}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent"
                }`}
              >
                <span className="flex items-center gap-3">
                  <it.icon className="h-4 w-4" />
                  {it.label}
                </span>
                {it.hasChild && <ChevronRight className="h-4 w-4 opacity-60" />}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-4">
          <div className="mt-4 text-xs text-sidebar-foreground/60 text-center">
            <div className="font-semibold text-sidebar-foreground/80">MARINA OPTICAL</div>
            <div>© 2024 All Rights Reserved</div>
            <div>Version 1.0.0</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-base font-semibold text-foreground">{title}</div>
              {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/jobs/new"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> สร้างใบงานใหม่
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-semibold">
                {staff?.name?.slice(-2) ?? "?"}
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{staff?.name ?? "ไม่ทราบชื่อ"}</div>
                <div className="text-xs text-muted-foreground">
                  {staff?.role === "admin" ? "ผู้ดูแลระบบ" : "พนักงาน"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="ออกจากระบบ"
                className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-base font-semibold text-primary">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}