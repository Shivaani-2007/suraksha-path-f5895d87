import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/common";
import { useStore } from "@/services/store";
import type { AppSettings } from "@/types";

export const Route = createFileRoute("/_dash/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SURAKSHA PATH" },
      { name: "description", content: "Appearance, language, notification and demo data settings." },
      { property: "og:title", content: "Settings — SURAKSHA PATH" },
      { property: "og:description", content: "Manage preferences and reset the demo dataset." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, setSettings, profile, setProfile, reset, role } = useStore();
  const s = (k: keyof AppSettings, label: string) => (
    <div className="flex items-center justify-between py-3">
      <Label htmlFor={k}>{label}</Label>
      <Switch id={k} checked={settings[k]} onCheckedChange={(v) => setSettings({ ...settings, [k]: v })} />
    </div>
  );
  const ps = (k: "largeText" | "highContrast" | "reduceMotion", label: string) => (
    <div className="flex items-center justify-between py-3">
      <Label htmlFor={`s-${k}`}>{label}</Label>
      <Switch id={`s-${k}`} checked={profile[k]} onCheckedChange={(v) => setProfile({ ...profile, [k]: v })} />
    </div>
  );

  return (
    <>
      <PageHeader title="Settings" desc="Changes apply immediately and are saved in this browser." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface p-5">
          <h2 className="font-semibold">Appearance & accessibility</h2>
          <div className="divide-y divide-border">
            {s("compactSidebar", "Collapsed sidebar")}
            {ps("largeText", "Large text")}
            {ps("highContrast", "High contrast")}
            {ps("reduceMotion", "Reduce animation")}
          </div>
          <Label htmlFor="slang" className="mt-3 block">Language</Label>
          <select id="slang" value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value as "en" | "hi" })} className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-2">
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi, partial)</option>
          </select>
          <Link to="/profile" className="mt-3 inline-block text-sm text-primary hover:underline">More in Accessibility Profile →</Link>
        </section>
        <section className="card-surface p-5">
          <h2 className="font-semibold">Notifications</h2>
          <div className="divide-y divide-border">
            {s("notifyRoad", "Road and route condition alerts")}
            {s("notifyShelter", "Shelter updates")}
            {s("notifyReports", "Report review updates")}
          </div>
        </section>
        <section className="card-surface p-5">
          <h2 className="font-semibold">Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Secure sign-in is not configured in this prototype. You are using demo mode as a <strong>{role === "admin" ? "demo administrator" : "community user"}</strong>; switch roles from the profile menu.
          </p>
        </section>
        <section className="card-surface p-5">
          <h2 className="font-semibold">Demo data</h2>
          <p className="mt-2 text-sm text-muted-foreground">Restore the original sample shelters, incidents, alerts and profile. Your reports will be removed.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive" className="mt-3"><RotateCcw /> Reset demo data</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
                <AlertDialogDescription>This removes your reports, read states and preferences on this device.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { reset(); toast.success("Demo data restored."); }}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
        <section className="card-surface p-5 lg:col-span-2">
          <h2 className="font-semibold">Privacy</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            All data stays in your browser's local storage. No accounts, tracking or server storage are used. Map tiles are loaded from OpenStreetMap, which can see your IP address.
            {" "}<Link to="/about" className="text-primary hover:underline">About the project</Link>
          </p>
        </section>
      </div>
    </>
  );
}
