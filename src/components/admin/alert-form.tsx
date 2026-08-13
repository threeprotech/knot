"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field, inputClass } from "@/components/form-field";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/datetime";
import type { Alert, Visibility } from "@/lib/types";

type Props = {
  alert?: Alert | null;
};

export function AlertForm({ alert }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(alert?.title ?? "");
  const [body, setBody] = useState(alert?.body ?? "");
  const [linkUrl, setLinkUrl] = useState(alert?.link_url ?? "");
  const [startsAt, setStartsAt] = useState(
    toDatetimeLocalValue(alert?.starts_at) || toDatetimeLocalValue(new Date().toISOString()),
  );
  const [endsAt, setEndsAt] = useState(toDatetimeLocalValue(alert?.ends_at));
  const [visibility, setVisibility] = useState<Visibility>(alert?.visibility ?? "public");
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
      body: body.trim() || null,
      link_url: linkUrl.trim() || null,
      starts_at: starts,
      ends_at: fromDatetimeLocalValue(endsAt),
      visibility,
      created_by: alert?.created_by ?? user?.id ?? null,
    };

    try {
      if (alert) {
        const { error: updateError } = await supabase.from("alerts").update(payload).eq("id", alert.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("alerts").insert(payload);
        if (insertError) throw insertError;
      }
      router.push("/admin/alerts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save alert.");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!alert) return;
    if (!confirm(`Delete “${alert.title}”?`)) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("alerts").delete().eq("id", alert.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    router.push("/admin/alerts");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-xl space-y-4">
      <Field label="Title" required>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
      </Field>
      <Field label="Body">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${inputClass} min-h-24 resize-y`}
          placeholder="Short notice for alumni"
        />
      </Field>
      <Field label="Link URL">
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className={inputClass}
          placeholder="https://…"
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
          {loading ? "Saving…" : alert ? "Save alert" : "Create alert"}
        </button>
        {alert && (
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
