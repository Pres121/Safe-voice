import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useReport, setStatus, addNote, assign, deleteReport } from "@/lib/reports-store";
import { UrgencyBadge, StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUSES, type ReportStatus } from "@/lib/reports/types";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Hash, MapPin, User, EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FASTAPI_BASE_URL } from "@/lib/api/backend";

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
  const navigate = useNavigate();
  const report = useReport(id);
  const [note, setNote] = useState("");
  const [officer, setOfficer] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!report) return;
    setDeleting(true);
    const result = await deleteReport(report.id);
    setDeleting(false);
    if (result.ok) {
      toast.success("Report deleted");
      navigate({ to: "/admin/reports" });
    } else {
      toast.error(result.error ?? "Failed to delete report");
    }
  }

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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full text-critical hover:text-critical" disabled={deleting}>
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this report from the database. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-critical text-critical-foreground hover:bg-critical/90"
                  onClick={handleDelete}
                >
                  Delete report
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
              {report.locationLat !== undefined && report.locationLng !== undefined && (
                <div className="flex items-start justify-between border-b border-border/60 pb-3 last:border-0">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">GPS Coordinates</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs">{report.locationLat.toFixed(6)}, {report.locationLng.toFixed(6)}</p>
                    <a
                      href={`https://maps.google.com/?q=${report.locationLat},${report.locationLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex text-xs text-primary hover:underline"
                    >
                      View on map →
                    </a>
                  </div>
                </div>
              )}
            </dl>
          </Section>

          <Section title="Student identity">
            <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-3 text-sm">
              <Row icon={Hash} label="Student ID" value={report.studentId ?? "—"} />
              <p className="mt-2 text-xs text-muted-foreground">
                Only a generated student ID is visible to administrators. Personal email and name are kept private.
              </p>
            </div>
          </Section>

          <Section title="ML prediction">
            <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Predicted urgency</span>
                <UrgencyBadge urgency={report.urgency} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Classified by <code className="rounded bg-background px-1">student_welfare_model3.pkl</code> via{" "}
                <code className="rounded bg-background px-1">POST /api/v1/ml/predict</code> on submit.
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground/70">{FASTAPI_BASE_URL}</p>
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
