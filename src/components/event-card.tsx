import Link from "next/link";
import { formatEventWhen } from "@/lib/datetime";
import type { AlumniEvent } from "@/lib/types";

export function EventCard({ event }: { event: AlumniEvent }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group block rounded-xl border border-line/80 bg-white/80 p-4 transition hover:border-coral/40 hover:shadow-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-coral">
        {formatEventWhen(event.starts_at, event.ends_at)}
      </p>
      <h3 className="mt-1.5 font-display text-xl tracking-tight text-ink group-hover:text-coral">
        {event.title}
      </h3>
      {event.location && <p className="mt-1 text-sm text-muted">{event.location}</p>}
      {event.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{event.description}</p>
      )}
      {event.visibility === "members" && (
        <p className="mt-2 text-xs font-medium text-muted">Members</p>
      )}
    </Link>
  );
}
