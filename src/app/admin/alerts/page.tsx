import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatEventWhen } from "@/lib/datetime";
import { isExpired } from "@/lib/feed";
import type { Alert } from "@/lib/types";

export default async function AdminAlertsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("alerts").select("*").order("starts_at", { ascending: false });
  const alerts = (data as Alert[]) || [];

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-tight text-ink">Alerts</h1>
          <p className="mt-1 text-sm text-muted">Notices on the homepage, directory, and events feed.</p>
        </div>
        <Link
          href="/admin/alerts/new"
          className="rounded-lg bg-coral px-4 py-2.5 text-sm font-semibold text-white hover:bg-coral-deep"
        >
          New alert
        </Link>
      </div>

      <ul className="mt-6 divide-y divide-line/80 rounded-xl border border-line/80 bg-white/70">
        {alerts.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-muted">No alerts yet.</li>
        )}
        {alerts.map((alert) => {
          const expired = isExpired(alert.ends_at);
          return (
            <li key={alert.id}>
              <Link
                href={`/admin/alerts/${alert.id}`}
                className="flex flex-col gap-1 px-4 py-3 hover:bg-mist/80 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-ink">{alert.title}</p>
                  <p className="text-sm text-muted">{formatEventWhen(alert.starts_at, alert.ends_at)}</p>
                </div>
                <div className="flex gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted">
                  <span>{alert.visibility}</span>
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
