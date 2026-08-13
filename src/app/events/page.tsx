import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AlertsStrip } from "@/components/alerts-strip";
import { EventCard } from "@/components/event-card";
import { isActiveAlert, isUpcomingOrActiveEvent, sortAlertsByStart, sortEventsByStart } from "@/lib/feed";
import type { Alert, AlumniEvent } from "@/lib/types";

export default async function EventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in?next=/events");

  const [{ data: eventRows }, { data: alertRows }] = await Promise.all([
    supabase.from("events").select("*").order("starts_at"),
    supabase.from("alerts").select("*").order("starts_at", { ascending: false }),
  ]);

  const events = sortEventsByStart(
    ((eventRows as AlumniEvent[]) || []).filter((event) => isUpcomingOrActiveEvent(event)),
  );
  const alerts = sortAlertsByStart(((alertRows as Alert[]) || []).filter((alert) => isActiveAlert(alert)));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="animate-fade-up">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-coral">Members</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">Events</h1>
        <p className="mt-2 max-w-xl text-muted">
          Public and member-only gatherings, plus current notices.
        </p>
      </div>

      {alerts.length > 0 && (
        <div className="mt-8 animate-fade-up">
          <AlertsStrip alerts={alerts} />
        </div>
      )}

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {events.length === 0 && (
          <li className="col-span-full rounded-xl border border-dashed border-line py-12 text-center text-muted">
            No upcoming events right now. Check back soon.
          </li>
        )}
        {events.map((event, index) => (
          <li
            key={event.id}
            className="animate-stagger"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <EventCard event={event} />
          </li>
        ))}
      </ul>
    </div>
  );
}
