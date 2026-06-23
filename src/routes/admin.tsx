import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ListChecks, BarChart3, ArrowLeft, Bell, Shield, LogOut, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { useReports, syncReportsFromApi } from "@/lib/reports-store";
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
  { to: "/admin/system", label: "System", icon: Cpu, exact: true },
] as const;

const ADMIN_STORAGE_KEY = "safevoice-admin-auth";
const ADMIN_EMAIL = "admin@safevoice.com";
const ADMIN_PASSWORD = "SafeVoice2026!";

function AdminLayout() {
  const reports = useReports();
  const criticalNew = reports.filter((r) => r.urgency === "Critical" && r.status === "New").length;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    setIsAuthenticated(saved === "true");
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    syncReportsFromApi();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      setIsAuthenticated(true);
      setError("");
      return;
    }
    setError("Invalid admin email or password.");
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-teal text-primary-foreground">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Admin access</p>
              <h1 className="text-2xl font-semibold">Sign in</h1>
            </div>
          </div>
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="admin-email" className="mb-1 block text-sm font-medium">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 outline-none ring-0 focus:border-primary"
                placeholder="admin@safevoice.com"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1 block text-sm font-medium">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 outline-none ring-0 focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
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
            <button
              type="button"
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground md:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
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
