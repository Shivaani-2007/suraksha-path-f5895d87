import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Notice, PageHeader, Pill, SimBadge, StatusPill } from "@/components/common";
import { useStore } from "@/services/store";
import { categoryLabel, statusLabel } from "@/utils/labels";
import { timeAgo } from "@/utils/geo";
import type { ReportStatus } from "@/types";

const STATUSES = Object.keys(statusLabel) as ReportStatus[];

export const Route = createFileRoute("/_dash/reports")({
  validateSearch: z.object({ status: z.enum(["pending", "under_review", "verified", "rejected", "resolved"]).optional() }),
  head: () => ({
    meta: [
      { title: "Report History & Review — SURAKSHA PATH" },
      { name: "description", content: "History of community reports and the demo administrator review queue." },
      { property: "og:title", content: "Report History — SURAKSHA PATH" },
      { property: "og:description", content: "Track and review community safety reports." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const search = Route.useSearch();
  const { incidents, role, setReportStatus, myReportIds, now } = useStore();
  const [filter, setFilter] = useState<ReportStatus | "all">(search.status ?? "all");
  const [mine, setMine] = useState(false);
  const list = incidents
    .filter((i) => filter === "all" || i.status === filter)
    .filter((i) => !mine || myReportIds.includes(i.id))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const change = (id: string, s: ReportStatus) => {
    if (setReportStatus(id, s)) toast.success(`Status changed to “${statusLabel[s]}”.`);
    else toast.error("Only demo administrators can change review status.");
  };

  return (
    <>
      <PageHeader title="Report History" desc="All community reports with their review status and change log." actions={<Button asChild><Link to="/report">New report</Link></Button>} />
      {role === "admin" ? (
        <div className="mb-4"><Notice><strong>Demo administrator mode.</strong> You can change review status. This is a demo role switch, not secure sign-in.</Notice></div>
      ) : (
        <div className="mb-4"><Notice>Ordinary users cannot verify reports. Switch to “Demo administrator” in the profile menu (top right) to try the review flow.</Notice></div>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
        {(["all", ...STATUSES] as const).map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {s === "all" ? "All" : statusLabel[s]}
          </Button>
        ))}
        <Button size="sm" variant={mine ? "teal" : "outline"} aria-pressed={mine} onClick={() => setMine(!mine)}>My reports</Button>
      </div>
      {list.length === 0 ? <EmptyState title="No reports here">Submit a report or change the filter.</EmptyState> : (
        <ul className="space-y-3">
          {list.map((i) => (
            <li key={i.id} className="card-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{i.title}</h2>
                  <p className="text-sm text-muted-foreground">{categoryLabel[i.category]} · {i.reporterRole} · {timeAgo(i.createdAt, now)} · severity {i.severity}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill s={i.status} />
                  {i.source === "user_report" ? <Pill tone="info">User report</Pill> : <SimBadge />}
                  {i.status !== "verified" && <Pill tone="warning">Unverified</Pill>}
                </div>
              </div>
              <p className="mt-2 text-sm">{i.description}</p>
              {i.image && <img src={i.image} alt={`Photo attached to report: ${i.title}`} className="mt-2 h-24 rounded-lg object-cover" />}
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-primary">Status history ({i.history.length})</summary>
                <ol className="mt-2 space-y-1 border-l-2 border-border pl-3">
                  {i.history.map((h, idx) => <li key={idx}><strong>{statusLabel[h.status]}</strong> — {new Date(h.at).toLocaleString()} by {h.by}</li>)}
                </ol>
              </details>
              {role === "admin" && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                  <label htmlFor={`st-${i.id}`} className="text-sm font-medium">Set status</label>
                  <select id={`st-${i.id}`} value={i.status} onChange={(e) => change(i.id, e.target.value as ReportStatus)} className="h-9 rounded-lg border border-input bg-background px-2 text-sm">
                    {STATUSES.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                  </select>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
