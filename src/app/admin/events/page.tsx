import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatEventWhen } from "@/lib/datetime";
import { isExpired } from "@/lib/feed";
import type { AlumniEvent } from "@/lib/types";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").order("starts_at", { ascending: false });
  const events = (data as AlumniEvent[]) || [];

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-tight text-ink">Events</h1>
          <p className="mt-1 text-sm text-muted">Including expired items, hidden from public feeds.</p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-lg bg-coral px-4 py-2.5 text-sm font-semibold text-white hover:bg-coral-deep"
        >
          New event
        </Link>
      </div>

      <ul className="mt-6 divide-y divide-line/80 rounded-xl border border-line/80 bg-white/70">
        {events.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-muted">No events yet.</li>
        )}
        {events.map((event) => {
          const expired = isExpired(event.ends_at);
          return (
            <li key={event.id}>
              <Link
                href={`/admin/events/${event.id}`}
                className="flex flex-col gap-1 px-4 py-3 hover:bg-mist/80 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-ink">{event.title}</p>
                  <p className="text-sm text-muted">{formatEventWhen(event.starts_at, event.ends_at)}</p>
                </div>
                <div className="flex gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted">
                  <span>{event.visibility}</span>
                  {expired && <span className="text-coral">Expired</span>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
