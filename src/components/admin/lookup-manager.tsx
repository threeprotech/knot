"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field, inputClass } from "@/components/form-field";
import type { Industry, Skill, SkillCategory } from "@/lib/types";

const CATEGORIES: SkillCategory[] = ["Technical", "Soft", "Domain"];

type IndustryRow = Industry;
type SkillRow = Skill;

type Props =
  | { kind: "industries"; items: IndustryRow[] }
  | { kind: "skills"; items: SkillRow[] };

export function LookupManager(props: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<SkillCategory>("Technical");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const table = props.kind;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (props.kind === "skills") {
        const payload = { name: trimmed, category };
        if (editingId) {
          const { error: updateError } = await supabase.from("skills").update(payload).eq("id", editingId);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase.from("skills").insert(payload);
          if (insertError) throw insertError;
        }
      } else {
        const payload = { name: trimmed };
        if (editingId) {
          const { error: updateError } = await supabase
            .from("industries")
            .update(payload)
            .eq("id", editingId);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase.from("industries").insert(payload);
          if (insertError) throw insertError;
        }
      }
      setName("");
      setCategory("Technical");
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string, label: string) {
    if (!confirm(`Delete “${label}”? This cannot be undone.`)) return;
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from(table).delete().eq("id", id);
    if (deleteError) {
      setError(
        deleteError.message.includes("foreign key")
          ? "This item is still used on alumni profiles, so it can’t be deleted."
          : deleteError.message,
      );
      return;
    }
    if (editingId === id) {
      setEditingId(null);
      setName("");
    }
    router.refresh();
  }

  function startEdit(item: IndustryRow | SkillRow) {
    setEditingId(item.id);
    setName(item.name);
    if ("category" in item) setCategory(item.category);
    setError(null);
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,20rem)_1fr]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-line/80 bg-white/80 p-4">
        <p className="text-sm font-medium text-ink">
          {editingId ? "Edit" : "Add"} {props.kind === "skills" ? "skill" : "industry"}
        </p>
        <Field label="Name" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder={props.kind === "skills" ? "Product strategy" : "Climate tech"}
          />
        </Field>
        {props.kind === "skills" && (
          <Field label="Category" required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SkillCategory)}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        )}
        {error && (
          <p className="rounded-lg bg-coral-soft px-3 py-2 text-sm text-coral-deep" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-coral px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-deep disabled:opacity-60"
          >
            {loading ? "Saving…" : editingId ? "Save changes" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName("");
                setCategory("Technical");
                setError(null);
              }}
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-mist"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="divide-y divide-line/80 rounded-xl border border-line/80 bg-white/70">
        {props.items.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-muted">Nothing here yet.</li>
        )}
        {props.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-medium text-ink">{item.name}</p>
              {"category" in item && (
                <p className="text-xs uppercase tracking-[0.12em] text-muted">{item.category}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => startEdit(item)}
                className="rounded-md px-2.5 py-1 text-sm font-medium text-ink-soft hover:bg-mist"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id, item.name)}
                className="rounded-md px-2.5 py-1 text-sm font-medium text-coral hover:bg-coral-soft"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
