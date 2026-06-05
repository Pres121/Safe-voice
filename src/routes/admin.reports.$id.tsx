import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useReport, setStatus, addNote, assign } from "@/lib/reports-store";
import { UrgencyBadge, StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUSES, type ReportStatus } from "@/lib/reports/types";
import { format } from "date-fns";
import { ArrowLeft, Calendar, MapPin, Mail, Phone, MessageCircle, User, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports/$id")({
  component: ReportDetail,
  notFoundComponent: () => (
    <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
      Report not found.
    </div>
  ),
});

function ReportDetail() {
  const { id } = useParams({ from: "/admin/reports/$id" });
  const report = useReport(id);
  const [note, setNote] = useState("");
  const [officer, setOfficer] = useState("");

  if (!report) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No report with ID <span className="font-mono">{id}</span>.</p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link to="/admin/reports">Back to reports</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/reports" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to reports
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-muted-foreground">{report.id}</div>
          <h1 className="text-3xl font-bold tracking-tight">{report.category}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submitted {format(new Date(report.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UrgencyBadge urgency={report.urgency} />
          <StatusBadge status={report.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Report">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{report.text}</p>
          </Section>

          <Section title="Internal notes">
            <div className="space-y-3">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for the welfare team…" rows={3} />
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (!note.trim()) return;
                    addNote(report.id, note.trim());
                    setNote("");
                    toast.success("Note added");
                  }}
                  className="rounded-full"
                >
                  Add note
                </Button>
              </div>
              <ul className="space-y-3">
                {report.notes.map((n) => (
                  <li key={n.id} className="rounded-xl border border-border bg-secondary/30 p-3">
                    <div className="text-xs text-muted-foreground">{n.author} · {format(new Date(n.createdAt), "MMM d, h:mm a")}</div>
                    <div className="mt-1 text-sm">{n.text}</div>
                  </li>
                ))}
                {report.notes.length === 0 && <li className="text-sm text-muted-foreground">No notes yet.</li>}
              </ul>
            </div>
          </Section>

          <Section title="Audit log">
            <ul className="space-y-2 text-sm">
              {report.auditLog.map((e) => (
                <li key={e.id} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                  <span>{e.action} <span className="text-muted-foreground">by {e.by}</span></span>
                  <span className="text-xs text-muted-foreground">{format(new Date(e.at), "MMM d, h:mm a")}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Status">
            <Select value={report.status} onValueChange={(v) => { setStatus(report.id, v as ReportStatus); toast.success(`Status set to ${v}`); }}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Section>

          <Section title="Assignment">
            <Label htmlFor="officer" className="text-xs text-muted-foreground">Welfare officer</Label>
            <div className="mt-1 flex gap-2">
              <Input id="officer" value={officer} onChange={(e) => setOfficer(e.target.value)} placeholder="e.g. Dr. Lee" />
              <Button
                onClick={() => {
                  if (!officer.trim()) return;
                  assign(report.id, officer.trim());
                  toast.success("Assigned");
                  setOfficer("");
                }}
                className="rounded-full"
              >
                Assign
              </Button>
            </div>
            {report.assignedTo && (
              <p className="mt-2 text-sm text-muted-foreground">Currently: <span className="font-medium text-foreground">{report.assignedTo}</span></p>
            )}
          </Section>

          <Section title="Submission details">
            <dl className="space-y-3 text-sm">
              <Row icon={report.reportingType === "Anonymous" ? EyeOff : User} label="Type" value={report.reportingType} />
              <Row icon={Calendar} label="Date of incident" value={report.incidentDate ?? "—"} />
              <Row icon={MapPin} label="Location" value={report.incidentLocation ?? "—"} />
            </dl>
          </Section>

          {report.reportingType === "Non-Anonymous" && (
            <Section title="Contact information">
              <dl className="space-y-3 text-sm">
                <Row icon={User} label="Name" value={report.fullName ?? "—"} />
                <Row icon={Mail} label="Email" value={report.email ?? "—"} />
                <Row icon={Phone} label="Phone" value={report.phone ?? "—"} />
                <Row icon={MessageCircle} label="Preferred" value={report.preferredContact ?? "—"} />
              </dl>
            </Section>
          )}

          <Section title="ML prediction">
            <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Predicted urgency</span>
                <UrgencyBadge urgency={report.urgency} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Provided by the urgency classification service. Wire <code className="rounded bg-background px-1">POST /predict</code> in <code className="rounded bg-background px-1">src/lib/ml-service.ts</code>.
              </p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" /> {label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
