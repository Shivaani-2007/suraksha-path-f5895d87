import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BellRing, CheckCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Notice, PageHeader, Pill } from "@/components/common";
import { useStore } from "@/services/store";
import { useT } from "@/services/i18n";
import { timeAgo } from "@/utils/geo";
import type { AlertType } from "@/types";

export const Route = createFileRoute("/_dash/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — SURAKSHA PATH" },
      { name: "description", content: "Simulated alerts about road blockages, shelters and route conditions." },
      { property: "og:title", content: "Alerts — SURAKSHA PATH" },
      { property: "og:description", content: "Notification centre with simulated safety alerts." },
    ],
  }),
  component: Alerts,
});

const TYPES: Record<AlertType, string> = {
  road_blockage: "Road blockage",
  shelter_update: "Shelter update",
  route_change: "Route condition",
  report_review: "Report review",
  announcement: "Announcement",
};

function Alerts() {
  const { alerts, setAlertRead, markAllRead, settings, now } = useStore();
  const t = useT();
  const [type, setType] = useState<AlertType | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const muted = (a: AlertType) =>
    (a === "road_blockage" || a === "route_change") ? !settings.notifyRoad : a === "shelter_update" ? !settings.notifyShelter : a === "report_review" ? !settings.notifyReports : false;
  const list = alerts
    .filter((a) => !muted(a.type))
    .filter((a) => type === "all" || a.type === type)
    .filter((a) => !unreadOnly || !a.read)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return (
    <>
      <PageHeader title="Alerts" desc="Simulated notifications for demonstration — these are not government warnings." actions={<Button variant="outline" onClick={markAllRead}><CheckCheck /> Mark all read</Button>} />
      <div className="mb-4 rounded-xl border-2 border-danger/40 bg-danger/10 p-4 font-semibold text-danger" role="note">{t("official")}</div>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter alerts">
        <Button size="sm" variant={type === "all" ? "default" : "outline"} aria-pressed={type === "all"} onClick={() => setType("all")}>All</Button>
        {(Object.keys(TYPES) as AlertType[]).map((k) => (
          <Button key={k} size="sm" variant={type === k ? "default" : "outline"} aria-pressed={type === k} onClick={() => setType(k)}>{TYPES[k]}</Button>
        ))}
        <Button size="sm" variant={unreadOnly ? "teal" : "outline"} aria-pressed={unreadOnly} onClick={() => setUnreadOnly(!unreadOnly)}>Unread only</Button>
      </div>
      {list.length === 0 ? <EmptyState title="No alerts to show">Some categories may be turned off in Settings.</EmptyState> : (
        <ul className="space-y-3">
          {list.map((a) => (
            <li key={a.id} className={`card-surface p-5 ${a.read ? "opacity-80" : "border-l-4 border-l-primary"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <BellRing className="mt-1 h-5 w-5 text-primary" aria-hidden />
                  <div>
                    <h2 className="font-semibold">{a.title} {!a.read && <span className="sr-only">(unread)</span>}</h2>
                    <p className="text-sm">{a.message}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Pill tone="neutral">{TYPES[a.type]}</Pill>
                  <Pill tone={a.verification === "community" ? "info" : "warning"}>{a.verification === "community" ? "Community report" : "Simulated"}</Pill>
                </div>
              </div>
              <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                {a.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden />{a.location}</span>}
                <span>{timeAgo(a.createdAt, now)}</span><span>Source: {a.source}</span>
              </p>
              <p className="mt-2 text-sm"><strong>Suggested next step:</strong> {a.nextAction}</p>
              <Button size="sm" variant="ghost" className="mt-2" onClick={() => setAlertRead(a.id, !a.read)}>{a.read ? "Mark unread" : "Mark read"}</Button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6"><Notice>Alerts are generated from sample data only.</Notice></div>
    </>
  );
}
