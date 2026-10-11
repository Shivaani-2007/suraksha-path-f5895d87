/**
 * Demo-mode data service. Persists to this browser's localStorage only.
 * Swap these actions for API calls (e.g. a FastAPI or Cloud backend) later.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as sample from "@/data/sample";
import type { AccessibilityProfile, AlertItem, AppSettings, Incident, ReportStatus } from "@/types";

export type DemoRole = "user" | "admin";

interface State {
  shelters: typeof sample.shelters;
  incidents: Incident[];
  alerts: AlertItem[];
  profile: AccessibilityProfile;
  settings: AppSettings;
  role: DemoRole;
  myReportIds: string[];
}

const KEY = "suraksha-path-demo-v1";

const initial = (): State => ({
  shelters: structuredClone(sample.shelters),
  incidents: structuredClone(sample.incidents),
  alerts: structuredClone(sample.alerts),
  profile: { ...sample.defaultProfile },
  settings: { notifyRoad: true, notifyShelter: true, notifyReports: true, compactSidebar: false },
  role: "user",
  myReportIds: [],
});

interface Ctx extends State {
  hydrated: boolean;
  now: number;
  addReport: (r: Omit<Incident, "id" | "createdAt" | "status" | "history" | "source">) => Incident;
  setReportStatus: (id: string, status: ReportStatus, note?: string) => boolean;
  setAlertRead: (id: string, read: boolean) => void;
  markAllRead: () => void;
  setProfile: (p: AccessibilityProfile) => void;
  setSettings: (s: AppSettings) => void;
  setRole: (r: DemoRole) => void;
  reset: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(sample.DEMO_NOW);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial(), ...JSON.parse(raw) });
    } catch {
      /* corrupted storage: keep defaults */
    }
    setNow(Date.now());
    setHydrated(true);
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota exceeded (e.g. large image) */
    }
  }, [state, hydrated]);

  // Apply accessibility classes to <html>
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("a11y-large", state.profile.largeText);
    el.classList.toggle("a11y-contrast", state.profile.highContrast);
    el.classList.toggle("a11y-reduce-motion", state.profile.reduceMotion);
    el.lang = state.profile.language;
  }, [state.profile]);

  const addReport: Ctx["addReport"] = useCallback((r) => {
    const at = new Date().toISOString();
    const inc: Incident = {
      ...r,
      id: `u${Date.now()}`,
      createdAt: at,
      status: "pending",
      source: "user_report",
      history: [{ status: "pending", at, by: "You (demo user)" }],
    };
    setState((s) => ({ ...s, incidents: [inc, ...s.incidents], myReportIds: [inc.id, ...s.myReportIds] }));
    return inc;
  }, []);

  const setReportStatus: Ctx["setReportStatus"] = useCallback(
    (id, status, note) => {
      // Only demo administrators may change review status.
      if (state.role !== "admin") return false;
      const at = new Date().toISOString();
      setState((s) => ({
        ...s,
        incidents: s.incidents.map((i) =>
          i.id === id ? { ...i, status, history: [...i.history, { status, at, by: "Demo administrator", note }] } : i,
        ),
      }));
      return true;
    },
    [state.role],
  );

  const value: Ctx = useMemo(
    () => ({
      ...state,
      hydrated,
      now,
      addReport,
      setReportStatus,
      setAlertRead: (id, read) =>
        setState((s) => ({ ...s, alerts: s.alerts.map((a) => (a.id === id ? { ...a, read } : a)) })),
      markAllRead: () => setState((s) => ({ ...s, alerts: s.alerts.map((a) => ({ ...a, read: true })) })),
      setProfile: (profile) => setState((s) => ({ ...s, profile })),
      setSettings: (settings) => setState((s) => ({ ...s, settings })),
      setRole: (role) => setState((s) => ({ ...s, role })),
      reset: () => {
        localStorage.removeItem(KEY);
        setState(initial());
      },
    }),
    [state, hydrated, now, addReport, setReportStatus],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}
