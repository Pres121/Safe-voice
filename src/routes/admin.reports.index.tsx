import { createFileRoute, Link } from "@tanstack/react-router";
import { useReports } from "@/lib/reports-store";
import { UrgencyBadge, StatusBadge } from "@/components/badges";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Download, Search } from "lucide-react";
import { STATUSES, WELFARE_CATEGORIES, type Urgency, type ReportStatus, type WelfareCategory, type ReportingType } from "@/lib/reports/types";

export const Route = createFileRoute("/admin/reports/")({
  component: ReportsTable,
});

const URGENCIES: Urgency[] = ["Critical", "High", "Medium", "Low"];

function ReportsTable() {
  const reports = useReports();
  const [q, setQ] = useState("");
  const [urgency, setUrgency] = useState<"all" | Urgency>("all");
  const [category, setCategory] = useState<"all" | WelfareCategory>("all");
  const [status, setStatus] = useState<"all" | ReportStatus>("all");
  const [reporting, setReporting] = useState<"all" | ReportingType>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return reports.filter((r) => {
      if (urgency !== "all" && r.urgency !== urgency) return false;
      if (category !== "all" && r.category !== category) return false;
      if (status !== "all" && r.status !== status) return false;
      if (reporting !== "all" && r.reportingType !== reporting) return false;
      if (needle && !`${r.id} ${r.text} ${r.category}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [reports, q, urgency, category, status, reporting]);

  function exportCsv() {
    const headers = ["ID", "Date", "Category", "Reporting", "Urgency", "Status", "Text"];
    const rows = filtered.map((r) => [
      r.id, r.createdAt, r.category, r.reportingType, r.urgency, r.status,
      r.text.replaceAll('"', '""'),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `reports-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-muted-foreground">{filtered.length} of {reports.length} shown</p>
        </div>
        <Button variant="outline" onClick={exportCsv} className="rounded-full">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="relative md:col-span-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID or keywords…" className="h-10 pl-9" />
          </div>
          <Select value={urgency} onValueChange={(v) => setUrgency(v as typeof urgency)}>
            <SelectTrigger className="h-10 md:col-span-2"><SelectValue placeholder="Urgency" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All urgencies</SelectItem>
              {URGENCIES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
            <SelectTrigger className="h-10 md:col-span-3"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {WELFARE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="h-10 md:col-span-2"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={reporting} onValueChange={(v) => setReporting(v as typeof reporting)}>
            <SelectTrigger className="h-10 md:col-span-1"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Anonymous">Anonymous</SelectItem>
              <SelectItem value="Non-Anonymous">Identified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Report ID</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Urgency</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{format(new Date(r.createdAt), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.reportingType}</td>
                  <td className="px-4 py-3"><UrgencyBadge urgency={r.urgency} /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/admin/reports/$id" params={{ id: r.id }} className="text-sm font-medium text-primary hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No reports match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
