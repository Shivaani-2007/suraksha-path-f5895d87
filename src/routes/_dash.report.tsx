import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Notice, PageHeader } from "@/components/common";
import { MapView } from "@/components/map/MapView";
import { useStore } from "@/services/store";
import { MAP_CENTER, places } from "@/data/sample";
import { categoryLabel } from "@/utils/labels";
import type { IncidentCategory, MarkerKind, Severity } from "@/types";

export const Route = createFileRoute("/_dash/report")({
  validateSearch: z.object({ shelter: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Report an Issue — SURAKSHA PATH" },
      { name: "description", content: "Report blocked roads, flooded paths and shelter accessibility issues." },
      { property: "og:title", content: "Report an Issue — SURAKSHA PATH" },
      { property: "og:description", content: "Community and volunteer reporting for changing conditions." },
    ],
  }),
  component: ReportPage,
});

const ROLES = ["Resident", "Volunteer", "Caregiver", "Shelter staff", "Other"];

function ReportPage() {
  const { shelter: shelterId } = Route.useSearch();
  const { shelters, addReport } = useStore();
  const navigate = useNavigate();
  const preShelter = shelters.find((s) => s.id === shelterId);
  const [category, setCategory] = useState<IncidentCategory | "">(preShelter ? "shelter_accessibility" : "");
  const [loc, setLoc] = useState<[number, number] | null>(preShelter ? [preShelter.lat, preShelter.lng] : null);
  const [area, setArea] = useState(preShelter ? preShelter.name : "");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [role, setRole] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [imgMsg, setImgMsg] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"category" | "loc" | "description" | "role", string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const onImage = (file?: File) => {
    setImage(undefined);
    setImgMsg("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setImgMsg("Please choose an image file.");
    if (file.size > 400_000) return setImgMsg("Image is larger than 400 KB — you can submit without it in this demo.");
    const r = new FileReader();
    r.onload = () => setImage(String(r.result));
    r.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<Record<"category" | "loc" | "description" | "role", string>> = {};
    if (!category) errs.category = "Choose a category.";
    if (!loc) errs.loc = "Pick a location on the map or from the list.";
    if (description.trim().length < 10) errs.description = "Describe the issue in at least 10 characters.";
    if (!role) errs.role = "Select your role.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    const kind: MarkerKind = category === "blocked_road" ? "blocked" : "hazard";
    addReport({
      category: category as IncidentCategory, kind, title: `${categoryLabel[category as IncidentCategory]}${area ? ` — ${area}` : ""}`,
      area: area || "Unnamed location", lat: loc![0], lng: loc![1], description: description.trim(), severity, reporterRole: role, image,
      shelterId: preShelter?.id,
    });
    toast.success("Report submitted — marked unverified until reviewed.");
    navigate({ to: "/reports" });
  };

  const err = (k: "category" | "loc" | "description" | "role") => errors[k] && <p id={`${k}-err`} className="mt-1 text-sm text-danger">{errors[k]}</p>;

  return (
    <>
      <PageHeader title="Report an Issue" desc="Help others by reporting changing conditions. Reports are unverified until a reviewer checks them." actions={<Button asChild variant="outline"><Link to="/reports">Report history</Link></Button>} />
      <div className="mb-4"><Notice tone="warning">If anyone is in danger right now, call 112. This demo stores reports only in your browser — they are not sent to any authority.</Notice></div>
      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface space-y-4 p-5">
          <div>
            <Label htmlFor="cat">Incident category *</Label>
            <select id="cat" value={category} aria-invalid={!!errors.category} aria-describedby="category-err" onChange={(e) => setCategory(e.target.value as IncidentCategory)} className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-2">
              <option value="">Select…</option>
              {(Object.keys(categoryLabel) as IncidentCategory[]).map((c) => <option key={c} value={c}>{categoryLabel[c]}</option>)}
            </select>
            {err("category")}
          </div>
          <div>
            <Label htmlFor="area">Location name</Label>
            <input id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Market Lane near the tea stall" className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3" />
          </div>
          <div>
            <Label htmlFor="desc">Description *</Label>
            <Textarea id="desc" value={description} aria-invalid={!!errors.description} aria-describedby="description-err" onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1" placeholder="What did you see? Is it passable?" />
            {err("description")}
          </div>
          <fieldset>
            <legend className="text-sm font-medium">Severity</legend>
            <div className="mt-2 flex gap-2">
              {(["low", "medium", "high"] as Severity[]).map((s) => (
                <Button key={s} type="button" variant={severity === s ? "default" : "outline"} aria-pressed={severity === s} onClick={() => setSeverity(s)} className="flex-1 capitalize">{s}</Button>
              ))}
            </div>
          </fieldset>
          <div>
            <Label htmlFor="role">Your role *</Label>
            <select id="role" value={role} aria-invalid={!!errors.role} aria-describedby="role-err" onChange={(e) => setRole(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-2">
              <option value="">Select…</option>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            {err("role")}
          </div>
          <div>
            <Label htmlFor="img">Photo (optional)</Label>
            <input id="img" type="file" accept="image/*" onChange={(e) => onImage(e.target.files?.[0])} className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2" />
            {imgMsg && <p className="mt-1 text-sm text-warning-foreground">{imgMsg}</p>}
            {image && <img src={image} alt="Preview of attached photo" className="mt-2 h-24 rounded-lg object-cover" />}
          </div>
          <p className="text-xs text-muted-foreground">Submission time is recorded automatically.</p>
        </div>
        <div className="card-surface space-y-3 p-5">
          <Label htmlFor="quick-loc">Location *</Label>
          <select id="quick-loc" value="" onChange={(e) => { const p = places.find((x) => x.id === e.target.value); if (p) { setLoc([p.lat, p.lng]); if (!area) setArea(p.name); } }} className="h-11 w-full rounded-lg border border-input bg-background px-2">
            <option value="">Pick a sample place, or click the map…</option>
            {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <MapView center={loc ?? MAP_CENTER} markers={loc ? [{ id: "new", kind: "hazard", lat: loc[0], lng: loc[1], label: "Reported location", glyph: "!" }] : []} onMapClick={setLoc} height={340} />
          <p className="text-sm" aria-live="polite">{loc ? `Selected: ${loc[0].toFixed(4)}, ${loc[1].toFixed(4)}` : "No location selected yet."}</p>
          {err("loc")}
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>{submitting ? "Submitting…" : "Submit report"}</Button>
        </div>
      </form>
    </>
  );
}
