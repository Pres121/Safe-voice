import { createFileRoute } from "@tanstack/react-router";
import { useReports } from "@/lib/reports-store";
import { WELFARE_CATEGORIES } from "@/lib/reports/types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { format, startOfMonth } from "date-fns";

export const Route = createFileRoute("/admin/analytics")({
  component: Analytics,
});

const URGENCY_COLORS: Record<string, string> = {
  Critical: "var(--critical)",
  High: "var(--warning)",
  Medium: "var(--chart-2)",
  Low: "var(--success)",
};

function Analytics() {
  const reports = useReports();

  const byCategory = WELFARE_CATEGORIES.map((c) => ({
    category: c,
    count: reports.filter((r) => r.category === c).length,
  })).filter((d) => d.count > 0);

  const byUrgency = (["Critical", "High", "Medium", "Low"] as const).map((u) => ({
    urgency: u,
    count: reports.filter((r) => r.urgency === u).length,
  }));

  const monthly = (() => {
    const map = new Map<string, number>();
    reports.forEach((r) => {
      const key = format(startOfMonth(new Date(r.createdAt)), "MMM yyyy");
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([month, count]) => ({ month, count }))
      .reverse();
  })();

  const resolution = (() => {
    const total = reports.length || 1;
    const resolved = reports.filter((r) => r.status === "Resolved").length;
    const inProgress = reports.filter((r) => r.status === "In Progress" || r.status === "Under Review").length;
    const open = reports.filter((r) => r.status === "New" || r.status === "Escalated").length;
    return [
      { name: "Resolved", value: resolved, pct: Math.round((resolved / total) * 100) },
      { name: "In progress", value: inProgress, pct: Math.round((inProgress / total) * 100) },
      { name: "Open", value: open, pct: Math.round((open / total) * 100) },
    ];
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Patterns and trends across welfare reports.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Reports by category">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={byCategory} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Reports by urgency">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byUrgency} dataKey="count" nameKey="urgency" innerRadius={60} outerRadius={95} paddingAngle={4}>
                  {byUrgency.map((d) => <Cell key={d.urgency} fill={URGENCY_COLORS[d.urgency]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Monthly trends">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="var(--teal)" strokeWidth={3} dot={{ r: 4, fill: "var(--teal)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Resolution statistics">
          <ul className="space-y-4 py-4">
            {resolution.map((r) => (
              <li key={r.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-muted-foreground">{r.value} ({r.pct}%)</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-teal"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--popover-foreground)",
  fontSize: 12,
} as const;

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
