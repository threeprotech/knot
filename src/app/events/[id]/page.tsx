import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DriveEmbed } from "@/components/drive-embed";
import { formatEventWhen } from "@/lib/datetime";
import type { AlumniEvent } from "@/lib/types";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();

  if (!data) {
    if (!user) {
      redirect(`/auth/sign-in?next=/events/${id}`);
    }
    notFound();
  }

  const event = data as AlumniEvent;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href={user ? "/events" : "/"} className="text-sm font-medium text-muted transition hover:text-coral">
        {user ? "← All events" : "← Home"}
      </Link>

      <header className="mt-6 animate-fade-up">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-coral">
          {formatEventWhen(event.starts_at, event.ends_at)}
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">{event.title}</h1>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {event.location && <span>{event.location}</span>}
          {event.visibility === "members" && <span>Members</span>}
        </div>
      </header>

      {event.description && (
        <p className="mt-6 whitespace-pre-wrap leading-relaxed text-ink-soft">{event.description}</p>
      )}

      {event.drive_url && (
        <section className="mt-8 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Photos & video</h2>
          <div className="mt-3">
            <DriveEmbed url={event.drive_url} />
          </div>
        </section>
      )}
    </article>
  );
}
