import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Notice, PageHeader } from "@/components/common";
import { useStore } from "@/services/store";
import { sampleProfiles } from "@/data/sample";
import { needLabel } from "@/utils/labels";
import type { AccessNeed, AccessibilityProfile } from "@/types";

export const Route = createFileRoute("/_dash/profile")({
  head: () => ({
    meta: [
      { title: "My Accessibility Profile — SURAKSHA PATH" },
      { name: "description", content: "Optional accessibility preferences used to personalise route suggestions." },
      { property: "og:title", content: "Accessibility Profile — SURAKSHA PATH" },
      { property: "og:description", content: "Set mobility, vision, language and display preferences." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { profile, setProfile, hydrated } = useStore();
  const [p, setP] = useState<AccessibilityProfile>(profile);
  const [phoneErr, setPhoneErr] = useState("");
  useEffect(() => { if (hydrated) setP(profile); }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleNeed = (n: AccessNeed) => setP({ ...p, needs: p.needs.includes(n) ? p.needs.filter((x) => x !== n) : [...p.needs, n] });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (p.emergencyContactPhone && !/^[+\d][\d\s-]{6,}$/.test(p.emergencyContactPhone)) {
      setPhoneErr("Enter a valid phone number or leave it blank.");
      return;
    }
    setPhoneErr("");
    setProfile(p);
    toast.success("Profile saved on this device.");
  };

  const sw = (k: "largeText" | "highContrast" | "reduceMotion" | "voiceGuidance", label: string, hint: string) => (
    <div className="flex items-center justify-between gap-4 py-2">
      <div><Label htmlFor={k}>{label}</Label><p className="text-xs text-muted-foreground">{hint}</p></div>
      <Switch id={k} checked={p[k]} onCheckedChange={(v) => setP({ ...p, [k]: v })} />
    </div>
  );

  return (
    <>
      <PageHeader title="My Accessibility Profile" desc="Everything here is optional. You never need to share a disability to browse safety information." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Load a sample profile:</span>
        {sampleProfiles.map((sp) => <Button key={sp.name} size="sm" variant="outline" onClick={() => setP({ ...sp })}>{sp.name}</Button>)}
      </div>
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface space-y-4 p-5">
          <div>
            <Label htmlFor="pname">Display name (optional)</Label>
            <input id="pname" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3" />
          </div>
          <fieldset>
            <legend className="text-sm font-medium">Mobility and vision needs</legend>
            <div className="mt-2 space-y-2">
              {(Object.keys(needLabel) as AccessNeed[]).map((n) => (
                <div key={n} className="flex min-h-9 items-center gap-2">
                  <Checkbox id={`pn-${n}`} checked={p.needs.includes(n)} onCheckedChange={() => toggleNeed(n)} />
                  <Label htmlFor={`pn-${n}`}>{needLabel[n]}</Label>
                </div>
              ))}
            </div>
          </fieldset>
          <div>
            <Label htmlFor="lang">Preferred language</Label>
            <select id="lang" value={p.language} onChange={(e) => setP({ ...p, language: e.target.value as "en" | "hi" })} className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-2">
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi) — navigation & key labels</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">Hindi currently covers menus and key safety messages; other content remains in English.</p>
          </div>
        </section>
        <section className="card-surface space-y-2 p-5">
          <h2 className="font-semibold">Display</h2>
          <div className="divide-y divide-border">
            {sw("largeText", "Large text", "Increases text size across the app.")}
            {sw("highContrast", "High contrast", "Stronger colours and borders.")}
            {sw("reduceMotion", "Reduce animation", "Turns off transitions and smooth scrolling.")}
            {sw("voiceGuidance", "Voice guidance preference", "Saved for future use — spoken guidance is not yet implemented.")}
          </div>
          <h2 className="pt-4 font-semibold">Emergency contact (optional)</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label htmlFor="ecn">Name</Label><input id="ecn" value={p.emergencyContactName} onChange={(e) => setP({ ...p, emergencyContactName: e.target.value })} className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3" /></div>
            <div>
              <Label htmlFor="ecp">Phone</Label>
              <input id="ecp" type="tel" value={p.emergencyContactPhone} aria-invalid={!!phoneErr} aria-describedby="ecp-err" onChange={(e) => setP({ ...p, emergencyContactPhone: e.target.value })} className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3" />
              {phoneErr && <p id="ecp-err" className="mt-1 text-sm text-danger">{phoneErr}</p>}
            </div>
          </div>
          <Notice>Saved only in this browser. Nothing is sent to a server.</Notice>
          <Button type="submit" size="lg" className="w-full">Save profile</Button>
        </section>
      </form>
    </>
  );
}
