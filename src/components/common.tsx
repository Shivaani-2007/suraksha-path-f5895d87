import type { ReactNode } from "react";
import { AlertTriangle, FlaskConical, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportStatus, TriState, VerificationStatus } from "@/types";
import { statusLabel, verificationLabel } from "@/utils/labels";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-bold tracking-tight", className)}>
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
        <path d="M16 2 4 6.5v8.2C4 22.3 9.1 28 16 30c6.9-2 12-7.7 12-15.3V6.5L16 2Z" className="fill-primary" />
        <path d="M11 24c0-5 10-5 10-10s-5-5-5-5" className="stroke-teal" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="16" cy="8.5" r="2.2" className="fill-primary-foreground" />
      </svg>
      <span className={light ? "text-navy-foreground" : "text-foreground"}>
        SURAKSHA <span className="text-teal">PATH</span>
      </span>
    </span>
  );
}

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "teal";
const toneCls: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/30",
  warning: "bg-warning/15 text-warning-foreground border-warning/40",
  danger: "bg-danger/10 text-danger border-danger/30",
  info: "bg-primary/10 text-primary border-primary/25",
  teal: "bg-teal/10 text-teal border-teal/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function Pill({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", toneCls[tone], className)}>
      {children}
    </span>
  );
}

export function SimBadge({ label = "Simulated" }: { label?: string }) {
  return (
    <Pill tone="neutral">
      <FlaskConical className="h-3 w-3" aria-hidden /> {label}
    </Pill>
  );
}

const vTone: Record<VerificationStatus, Tone> = { verified: "success", community: "info", overdue: "warning", unavailable: "neutral" };
export function VerificationPill({ v }: { v: VerificationStatus }) {
  return <Pill tone={vTone[v]}>{verificationLabel[v]}</Pill>;
}

const sTone: Record<ReportStatus, Tone> = { pending: "warning", under_review: "info", verified: "success", rejected: "danger", resolved: "teal" };
export function StatusPill({ s }: { s: ReportStatus }) {
  return <Pill tone={sTone[s]}>{statusLabel[s]}</Pill>;
}

export function TriLabel({ v }: { v: TriState }) {
  if (v === "yes") return <span className="font-semibold text-success">Yes</span>;
  if (v === "no") return <span className="font-semibold text-danger">No</span>;
  return <span className="font-semibold text-muted-foreground">Unknown</span>;
}

export function PageHeader({ title, desc, actions }: { title: string; desc?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {desc && <p className="mt-1 max-w-2xl text-muted-foreground">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warning"; children: ReactNode }) {
  const Icon = tone === "warning" ? AlertTriangle : Info;
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3 text-sm",
        tone === "warning" ? "border-warning/40 bg-warning/10 text-warning-foreground" : "border-primary/20 bg-primary/5 text-foreground",
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card-surface flex flex-col items-center p-10 text-center">
      <Info className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="font-display font-semibold">{title}</p>
      {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
