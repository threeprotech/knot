"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field, inputClass } from "@/components/form-field";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/datetime";
import type { AlumniEvent, Visibility } from "@/lib/types";

type Props = {
  event?: AlumniEvent | null;
};

export function EventForm({ event }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [startsAt, setStartsAt] = useState(toDatetimeLocalValue(event?.starts_at));
  const [endsAt, setEndsAt] = useState(toDatetimeLocalValue(event?.ends_at));
  const [visibility, setVisibility] = useState<Visibility>(event?.visibility ?? "public");
  const [driveUrl, setDriveUrl] = useState(event?.drive_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const starts = fromDatetimeLocalValue(startsAt);
    if (!title.trim() || !starts) {
      setError("Title and start time are required.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      starts_at: starts,
      ends_at: fromDatetimeLocalValue(endsAt),
      visibility,
      drive_url: driveUrl.trim() || null,
      created_by: event?.created_by ?? user?.id ?? null,
    };

    try {
      if (event) {
        const { error: updateError } = await supabase.from("events").update(payload).eq("id", event.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("events").insert(payload);
        if (insertError) throw insertError;
      }
      router.push("/admin/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save event.");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!event) return;
    if (!confirm(`Delete “${event.title}”?`)) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("events").delete().eq("id", event.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-xl space-y-4">
      <Field label="Title" required>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
      </Field>
      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} min-h-28 resize-y`}
        />
      </Field>
      <Field label="Location">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClass}
          placeholder="Campus hall / Zoom"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Starts" required>
          <input
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Ends">
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Visibility" required>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
          className={inputClass}
        >
          <option value="public">Public — landing page</option>
          <option value="members">Members only</option>
        </select>
      </Field>
      <Field
        label="Google Drive URL"
        hint="Folder or file. Must be “anyone with the link” to embed."
      >
        <input
          type="url"
          value={driveUrl}
          onChange={(e) => setDriveUrl(e.target.value)}
          className={inputClass}
          placeholder="https://drive.google.com/drive/folders/…"
        />
      </Field>

      {error && (
        <p className="rounded-lg bg-coral-soft px-3 py-2 text-sm text-coral-deep" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-coral px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-deep disabled:opacity-60"
        >
          {loading ? "Saving…" : event ? "Save event" : "Create event"}
        </button>
        {event && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-coral hover:bg-coral-soft"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
