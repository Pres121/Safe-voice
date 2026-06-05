import type { Urgency, ReportStatus } from "@/lib/reports/types";
import { cn } from "@/lib/utils";

const urgencyMap: Record<Urgency, string> = {
  Critical: "bg-critical/15 text-critical border-critical/30",
  High: "bg-warning/20 text-warning-foreground border-warning/40",
  Medium: "bg-accent text-accent-foreground border-accent",
  Low: "bg-success/15 text-success border-success/30",
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        urgencyMap[urgency],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {urgency}
    </span>
  );
}

const statusMap: Record<ReportStatus, string> = {
  New: "bg-primary/10 text-primary border-primary/20",
  "Under Review": "bg-teal/15 text-teal border-teal/30",
  "In Progress": "bg-warning/15 text-warning-foreground border-warning/30",
  Resolved: "bg-success/15 text-success border-success/30",
  Escalated: "bg-critical/15 text-critical border-critical/30",
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusMap[status],
      )}
    >
      {status}
    </span>
  );
}
