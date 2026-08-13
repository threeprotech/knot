import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getIsAdmin, isAdminEmail } from "@/lib/admin";

const cards = [
  {
    href: "/admin/industries",
    title: "Industries",
    body: "Lookup list used on alumni profiles.",
  },
  {
    href: "/admin/skills",
    title: "Skills",
    body: "Technical, soft, and domain skills.",
  },
  {
    href: "/admin/events",
    title: "Events",
    body: "Public and member gatherings, plus Drive galleries.",
  },
  {
    href: "/admin/alerts",
    title: "Alerts",
    body: "Short notices on the homepage and directory.",
  },
];

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user?.id || "")
    .maybeSingle();

  const dbAdmin = profile?.role === "admin";
  const envAdmin = isAdminEmail(user?.email);
  const showPromoteHint = getIsAdmin(user, profile) && !dbAdmin && envAdmin;

  return (
    <div className="mt-8">
      <h1 className="font-display text-3xl tracking-tight text-ink">Master data</h1>
      <p className="mt-2 max-w-xl text-muted">
        Configure lookups, events, and alerts shown across Knot.
      </p>
      {showPromoteHint && (
        <div className="mt-6 rounded-xl border border-coral/30 bg-coral-soft/80 px-4 py-3 text-sm text-ink-soft">
          Your email is in <code className="font-medium">ADMIN_EMAILS</code>, so you can open this
          panel, but database writes still need{" "}
          <code className="font-medium">profiles.role = &apos;admin&apos;</code>. In the Supabase SQL
          editor run:
          <pre className="mt-2 overflow-x-auto rounded-lg bg-ink px-3 py-2 text-xs text-white">
            {`update public.profiles set role = 'admin' where email = '${user?.email || "you@email.com"}';`}
          </pre>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-line/80 bg-white/80 p-4 transition hover:border-coral/40 hover:shadow-sm"
          >
            <h2 className="font-display text-xl text-ink">{card.title}</h2>
            <p className="mt-1 text-sm text-muted">{card.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
