import { Link, useRouterState } from "@tanstack/react-router";
import {
  Glasses, Home, Users, FileText, History, Clock, BarChart3,
  Package, Settings, UserCog, ScanBarcode, Menu, Bell, ChevronDown,
  ChevronRight, Plus, LogOut,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "หน้าหลัก", to: "/" as const },
  { icon: Users, label: "ลูกค้า", to: "/customers" as const },
  // { icon: FileText, label: "ใบงาน / ใบสั่งเลนส์", to: "/" as const, hasChild: true },
  { icon: History, label: "ประวัติลูกค้า", to: "/history" as const, hasChild: true },

  { icon: BarChart3, label: "รายงาน", to: "/reports" as const, hasChild: true },
  // { icon: Package, label: "สินค้า / เลนส์", to: "/products" as const, hasChild: true },
  { icon: Settings, label: "ตั้งค่า", to: "/settings" as const, hasChild: true },
  { icon: UserCog, label: "ผู้ใช้งาน", to: "/users" as const },
];

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
          {/* <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-sidebar-border/60 bg-sidebar-accent/40 px-3 py-3 text-sm hover:bg-sidebar-accent">
            <ScanBarcode className="h-5 w-5" /> สแกนบาร์โค้ด
          </button> */}
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
            {/* <button className="p-2 rounded-md hover:bg-secondary">
              <Menu className="h-5 w-5" />
            </button> */}
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
            {/* <button className="relative p-2 rounded-md hover:bg-secondary">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold flex items-center justify-center">3</span>
            </button> */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-semibold">A</div>
              <div className="text-right">
                <div className="text-sm font-semibold">Admin</div>
                <div className="text-xs text-muted-foreground">ผู้ดูแลระบบ</div>
              </div>
              {/* <ChevronDown className="h-4 w-4 text-muted-foreground" /> */}
              <Link to="/login" title="ออกจากระบบ" className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
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