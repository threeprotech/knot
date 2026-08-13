import type { Alert, AlumniEvent } from "@/lib/types";

export function isExpired(endsAt: string | null, now = Date.now()): boolean {
  if (!endsAt) return false;
  const end = new Date(endsAt).getTime();
  return !Number.isNaN(end) && end <= now;
}

export function isActiveWindow(startsAt: string, endsAt: string | null, now = Date.now()): boolean {
  const start = new Date(startsAt).getTime();
  if (Number.isNaN(start) || start > now) return false;
  if (!endsAt) return true;
  const end = new Date(endsAt).getTime();
  if (Number.isNaN(end)) return false;
  return end > now;
}

export function isUpcomingOrActiveEvent(
  event: Pick<AlumniEvent, "starts_at" | "ends_at">,
  now = Date.now(),
): boolean {
  if (event.ends_at) {
    const end = new Date(event.ends_at).getTime();
    if (!Number.isNaN(end) && end <= now) return false;
  }
  const start = new Date(event.starts_at).getTime();
  if (Number.isNaN(start)) return false;
  if (event.ends_at) return true;
  return start >= now;
}

export function isActiveAlert(alert: Pick<Alert, "starts_at" | "ends_at">, now = Date.now()): boolean {
  return isActiveWindow(alert.starts_at, alert.ends_at, now);
}

export function sortEventsByStart<T extends Pick<AlumniEvent, "starts_at">>(events: T[]): T[] {
  return [...events].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );
}

export function sortAlertsByStart<T extends Pick<Alert, "starts_at">>(alerts: T[]): T[] {
  return [...alerts].sort(
    (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime(),
  );
}
