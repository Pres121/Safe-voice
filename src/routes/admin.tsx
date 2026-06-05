import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ListChecks, BarChart3, ArrowLeft, Bell, Shield } from "lucide-react";
import { useReports } from "@/lib/reports-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — SafeVoice" },
      { name: "description", content: "Review and manage student welfare reports." },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/reports", label: "Reports", icon: ListChecks, exact: false },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, exact: true },
] as const;

function AdminLayout() {
  const reports = useReports();
  const criticalNew = reports.filter((r) => r.urgency === "Critical" && r.status === "New").length;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5 font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-teal text-primary-foreground">
            <Shield className="h-4 w-4" />
          </span>
          SafeVoice Admin
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Link to="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-8">
          <div className="md:hidden">
            <Link to="/admin" className="font-semibold">SafeVoice Admin</Link>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {criticalNew > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-critical/30 bg-critical/10 px-3 py-1 text-xs font-medium text-critical">
                <Bell className="h-3.5 w-3.5" />
                {criticalNew} new critical {criticalNew === 1 ? "report" : "reports"}
              </div>
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal text-sm font-semibold text-primary-foreground">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
