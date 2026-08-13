import Link from "next/link";
import { AlertsStrip } from "@/components/alerts-strip";
import { EventCard } from "@/components/event-card";
import type { Alert, AlumniEvent } from "@/lib/types";

export function PublicHomeFeed({
  alerts,
  events,
}: {
  alerts: Alert[];
  events: AlumniEvent[];
}) {
  if (alerts.length === 0 && events.length === 0) return null;

  return (
    <section className="border-t border-line/70 bg-surface">
      <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        {alerts.length > 0 && (
          <div className="animate-fade-up">
            <AlertsStrip alerts={alerts} />
          </div>
        )}

        {events.length > 0 && (
          <div className={alerts.length > 0 ? "mt-10" : undefined}>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-coral">Upcoming</p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-ink">Events</h2>
            <p className="mt-2 max-w-lg text-muted">
              Gatherings, showcases, and moments for the Knot network.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {events.map((event, index) => (
                <li
                  key={event.id}
                  className="animate-stagger"
                  style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
                >
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">
              Want the full calendar?{" "}
              <Link href="/auth/sign-in?next=/events" className="font-medium text-coral hover:text-coral-deep">
                Sign in
              </Link>{" "}
              to see member events too.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
