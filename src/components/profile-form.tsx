"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/avatar";
import { MAP_HEIGHT_PICKER, MapPlaceholder } from "@/components/map-shell";
import { geocodeLocation, reverseGeocode, type GeocodeResult } from "@/lib/geocode";
import type { Industry, ProfileFormData, Skill, SkillCategory } from "@/lib/types";

const LocationPickerMap = dynamic(() => import("@/components/location-picker-map"), {
  ssr: false,
  loading: () => (
    <div className={MAP_HEIGHT_PICKER}>
      <MapPlaceholder>Loading map…</MapPlaceholder>
    </div>
  ),
});

const LAST_CLASSES = ["VIII", "IX", "X", "XI", "XII"] as const;
const LAST_DIVISIONS = ["A", "B", "C", "D", "E", "F"] as const;

const CATEGORIES: SkillCategory[] = ["Technical", "Soft", "Domain"];

type Props = {
  mode: "onboarding" | "edit";
  initial: ProfileFormData;
  industries: Industry[];
  skills: Skill[];
};

export function ProfileForm({ mode, initial, industries, skills }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geocodeGen = useRef(0);
  const [form, setForm] = useState<ProfileFormData>(initial);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initial.avatar_url || null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const skillsByCategory = useMemo(() => {
    return CATEGORIES.map((category) => ({
      category,
      skills: skills.filter((s) => s.category === category),
    }));
  }, [skills]);

  function update<K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    };
  }, []);

  function onLocationTextChange(value: string) {
    update("location", value);
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);

    const trimmed = value.trim();
    if (trimmed.length < 2) return;

    const gen = ++geocodeGen.current;
    geocodeTimer.current = setTimeout(async () => {
      const coords = await geocodeLocation(trimmed);
      if (geocodeGen.current !== gen) return;
      if (!coords) return;
      setForm((prev) => {
        if (prev.location.trim() !== trimmed) return prev;
        return { ...prev, latitude: coords.latitude, longitude: coords.longitude };
      });
    }, 700);
  }

  function onPinChange(coords: GeocodeResult | null) {
    geocodeGen.current += 1;
    if (geocodeTimer.current) {
      clearTimeout(geocodeTimer.current);
      geocodeTimer.current = null;
    }

    setForm((prev) => {
      const next = {
        ...prev,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      };

      if (coords && !prev.location.trim()) {
        void reverseGeocode(coords.latitude, coords.longitude).then((name) => {
          if (!name) return;
          setForm((current) => (current.location.trim() ? current : { ...current, location: name }));
        });
      }

      return next;
    });
  }

  const pinPlaced = hasPin(form.latitude, form.longitude);

  function toggleSkill(id: string) {
    setForm((prev) => {
      const has = prev.skill_ids.includes(id);
      return {
        ...prev,
        skill_ids: has ? prev.skill_ids.filter((s) => s !== id) : [...prev.skill_ids, id],
      };
    });
  }

  function onAvatarChange(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar must be under 2MB.");
      return;
    }
    setError(null);
    setRemoveAvatar(false);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function clearAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    update("avatar_url", "");
    if (fileRef.current) fileRef.current.value = "";
  }

  function validateStep(current: number): string | null {
    if (current === 0) {
      if (!form.full_name.trim()) return "Full name is required.";
      if (!form.headline.trim()) return "Headline is required.";
    }
    if (current === 1) {
      if (!form.industry_id) return "Select a primary industry.";
      if (form.skill_ids.length === 0) return "Select at least one skill.";
    }
    return null;
  }

  async function resolveAvatarUrl(userId: string) {
    if (removeAvatar && !avatarFile) return null;
    if (!avatarFile) return form.avatar_url || null;

    const supabase = createClient();
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = mimeToExt[avatarFile.type] || "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
  }

  async function save() {
    setError(null);
    const stepError = validateStep(1) || validateStep(0);
    if (stepError) {
      setError(stepError);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in.");

      const avatar_url = await resolveAvatarUrl(user.id);
      const location = form.location.trim();
      const coords = await resolveCoordinates(form);

      const payload = {
        id: user.id,
        full_name: form.full_name.trim(),
        email: form.email.trim() || user.email || "",
        phone: form.phone.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        headline: form.headline.trim() || null,
        bio: form.bio.trim() || null,
        graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
        last_class: form.last_class.trim() || null,
        last_division: form.last_division.trim() || null,
        location: location || null,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        industry_id: form.industry_id || null,
        avatar_url,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(payload, { defaultToNull: false });
      if (profileError) throw profileError;

      const { error: deleteError } = await supabase
        .from("profile_skills")
        .delete()
        .eq("profile_id", user.id);
      if (deleteError) throw deleteError;

      if (form.skill_ids.length > 0) {
        const rows = form.skill_ids.map((skill_id) => ({
          profile_id: user.id,
          skill_id,
        }));
        const { error: skillsError } = await supabase.from("profile_skills").insert(rows);
        if (skillsError) throw skillsError;
      }

      router.push(mode === "onboarding" ? "/directory" : "/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "onboarding" && step < 2) {
      const err = validateStep(step);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      setStep((s) => s + 1);
      return;
    }
    await save();
  }

  const steps = ["Basics", "Skills", "Contact"];

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <div className="animate-fade-up">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-coral">
          {mode === "onboarding" ? "Complete your profile" : "Edit profile"}
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink">
          {mode === "onboarding" ? "Tell the network who you are" : "Update your alumni profile"}
        </h1>
        <p className="mt-2 text-muted">
          Map your industry and skills so others can find and connect with you.
        </p>
        {mode === "edit" && pinPlaced && (
          <p className="mt-3 text-sm text-ink-soft">
            You’re on the{" "}
            <Link href="/map" className="font-medium text-coral hover:text-coral-deep">
              alumni map
            </Link>
            .
          </p>
        )}
      </div>

      {mode === "onboarding" && (
        <ol className="mt-6 flex gap-2">
          {steps.map((label, i) => (
            <li
              key={label}
              className={`flex-1 rounded-full px-2 py-1.5 text-center text-xs font-semibold tracking-wide ${
                i === step
                  ? "bg-ink text-white"
                  : i < step
                    ? "bg-coral-soft text-coral-deep"
                    : "bg-mist-deep/70 text-muted"
              }`}
            >
              {label}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 animate-fade-in space-y-5" key={step}>
        {(mode === "edit" || step === 0) && (
          <section className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-line/80 bg-white/70 p-4">
              <Avatar name={form.full_name || "You"} src={avatarPreview} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-soft">Display picture</p>
                <p className="mt-0.5 text-xs text-muted">
                  {avatarPreview
                    ? "Update or remove your photo. Shown in the directory."
                    : "Add a photo, or initials will be used."}{" "}
                  JPG, PNG, or WebP · max 2MB
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => onAvatarChange(e.target.files?.[0] || null)}
                />
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-mist"
                  >
                    {avatarPreview ? "Change photo" : "Upload photo"}
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={clearAvatar}
                      className="rounded-md px-3 py-1.5 text-sm font-medium text-coral hover:bg-coral-soft"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <Field label="Full name" required>
              <input
                required
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                className={inputClass}
                autoComplete="name"
              />
            </Field>
            <Field label="Headline" required hint="One line about your role or focus">
              <input
                required
                value={form.headline}
                onChange={(e) => update("headline", e.target.value)}
                className={inputClass}
                placeholder="Product lead · fintech alumni mentor"
              />
            </Field>
            <div className="rounded-xl border border-line/80 bg-white/70 p-4">
              <p className="text-sm font-medium text-ink-soft">Last studied class</p>
              <p className="mt-0.5 text-xs text-muted">Shown as XI - C in the directory. Optional.</p>
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] gap-x-2 gap-y-1.5">
                <span className="text-sm font-medium text-ink-soft">Class</span>
                <span />
                <span className="text-sm font-medium text-ink-soft">Division</span>
                <select
                  value={form.last_class}
                  onChange={(e) => update("last_class", e.target.value)}
                  className={inputClass}
                  aria-label="Last studied class"
                >
                  <option value="">Select</option>
                  {LAST_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <span className="self-center text-center font-display text-xl text-muted" aria-hidden>
                  –
                </span>
                <select
                  value={form.last_division}
                  onChange={(e) => update("last_division", e.target.value)}
                  className={inputClass}
                  aria-label="Last studied division"
                >
                  <option value="">Select</option>
                  {LAST_DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Field label="Bio">
              <textarea
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                className={`${inputClass} min-h-28 resize-y`}
                placeholder="Share your path, interests, and how you’d like to connect."
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Graduation year">
                <input
                  type="number"
                  min={1950}
                  max={2035}
                  value={form.graduation_year}
                  onChange={(e) => update("graduation_year", e.target.value)}
                  className={inputClass}
                  placeholder="2018"
                />
              </Field>
              <Field label="Location" hint="Places you on the alumni map">
                <input
                  value={form.location}
                  onChange={(e) => onLocationTextChange(e.target.value)}
                  className={inputClass}
                  placeholder="Bengaluru, IN"
                />
              </Field>
            </div>
            <div>
              <p className="mb-2 text-xs text-muted">Click the map to mark your location.</p>
              <LocationPickerMap
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={onPinChange}
              />
              {pinPlaced && (
                <button
                  type="button"
                  onClick={() => onPinChange(null)}
                  className="mt-2 text-sm font-medium text-coral hover:text-coral-deep"
                >
                  Remove pin
                </button>
              )}
            </div>
          </section>
        )}

        {(mode === "edit" || step === 1) && (
          <section className="space-y-5">
            <Field label="Primary industry" required>
              <select
                required
                value={form.industry_id}
                onChange={(e) => update("industry_id", e.target.value)}
                className={inputClass}
              >
                <option value="">Select industry</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </Field>

            <div>
              <p className="mb-3 text-sm font-medium text-ink-soft">
                Skills <span className="text-coral">*</span>
              </p>
              <div className="space-y-5">
                {skillsByCategory.map(({ category, skills: catSkills }) => (
                  <div key={category}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {catSkills.map((skill) => {
                        const active = form.skill_ids.includes(skill.id);
                        return (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => toggleSkill(skill.id)}
                            className={`rounded-md border px-3 py-1.5 text-sm transition ${
                              active
                                ? "border-coral bg-coral-soft text-coral-deep"
                                : "border-line bg-white text-ink-soft hover:border-mist-deep"
                            }`}
                          >
                            {skill.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {(mode === "edit" || step === 2) && (
          <section className="space-y-4">
            <Field label="Email" hint="From your account">
              <input value={form.email} readOnly className={`${inputClass} bg-mist-deep/40 text-muted`} />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputClass}
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
            </Field>
            <Field label="LinkedIn URL">
              <input
                type="url"
                value={form.linkedin_url}
                onChange={(e) => update("linkedin_url", e.target.value)}
                className={inputClass}
                placeholder="https://linkedin.com/in/you"
              />
            </Field>
          </section>
        )}
      </div>

      {error && (
        <p className="mt-5 rounded-lg bg-coral-soft px-3 py-2 text-sm text-coral-deep" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {mode === "onboarding" && step > 0 && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep((s) => s - 1);
            }}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-mist"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-coral px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-deep disabled:opacity-60"
        >
          {loading
            ? "Saving…"
            : mode === "onboarding" && step < 2
              ? "Continue"
              : "Save profile"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  required,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2 text-sm font-medium text-ink-soft">
        {label}
        {required && <span className="text-coral">*</span>}
        {hint && <span className="font-normal text-muted">· {hint}</span>}
      </span>
      {children}
    </label>
  );
}

function hasPin(latitude: number | null, longitude: number | null): boolean {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

async function resolveCoordinates(form: ProfileFormData): Promise<GeocodeResult | null> {
  if (hasPin(form.latitude, form.longitude)) {
    return { latitude: form.latitude as number, longitude: form.longitude as number };
  }

  const location = form.location.trim();
  if (!location) return null;

  return geocodeLocation(location);
}

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-ink outline-none ring-coral/30 transition focus:border-coral focus:ring-2";
