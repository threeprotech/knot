import Link from "next/link";
import type { ReactNode } from "react";
import { AlertsStrip } from "@/components/alerts-strip";
import { EventCard } from "@/components/event-card";
import type { Alert, AlumniEvent } from "@/lib/types";

function HomeFeedTab({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "coral" | "ink";
  children: ReactNode;
}) {
  return (
    <section>
      <h2
        className={`relative z-10 w-full rounded-t-md px-4 py-3 font-display text-lg tracking-tight text-white sm:w-fit sm:px-5 sm:text-xl ${
          tone === "coral" ? "bg-coral" : "bg-ink"
        }`}
      >
        {title}
      </h2>
      <div className="relative -mt-px rounded-b-xl border-x border-b border-line/70 bg-white p-4 sm:rounded-tr-xl sm:border-t sm:p-5">
        {children}
      </div>
    </section>
  );
}

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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-12 sm:px-8 sm:py-16">
        {alerts.length > 0 && (
          <div className="animate-fade-up">
            <HomeFeedTab title="Alerts" tone="coral">
              <AlertsStrip alerts={alerts} showLabel={false} />
            </HomeFeedTab>
          </div>
        )}

        {events.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: alerts.length > 0 ? "80ms" : undefined }}>
            <HomeFeedTab title="Upcoming events" tone="ink">
              <ul className="grid gap-3 sm:grid-cols-2">
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
              <p className="mt-5 text-sm text-muted">
                Want the full calendar?{" "}
                <Link href="/auth/sign-in?next=/events" className="font-medium text-coral hover:text-coral-deep">
                  Sign in
                </Link>{" "}
                to see member events too.
              </p>
            </HomeFeedTab>
          </div>
        )}
      </div>
    </section>
  );
}
