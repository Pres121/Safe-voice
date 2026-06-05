import { createFileRoute, Link } from "@tanstack/react-router";
import { useReports } from "@/lib/reports-store";
import { UrgencyBadge, StatusBadge } from "@/components/badges";
import { format } from "date-fns";
import {
  ArrowRight, FileText, AlertTriangle, Activity, ShieldAlert, ShieldCheck, EyeOff, User,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const reports = useReports();
  const by = (f: (r: (typeof reports)[number]) => boolean) => reports.filter(f).length;

  const cards = [
    { label: "Total reports", value: reports.length, icon: FileText, accent: "from-primary/15 to-primary/5 text-primary" },
    { label: "Critical", value: by((r) => r.urgency === "Critical"), icon: ShieldAlert, accent: "from-critical/15 to-critical/5 text-critical" },
    { label: "High priority", value: by((r) => r.urgency === "High"), icon: AlertTriangle, accent: "from-warning/25 to-warning/5 text-warning-foreground" },
    { label: "Medium priority", value: by((r) => r.urgency === "Medium"), icon: Activity, accent: "from-accent to-accent/30 text-accent-foreground" },
    { label: "Low priority", value: by((r) => r.urgency === "Low"), icon: ShieldCheck, accent: "from-success/15 to-success/5 text-success" },
    { label: "Anonymous", value: by((r) => r.reportingType === "Anonymous"), icon: EyeOff, accent: "from-teal/15 to-teal/5 text-teal" },
    { label: "Non-anonymous", value: by((r) => r.reportingType === "Non-Anonymous"), icon: User, accent: "from-primary/15 to-teal/10 text-primary" },
  ];

  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 } as const;
  const queue = [...reports]
    .sort((a, b) => priorityOrder[a.urgency] - priorityOrder[b.urgency] || +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Good day, Admin</h1>
        <p className="mt-1 text-muted-foreground">Here's a snapshot of welfare reports across campus.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.accent}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div className="mt-3 text-2xl font-bold tabular-nums">{c.value}</div>
            <div className="text-xs font-medium text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Priority queue</h2>
              <p className="text-sm text-muted-foreground">Sorted by urgency, then most recent.</p>
            </div>
            <Link to="/admin/reports" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {queue.map((r) => (
              <li key={r.id}>
                <Link
                  to="/admin/reports/$id"
                  params={{ id: r.id }}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-secondary/40"
                >
                  <UrgencyBadge urgency={r.urgency} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.category} · <span className="font-mono text-xs text-muted-foreground">{r.id}</span></div>
                    <div className="truncate text-xs text-muted-foreground">{r.text}</div>
                  </div>
                  <StatusBadge status={r.status} />
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {format(new Date(r.createdAt), "MMM d")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold">Quick links</h2>
          <p className="text-sm text-muted-foreground">Jump straight to what you need.</p>
          <div className="mt-4 space-y-2">
            <Link to="/admin/reports" className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-secondary/50">
              <span className="font-medium">All reports</span><ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/admin/analytics" className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-secondary/50">
              <span className="font-medium">Analytics</span><ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/report" className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-secondary/50">
              <span className="font-medium">Student report form</span><ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
