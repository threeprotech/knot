import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/avatar";
import type { Skill, SkillCategory } from "@/lib/types";

const CATEGORIES: SkillCategory[] = ["Technical", "Soft", "Domain"];

export default async function AlumniDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth/sign-in?next=/directory/${id}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      *,
      industries ( id, name ),
      profile_skills ( skill_id, skills ( id, name, category ) )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  const skills = ((profile.profile_skills || []) as { skills: Skill }[])
    .map((ps) => ps.skills)
    .filter(Boolean);

  const skillsByCategory = CATEGORIES.map((category) => ({
    category,
    skills: skills.filter((s) => s.category === category),
  })).filter((g) => g.skills.length > 0);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/directory"
        className="text-sm font-medium text-muted transition hover:text-coral"
      >
        ← Back to directory
      </Link>

      <header className="mt-6 flex animate-fade-up gap-4 sm:gap-5">
        <Avatar name={profile.full_name} src={profile.avatar_url} size="lg" />
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
            {profile.full_name}
          </h1>
          {profile.headline && <p className="mt-2 text-lg text-ink-soft">{profile.headline}</p>}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            {profile.industries?.name && <span>{profile.industries.name}</span>}
            {profile.location && <span>{profile.location}</span>}
            {profile.graduation_year && <span>Class of {profile.graduation_year}</span>}
          </div>
        </div>
      </header>

      {profile.bio && (
        <section className="mt-8 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">About</h2>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink-soft">{profile.bio}</p>
        </section>
      )}

      {skillsByCategory.length > 0 && (
        <section className="mt-8 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Skills</h2>
          <div className="mt-4 space-y-4">
            {skillsByCategory.map(({ category, skills: catSkills }) => (
              <div key={category}>
                <p className="mb-2 text-sm font-medium text-ink">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {catSkills.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-md bg-mist-deep/80 px-2.5 py-1 text-sm text-ink-soft"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 animate-fade-up border-t border-line/80 pt-8" style={{ animationDelay: "140ms" }}>
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Contact</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {profile.email && (
            <li>
              <a href={`mailto:${profile.email}`} className="font-medium text-coral hover:text-coral-deep">
                {profile.email}
              </a>
            </li>
          )}
          {profile.phone && (
            <li>
              <a href={`tel:${profile.phone}`} className="text-ink-soft hover:text-coral">
                {profile.phone}
              </a>
            </li>
          )}
          {profile.linkedin_url && (
            <li>
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-soft hover:text-coral"
              >
                LinkedIn profile
              </a>
            </li>
          )}
          {!profile.email && !profile.phone && !profile.linkedin_url && (
            <li className="text-muted">No contact details shared.</li>
          )}
        </ul>
      </section>
    </article>
  );
}
