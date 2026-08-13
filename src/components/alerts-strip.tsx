import Link from "next/link";
import type { Alert } from "@/lib/types";

export function AlertsStrip({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const inner = (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-coral">Alert</p>
            <p className="mt-1 font-medium text-ink">{alert.title}</p>
            {alert.body && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{alert.body}</p>}
            {alert.link_url && (
              <span className="mt-1 inline-block text-sm font-medium text-coral">Open link →</span>
            )}
          </>
        );

        const className =
          "block rounded-xl border border-coral/20 bg-coral-soft/70 px-4 py-3 transition hover:border-coral/40";

        if (alert.link_url) {
          const external = /^https?:\/\//i.test(alert.link_url);
          return external ? (
            <a
              key={alert.id}
              href={alert.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {inner}
            </a>
          ) : (
            <Link key={alert.id} href={alert.link_url} className={className}>
              {inner}
            </Link>
          );
        }

        return (
          <div key={alert.id} className={className}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
