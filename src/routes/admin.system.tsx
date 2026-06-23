import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Activity, Brain, Database, RefreshCw, Server, CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchMetrics, fetchSystemStatus, FASTAPI_BASE_URL, type MetricsResponse, type SystemStatus } from "@/lib/api/backend";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/system")({
  component: AdminSystemPage,
});

function StatusPill({ status }: { status: string }) {
  const healthy = status === "healthy" || status === "ok" || status === "ready" || status === "connected";
  const degraded = status === "degraded" || status === "missing";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        healthy && "bg-success/15 text-success",
        degraded && "bg-warning/20 text-warning-foreground",
        !healthy && !degraded && "bg-critical/15 text-critical",
      )}
    >
      {healthy ? <CheckCircle2 className="h-3.5 w-3.5" /> : degraded ? <AlertTriangle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function AdminSystemPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, m] = await Promise.all([fetchSystemStatus(), fetchMetrics()]);
      setStatus(s);
      setMetrics(m);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the API");
      setStatus(null);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 30_000);
    return () => window.clearInterval(interval);
  }, [load]);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return "—";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System & Model</h1>
          <p className="mt-1 text-muted-foreground">
            API health, ML model status, and live report statistics.
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{FASTAPI_BASE_URL}</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="rounded-full">
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-critical/30 bg-critical/10 p-5 text-sm text-critical">
          <p className="font-semibold">API unreachable</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-xs opacity-80">
            Start the backend with: <code className="rounded bg-background/60 px-1">uvicorn backend.main:app --reload --port 8000</code>
          </p>
        </div>
      )}

      {lastRefresh && !error && (
        <p className="text-xs text-muted-foreground">
          Last updated {lastRefresh.toLocaleTimeString()} · auto-refreshes every 30s
        </p>
      )}

      {status && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="API status" value={status.api.status} icon={Server} sub={`v${status.api.version}`} />
            <StatCard label="Uptime" value={formatUptime(status.api.uptime_seconds)} icon={Activity} />
            <StatCard label="Database" value={status.database.status} icon={Database} sub={`${status.database.report_count ?? 0} reports`} />
            <StatCard label="ML model" value={status.model.health.status} icon={Brain} sub={status.model.loaded ? "Loaded in memory" : "Not loaded"} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">API health</h2>
                <StatusPill status={status.api.status} />
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Service</dt>
                  <dd className="font-medium">{status.api.title}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Version</dt>
                  <dd className="font-mono text-xs">{status.api.version}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Database</dt>
                  <dd><StatusPill status={status.database.status} /></dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">DB path</dt>
                  <dd className="max-w-[200px] truncate font-mono text-xs">{status.database.path ?? "—"}</dd>
                </div>
              </dl>

              <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Endpoints</h3>
              <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
                {status.endpoints.map((ep) => (
                  <li key={`${ep.method}-${ep.path}`} className="flex items-center justify-between gap-2 rounded-lg bg-secondary/40 px-3 py-2">
                    <span className="font-mono text-xs">
                      <span className="text-primary">{ep.method}</span> {ep.path}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{ep.description}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">ML model</h2>
                <StatusPill status={status.model.health.status} />
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-medium">{status.model.model_type ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">File size</dt>
                  <dd>{formatBytes(status.model.file_size_bytes)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Predictions served</dt>
                  <dd className="font-bold tabular-nums">{status.model.predictions_served}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Model path</dt>
                  <dd className="max-w-[200px] truncate font-mono text-xs" title={status.model.path}>
                    ML_model/student_welfare_model3.pkl
                  </dd>
                </div>
              </dl>

              {status.model.classes && (
                <>
                  <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Output classes</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {status.model.classes.map((c) => (
                      <span key={c} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {c} → {status.model.label_map[c] ?? "Low"}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {status.model.pipeline_steps && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Pipeline: {status.model.pipeline_steps.join(" → ")}
                </p>
              )}

              {status.model.health.smoke_test && (
                <div className="mt-4 rounded-xl border border-dashed border-border bg-secondary/30 p-3 text-sm">
                  <p className="font-medium">Smoke test</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    "{status.model.health.smoke_test.sample_text}"
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span>Predicted: <strong>{status.model.health.smoke_test.predicted_severity}</strong></span>
                    <span className="text-muted-foreground">{status.model.health.smoke_test.latency_ms} ms</span>
                  </div>
                </div>
              )}
            </section>
          </div>
        </>
      )}

      {metrics && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold">Report statistics</h2>
          <p className="text-sm text-muted-foreground">Live counts from the database.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.severity_distribution.map((row) => (
              <div key={row.severity} className="rounded-xl border border-border bg-secondary/30 p-4 text-center">
                <p className="text-2xl font-bold tabular-nums">{row.count}</p>
                <p className="text-xs font-medium text-muted-foreground">{row.severity}</p>
              </div>
            ))}
          </div>

          {Object.keys(metrics.reports.by_category).length > 0 && (
            <>
              <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">By category</h3>
              <ul className="mt-3 space-y-2">
                {Object.entries(metrics.reports.by_category)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count]) => (
                    <li key={cat} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
                      <span>{cat}</span>
                      <span className="font-bold tabular-nums">{count}</span>
                    </li>
                  ))}
              </ul>
            </>
          )}

          {Object.keys(metrics.reports.by_reporting_type).length > 0 && (
            <>
              <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">By reporting type</h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {Object.entries(metrics.reports.by_reporting_type).map(([type, count]) => (
                  <div key={type} className="rounded-xl border border-border px-4 py-2 text-sm">
                    <span className="text-muted-foreground">{type}: </span>
                    <span className="font-bold tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
